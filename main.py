from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
import librosa
import soundfile as sf
import io
import json
import tempfile
import os
import re
from typing import Dict, Any
from pydantic import BaseModel

# Import our modules
import sys
sys.path.append(os.path.join(os.path.dirname(__file__)))

from models.transcriber import QuranTranscriber
from preprocessing.noise_robustness import AudioCleaner
from preprocessing.audio_normalization import AudioNormalizer
from evaluation.benchmarks import ModelBenchmarker
from preprocessing.arabic_utils import normalize_arabic, trim_istiadzah
import jiwer

app = FastAPI(
    title="Quran Teaching AI Agent API",
    description="Advanced Quranic recitation analysis and teaching system with tajwid-focused audio processing",
    version="1.0.0"
)

# Initialize transcriber globally
transcriber = QuranTranscriber()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QWERAnalysis(BaseModel):
    qwer: float
    level: str
    error_breakdown: Dict[str, float]
    total_errors: int
    total_phonemes: int
    dominant_error_types: list
    detailed_errors: list

class AudioAnalysisResponse(BaseModel):
    success: bool
    message: str
    analysis: QWERAnalysis | None = None
    audio_info: Dict[str, Any] | None = None

@app.get("/")
async def root():
    return {
        "message": "Quran Teaching AI Agent API",
        "version": "1.0.0",
        "endpoints": {
            "/analyze/audio": "POST - Analyze Quran recitation audio",
            "/health": "GET - Health check"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "modules": {
            "audio_cleaner": "available",
            "audio_normalizer": "available",
            "model_benchmarker": "available"
        }
    }

@app.post("/analyze/audio", response_model=AudioAnalysisResponse)
async def analyze_audio(
    file: UploadFile = File(...),
    expected_text: str = ""
):
    """
    Analyze Quran recitation audio file and return Q-WER analysis
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be an audio file")

        # Create temporary file for audio processing
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            temp_filename = temp_file.name
            # Read and save the uploaded file to temporary location
            contents = await file.read()
            temp_file.write(contents)

        try:
            # Load audio using librosa
            audio_data, sample_rate = librosa.load(temp_filename, sr=22050)

            # Get audio info
            duration = librosa.get_duration(y=audio_data, sr=sample_rate)
            channels = 1 if audio_data.ndim == 1 else audio_data.shape[0]

            # Initialize audio processing components - FIX THE BUG: use correct sample_rate
            cleaner = AudioCleaner(sr=sample_rate)  # Fixed: pass sample_rate to match audio
            normalizer = AudioNormalizer(sample_rate=sample_rate)

            # Process audio: clean, normalize, and analyze
            cleaned_audio = cleaner.remove_stationary_noise(audio_data)
            enhanced_audio = cleaner.enhance_voice(cleaned_audio)
            normalized_audio = normalizer.process_quran_audio(enhanced_audio)

            # Save processed audio to temporary file for transcription
            processed_temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
            processed_temp_file.close()
            import soundfile as sf
            sf.write(processed_temp_file.name, normalized_audio, sample_rate)

            # Transcribe the audio using real Whisper model
            transcription = transcriber.transcribe(processed_temp_file.name)

            # Load reference text from dataset
            dataset_path = os.path.join(os.path.dirname(__file__), "dataset", "surah_fatihah.txt")
            if os.path.exists(dataset_path):
                with open(dataset_path, 'r', encoding='utf-8') as f:
                    reference_text = f.read().strip()
            else:
                # Fallback to simple Arabic text if dataset not found
                reference_text = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ"

            # Trim Isti'adzah from start of transcription to align with reference
            transcription = trim_istiadzah(transcription)

            # Normalize both reference and hypothesis for fair comparison
            normalized_reference = normalize_arabic(reference_text)
            normalized_transcription = normalize_arabic(transcription)

            # Calculate Word Error Rate using jiwer with normalized texts
            wer = jiwer.wer(normalized_reference, normalized_transcription)

            # Convert WER to Q-WER (Quran Weighted Error Rate) - for now using same value
            qwer = wer * 100  # Convert to percentage

            # Determine level based on Q-WER score
            if qwer < 10:
                level = "Advanced"
            elif qwer < 25:
                level = "Intermediate"
            else:
                level = "Beginner"

            # Create error breakdown (simplified for now)
            error_breakdown = {
                "makhraj": qwer * 0.3,  # 30% of errors attributed to articulation
                "tajwid": qwer * 0.4,   # 40% of errors attributed to tajwid
                "harakat": qwer * 0.2,  # 20% of errors attributed to vowels
                "rhythm": qwer * 0.1    # 10% of errors attributed to rhythm
            }

            analysis_result = {
                "qwer": round(qwer, 2),
                "level": level,
                "error_breakdown": error_breakdown,
                "total_errors": int(qwer * len(reference_text.split()) / 100),  # Estimate total errors
                "total_phonemes": len(transcription),
                "dominant_error_types": ["tajwid", "makhraj"],  # Based on highest error values
                "detailed_errors": [
                    {"type": "transcription", "position": 0, "description": f"Transcribed: {normalized_transcription}"},
                    {"type": "reference", "position": 0, "description": f"Expected: {normalized_reference}"},
                    {"type": "raw_transcription", "position": 0, "description": f"Raw Transcribed: {transcription}"},
                    {"type": "raw_reference", "position": 0, "description": f"Raw Expected: {reference_text}"}
                ]
            }

            return AudioAnalysisResponse(
                success=True,
                message="Audio analysis completed successfully",
                analysis=QWERAnalysis(**analysis_result),
                audio_info={
                    "filename": file.filename,
                    "content_type": file.content_type,
                    "duration": round(duration, 2),
                    "sample_rate": sample_rate,
                    "channels": channels,
                    "samples": len(audio_data),
                    "transcription": transcription
                }
            )

        finally:
            # Clean up temporary files
            if os.path.exists(temp_filename):
                os.unlink(temp_filename)
            if 'processed_temp_file' in locals() and os.path.exists(processed_temp_file.name):
                os.unlink(processed_temp_file.name)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")

@app.post("/feedback/generate")
async def generate_feedback(analysis_result: QWERAnalysis):
    """
    Generate personalized feedback based on Q-WER analysis
    """
    try:
        feedback = {
            "overall_assessment": f"Your recitation shows {analysis_result.level.lower()} level performance.",
            "strengths": [],
            "improvements": [],
            "recommendations": []
        }
        
        # Generate feedback based on error breakdown
        if analysis_result.error_breakdown.get("makhraj", 0) > 5:
            feedback["improvements"].append("Focus on proper articulation points (makhraj) for Arabic letters")
            feedback["recommendations"].append("Practice tongue and lip positioning exercises")
        
        if analysis_result.error_breakdown.get("tajwid", 0) > 5:
            feedback["improvements"].append("Work on tajwid rules application")
            feedback["recommendations"].append("Review madd and ghunnah rules")
        
        if analysis_result.error_breakdown.get("harakat", 0) > 3:
            feedback["improvements"].append("Pay attention to diacritic marks (harakat)")
            feedback["recommendations"].append("Practice vowel sounds and timing")
        
        if not feedback["strengths"]:
            feedback["strengths"].append("Good overall recitation rhythm")
        
        return {
            "success": True,
            "feedback": feedback,
            "analysis_summary": analysis_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating feedback: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)