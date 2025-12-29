import sys
import os
import json

# Add project root to python path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from preprocessing.noise_robustness import AudioCleaner
from core_engine.acoustic.feature_extraction import MalaysianAdapter

class QuranInferenceEngine:
    """
    [Al-Mu'allim Module]
    Orchestrates the analysis pipeline.
    """
    def __init__(self):
        print("🛠️ Initializing Quran Pulse Engine...")
        self.cleaner = AudioCleaner()
        self.acoustic = MalaysianAdapter()
        
    def analyze_recitation(self, audio_path: str):
        print(f"🎤 Processing: {audio_path}")
        
        # Step 1: Clean Audio (Al-Musami)
        try:
            # In a real scenario, we would save the cleaned file, 
            # but here we just verify it loads
            _ = self.cleaner.load_and_clean(audio_path)
        except Exception as e:
            return {"status": "error", "message": f"Audio load failed: {str(e)}"}
            
        # Step 2: Acoustic Analysis (Al-Musami)
        # Analyzing first 2 seconds as a sample
        features = self.acoustic.analyze_segment(audio_path, 0.0, 2.0)
        
        if "error" in features:
            return {"status": "error", "message": features["error"]}

        # Step 3: Check Specific Rules (Malaysian Context)
        is_ain_good = self.acoustic.check_ain_precision(features.get('formants', {}))
        
        # Construct Feedback
        feedback = {
            "overall_quality": "Clear" if features.get('pitch_stability', 0) > 0.7 else "Shaky",
            "specific_checks": {
                "Ain_Articulation": "Excellent (Halk is open)" if is_ain_good else "Needs improvement (Sound is too frontal/Alif-like)",
                "Breath_Control": "Good" if features.get('breathiness', 0) < 0.1 else "Too airy (Check Hams)"
            },
            "raw_metrics": features
        }
        
        return {"status": "success", "data": feedback}

if __name__ == "__main__":
    # CLI Test Block
    if len(sys.argv) < 2:
        print("Usage: python core_engine/inference.py <path_to_audio.wav>")
    else:
        engine = QuranInferenceEngine()
        result = engine.analyze_recitation(sys.argv[1])
        print(json.dumps(result, indent=2))
