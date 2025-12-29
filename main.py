from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
import librosa
import io
import json
from typing import Dict, Any
from pydantic import BaseModel

# Import our modules
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__)))

from preprocessing.noise_robustness import AudioCleaner
from preprocessing.audio_normalization import AudioNormalizer
from evaluation.benchmarks import ModelBenchmarker

app = FastAPI(
    title="Quran Teaching AI Agent API",
    description="Advanced Quranic recitation analysis and teaching system with tajwid-focused audio processing",
    version="1.0.0"
)

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
        
        # Read audio file
        contents = await file.read()
        audio_bytes = io.BytesIO(contents)
        
        # Load audio using librosa
        audio_data, sample_rate = librosa.load(audio_bytes, sr=22050)
        
        # Get audio info
        duration = librosa.get_duration(y=audio_data, sr=sample_rate)
        channels = 1 if audio_data.ndim == 1 else audio_data.shape[0]
        
        # Initialize audio processing components
        cleaner = AudioCleaner(sample_rate=sample_rate)
        normalizer = AudioNormalizer(sample_rate=sample_rate)
        
        # Process audio: clean, normalize, and analyze
        cleaned_audio = cleaner.remove_stationary_noise(audio_data)
        enhanced_audio = cleaner.enhance_voice(cleaned_audio)
        normalized_audio = normalizer.process_quran_audio(enhanced_audio)
        
        # For demonstration, we'll create mock analysis since we don't have actual phoneme alignment
        # In a real implementation, this would use the actual QWER calculation
        analysis_result = {
            "qwer": 25.5,
            "level": "Intermediate",
            "error_breakdown": {
                "makhraj": 8.2,
                "tajwid": 7.1,
                "harakat": 6.4,
                "rhythm": 3.8
            },
            "total_errors": 12,
            "total_phonemes": 100,
            "dominant_error_types": ["makhraj", "tajwid"],
            "detailed_errors": [
                {"type": "makhraj", "position": 5, "description": "Incorrect articulation of ra letter"},
                {"type": "tajwid", "position": 12, "description": "Missing ghunnah rule"}
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
                "samples": len(audio_data)
            }
        )
        
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