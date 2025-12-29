import numpy as np
import librosa
from scipy.signal import medfilt
from typing import Dict, Any

class TajweedAcoustics:
    """
    [Al-Musami Module]
    Core acoustic analysis for Quranic recitation.
    """

    def __init__(self, sr: int = 16000):
        self.sr = sr

    def analyze_segment(self, audio_path: str, start_time: float, end_time: float) -> Dict[str, Any]:
        """
        Main entry point to analyze a specific phoneme/word segment.
        """
        # Load specific segment
        duration = end_time - start_time
        if duration <= 0: return {"error": "Invalid duration"}
        
        y, _ = librosa.load(audio_path, sr=self.sr, offset=start_time, duration=duration)
        
        if len(y) == 0:
            return {"error": "Empty segment"}

        return {
            "pitch_stability": self._measure_pitch_stability(y),
            "formants": self._extract_formants(y),
            "breathiness": self._measure_breathiness(y),
            "intensity_profile": self._measure_intensity(y),
            "duration_ms": len(y) / self.sr * 1000
        }

    def _measure_pitch_stability(self, y: np.ndarray) -> float:
        """ Checks for 'Madd' (elongation) consistency. """
        # Using pyin for robust pitch detection
        f0, voiced_flag, voiced_probs = librosa.pyin(y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
        valid_f0 = f0[~np.isnan(f0)]
        
        if len(valid_f0) < 5: return 0.0
        
        # Standard deviation (Low = Stable)
        semitone_std = np.std(librosa.hz_to_midi(valid_f0))
        return max(0.0, 1.0 - (semitone_std / 2.0))

    def _extract_formants(self, y: np.ndarray) -> Dict[str, float]:
        """ Uses LPC to find F1 (Throat) and F2 (Mouth shape). """
        y_pre = librosa.effects.preemphasis(y)
        n_coeff = 2 + int(self.sr / 1000)
        a = librosa.lpc(y_pre, order=n_coeff)
        roots = np.roots(a)
        
        # Filter valid roots
        roots = roots[np.imag(roots) >= 0]
        angz = np.arctan2(np.imag(roots), np.real(roots))
        freqs = angz * (self.sr / (2 * np.pi))
        
        sorted_freqs = np.sort(freqs)
        formants = [f for f in sorted_freqs if 90 < f < 4000]
        
        return {
            "f1": formants[0] if len(formants) > 0 else 0.0,
            "f2": formants[1] if len(formants) > 1 else 0.0
        }

    def _measure_breathiness(self, y: np.ndarray) -> float:
        """ Zero Crossing Rate for Hams detection. """
        return float(np.mean(librosa.feature.zero_crossing_rate(y)))

    def _measure_intensity(self, y: np.ndarray) -> float:
        """ RMS Energy for Qalqalah/Ghunnah. """
        return float(np.mean(librosa.feature.rms(y=y)))

class MalaysianAdapter(TajweedAcoustics):
    """
    [Al-Musami Specialization]
    Adapts thresholds for Malaysian accents.
    """
    def check_ain_precision(self, formants: Dict[str, float]) -> bool:
        """
        Malaysians often swap 'Ain' (ع) with 'Alif' (أ) or 'Nga'.
        'Ain' requires pharyngeal constriction (High F1).
        """
        # Threshold: F1 > 550Hz is typically a good Ain for adults
        return formants['f1'] > 550.0

if __name__ == "__main__":
    print("✅ Al-Musami Acoustic Module Ready.")
