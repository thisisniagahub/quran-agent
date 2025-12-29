"""
Quranic Arabic Forced Alignment Module
Based on Montreal Forced Aligner (MFA) principles with Quranic-specific adaptations
"""

import librosa
import numpy as np
from typing import List, Dict, Tuple, Optional
import re
from dataclasses import dataclass
from enum import Enum


class TajwidRule(Enum):
    MADD = "madd"
    GHUNNAH = "ghunnah"
    IKHFA = "ikhfa"
    IDGHAM = "idgham"
    QALQALAH = "qalqalah"
    WAQF = "waqf"
    NORMAL = "normal"


@dataclass
class PhonemeAlignment:
    phoneme: str
    start_time: float
    end_time: float
    confidence: float
    tajwid_rule: TajwidRule
    harakat: str
    duration: float


@dataclass
class TajwidBoundary:
    start_time: float
    end_time: float
    rule: TajwidRule
    confidence: float
    parameters: Dict


class QuranForcedAligner:
    def __init__(self):
        # Quran-specific phoneme inventory
        self.arabic_phonemes = {
            # Consonants
            'b': {'makhraj': 'lips', 'type': 'stop'},
            't': {'makhraj': 'teeth', 'type': 'stop'},
            'th': {'makhraj': 'teeth', 'type': 'fricative'},
            'j': {'makhraj': 'palate', 'type': 'affricate'},
            '7': {'makhraj': 'pharynx', 'type': 'fricative'},
            'kh': {'makhraj': 'throat', 'type': 'fricative'},
            'd': {'makhraj': 'teeth', 'type': 'stop'},
            'dh': {'makhraj': 'teeth', 'type': 'fricative'},
            'r': {'makhraj': 'tongue_tip', 'type': 'trill'},
            'z': {'makhraj': 'teeth', 'type': 'fricative'},
            's': {'makhraj': 'teeth', 'type': 'fricative'},
            'sh': {'makhraj': 'teeth', 'type': 'fricative'},
            's6': {'makhraj': 'teeth', 'type': 'fricative'},
            'd6': {'makhraj': 'teeth', 'type': 'fricative'},
            't6': {'makhraj': 'teeth', 'type': 'fricative'},
            '9': {'makhraj': 'throat', 'type': 'fricative'},
            'gh': {'makhraj': 'throat', 'type': 'fricative'},
            'f': {'makhraj': 'lips', 'type': 'fricative'},
            'q': {'makhraj': 'throat', 'type': 'stop'},
            'k': {'makhraj': 'throat', 'type': 'stop'},
            'l': {'makhraj': 'tongue', 'type': 'lateral'},
            'm': {'makhraj': 'lips', 'type': 'nasal'},
            'n': {'makhraj': 'tongue', 'type': 'nasal'},
            'h': {'makhraj': 'throat', 'type': 'fricative'},
            '3': {'makhraj': 'throat', 'type': 'glottal_stop'},
            '7': {'makhraj': 'pharynx', 'type': 'fricative'},
            'y': {'makhraj': 'palate', 'type': 'approximant'},
            'w': {'makhraj': 'lips', 'type': 'approximant'},
        }
        
        # Harakat patterns
        self.harakat_patterns = {
            'fatha': 'َ',
            'kasra': 'ِ',
            'damma': 'ُ',
            'sukun': 'ْ',
            'shadda': 'ّ',
            'tanwin_fath': 'ً',
            'tanwin_kasr': 'ٍ',
            'tanwin_damm': 'ٌ',
        }

    def load_audio(self, audio_path: str) -> Tuple[np.ndarray, int]:
        """Load audio file and return waveform and sample rate"""
        y, sr = librosa.load(audio_path, sr=None)
        return y, sr

    def load_uthmani_text(self, text: str) -> List[str]:
        """Load and process Uthmani mushaf text"""
        # Remove diacritics and normalize
        clean_text = re.sub(r'[\u064B-\u065F\u0670\u06D6-\u06ED]', '', text)
        # Split into words while preserving structure
        words = re.findall(r'[\u0621-\u064A\u0671-\u06B7\u06BA-\u06FF]+', clean_text)
        return words

    def extract_phoneme_features(self, y: np.ndarray, sr: int) -> Dict:
        """Extract phoneme-level features using librosa"""
        # MFCC features for phoneme classification
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        
        # Spectral features
        spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
        zero_crossing_rate = librosa.feature.zero_crossing_rate(y)[0]
        
        return {
            'mfccs': mfccs,
            'spectral_centroids': spectral_centroids,
            'spectral_rolloff': spectral_rolloff,
            'zero_crossing_rate': zero_crossing_rate
        }

    def detect_tajwid_boundaries(self, y: np.ndarray, sr: int, alignment: List[PhonemeAlignment]) -> List[TajwidBoundary]:
        """Detect tajwid rule boundaries in audio"""
        boundaries = []
        
        for i, phoneme_align in enumerate(alignment):
            segment = y[int(phoneme_align.start_time * sr):int(phoneme_align.end_time * sr)]
            
            # Detect nasal energy for ghunnah
            if self._detect_ghunnah(segment, sr):
                boundaries.append(TajwidBoundary(
                    start_time=phoneme_align.start_time,
                    end_time=phoneme_align.end_time,
                    rule=TajwidRule.GHUNNAH,
                    confidence=0.9,
                    parameters={'nasal_energy': self._calculate_nasal_energy(segment)}
                ))
            
            # Detect madd duration
            elif self._detect_madd(phoneme_align.phoneme, phoneme_align.duration):
                boundaries.append(TajwidBoundary(
                    start_time=phoneme_align.start_time,
                    end_time=phoneme_align.end_time,
                    rule=TajwidRule.MADD,
                    confidence=0.85,
                    parameters={'expected_duration': 2.0, 'actual_duration': phoneme_align.duration}
                ))
            
            # Detect ikhfa conditions
            elif self._detect_ikhfa(phoneme_align.phoneme):
                boundaries.append(TajwidBoundary(
                    start_time=phoneme_align.start_time,
                    end_time=phoneme_align.end_time,
                    rule=TajwidRule.IKHFA,
                    confidence=0.8,
                    parameters={}
                ))
            
            # Detect idgham conditions
            elif self._detect_idgham(alignment, i):
                boundaries.append(TajwidBoundary(
                    start_time=phoneme_align.start_time,
                    end_time=phoneme_align.end_time,
                    rule=TajwidRule.IDGHAM,
                    confidence=0.88,
                    parameters={}
                ))
            
            # Detect qalqalah
            elif self._detect_qalqalah(phoneme_align.phoneme):
                boundaries.append(TajwidBoundary(
                    start_time=phoneme_align.start_time,
                    end_time=phoneme_align.end_time,
                    rule=TajwidRule.QALQALAH,
                    confidence=0.75,
                    parameters={'intensity': self._calculate_qalqalah_intensity(segment)}
                ))

        return boundaries

    def _detect_ghunnah(self, segment: np.ndarray, sr: int) -> bool:
        """Detect ghunnah based on nasal formant energy"""
        # Calculate spectral energy in nasal frequency bands
        fft = np.fft.fft(segment)
        freqs = np.fft.fftfreq(len(segment), 1/sr)
        
        # Nasal formant typically around 250-500 Hz
        nasal_energy = np.sum(np.abs(fft[(freqs >= 250) & (freqs <= 500)]))
        total_energy = np.sum(np.abs(fft))
        
        return (nasal_energy / total_energy) > 0.15  # Threshold for ghunnah detection

    def _calculate_nasal_energy(self, segment: np.ndarray) -> float:
        """Calculate nasal energy ratio"""
        fft = np.fft.fft(segment)
        freqs = np.fft.fftfreq(len(segment), 1/sr)
        
        nasal_energy = np.sum(np.abs(fft[(freqs >= 250) & (freqs <= 500)]))
        total_energy = np.sum(np.abs(fft))
        
        return nasal_energy / total_energy if total_energy > 0 else 0.0

    def _detect_madd(self, phoneme: str, duration: float) -> bool:
        """Detect madd based on prolonged vowel sounds"""
        madd_letters = ['ا', 'و', 'ي']  # alif, waw, ya
        return phoneme in madd_letters and duration > 1.5  # 1.5x normal duration

    def _detect_ikhfa(self, phoneme: str) -> bool:
        """Detect ikhfa conditions (noon/sukun before specific letters)"""
        ikhfa_letters = ['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك']
        # This would need more context from surrounding phonemes
        return phoneme in ikhfa_letters

    def _detect_idgham(self, alignment: List[PhonemeAlignment], index: int) -> bool:
        """Detect idgham conditions"""
        if index < len(alignment) - 1:
            current = alignment[index].phoneme
            next_phoneme = alignment[index + 1].phoneme
            
            # Idgham without ghunnah conditions
            idgham_pairs = [
                ('ن', 'ي'), ('ن', 'و'), ('ن', 'م'), ('ل', 'ل'), ('ر', 'ر')
            ]
            
            return (current, next_phoneme) in idgham_pairs
        return False

    def _detect_qalqalah(self, phoneme: str) -> bool:
        """Detect qalqalah letters"""
        qalqalah_letters = ['ب', 'ج', 'د', 'ط', 'ق']
        return phoneme in qalqalah_letters

    def _calculate_qalqalah_intensity(self, segment: np.ndarray) -> float:
        """Calculate qalqalah intensity based on acoustic features"""
        # Calculate intensity based on amplitude variations
        envelope = np.abs(librosa.effects.preemphasis(segment))
        return float(np.std(envelope))

    def align_audio_to_text(self, audio_path: str, uthmani_text: str) -> List[PhonemeAlignment]:
        """Main alignment function - simplified version"""
        y, sr = self.load_audio(audio_path)
        words = self.load_uthmani_text(uthmani_text)
        
        # Extract features
        features = self.extract_phoneme_features(y, sr)
        
        # Simplified alignment - in reality, this would use HMM or CTC models
        # For demonstration, we'll create mock alignments
        alignments = []
        
        # Calculate approximate timing based on audio length and text length
        audio_duration = len(y) / sr
        total_phonemes = sum(len(word) for word in words)
        avg_phoneme_duration = audio_duration / max(total_phonemes, 1)
        
        current_time = 0.0
        for word in words:
            for char in word:
                duration = avg_phoneme_duration
                alignments.append(PhonemeAlignment(
                    phoneme=char,
                    start_time=current_time,
                    end_time=current_time + duration,
                    confidence=0.85,
                    tajwid_rule=TajwidRule.NORMAL,
                    harakat='none',
                    duration=duration
                ))
                current_time += duration
        
        return alignments

    def analyze_quran_recitation(self, audio_path: str, uthmani_text: str) -> Dict:
        """Complete analysis of Quran recitation"""
        y, sr = self.load_audio(audio_path)
        alignments = self.align_audio_to_text(audio_path, uthmani_text)
        boundaries = self.detect_tajwid_boundaries(y, sr, alignments)
        
        return {
            'phoneme_alignments': alignments,
            'tajwid_boundaries': boundaries,
            'audio_features': self.extract_phoneme_features(y, sr),
            'analysis_timestamp': librosa.get_duration(y=y, sr=sr)
        }


# Usage example:
"""
aligner = QuranForcedAligner()
result = aligner.analyze_quran_recitation(
    "recitation.wav", 
    "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
)
print(result)
"""