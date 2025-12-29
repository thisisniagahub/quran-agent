"""
Audio Normalization Module for Quran Teaching AI

This module handles audio preprocessing for Quranic recitation analysis,
including normalization, format conversion, and quality enhancement
specifically designed for Malaysian environments and Islamic educational contexts.

Features:
- LUFS-based normalization for consistent loudness
- Dynamic range compression for Quran recitation
- Format conversion and quality enhancement
- Multi-channel to mono conversion
- Silence trimming and level adjustment
"""

import numpy as np
import librosa
from pydub import AudioSegment
from pydub.effects import normalize as pydub_normalize
import soundfile as sf
from typing import Tuple, Optional, Union
import warnings
from scipy import signal
import pyloudnorm as pyln


class AudioNormalizer:
    """
    Audio normalization class specifically designed for Quranic recitation
    with focus on maintaining the spiritual and educational quality of the audio.
    """

    def __init__(self, target_lufs: float = -23.0, sample_rate: int = 22050):
        """
        Initialize the AudioNormalizer with target loudness level.

        Args:
            target_lufs: Target loudness in LUFS (default -23.0 for Quran recitation)
            sample_rate: Target sample rate for processing
        """
        self.target_lufs = target_lufs
        self.sample_rate = sample_rate
        self.meter = pyln.Meter(self.sample_rate)  # Create BS.1770 meter

    def normalize_lufs(self, audio: np.ndarray) -> np.ndarray:
        """
        Normalize audio to target LUFS level using pyloudnorm.

        Args:
            audio: Input audio signal as numpy array

        Returns:
            LUFS-normalized audio
        """
        # Measure loudness
        loudness = self.meter.integrated_loudness(audio)

        # Calculate required gain
        gain = self.target_lufs - loudness

        # Apply gain
        normalized_audio = pyln.normalize.loudness(audio, loudness, self.target_lufs)

        return normalized_audio

    def compress_dynamic_range(self, audio: np.ndarray,
                             threshold_db: float = -20.0,
                             ratio: float = 3.0,
                             attack_time: float = 0.01,
                             release_time: float = 0.1) -> np.ndarray:
        """
        Apply dynamic range compression suitable for Quranic recitation.
        Maintains the spiritual quality while ensuring consistent audibility.

        Args:
            audio: Input audio signal
            threshold_db: Threshold level in dB
            ratio: Compression ratio
            attack_time: Attack time in seconds
            release_time: Release time in seconds

        Returns:
            Compressed audio signal
        """
        # Convert to float32 for processing
        audio = audio.astype(np.float32)

        # Calculate envelope using a simple peak detector
        threshold = 10 ** (threshold_db / 20.0)

        # Simple compressor implementation
        compressed_audio = np.zeros_like(audio)
        envelope = 0.0

        # Attack and release coefficients
        attack_coeff = np.exp(-1.0 / (attack_time * self.sample_rate))
        release_coeff = np.exp(-1.0 / (release_time * self.sample_rate))

        for i in range(len(audio)):
            current_sample = abs(audio[i])

            # Update envelope
            if current_sample > envelope:
                envelope = attack_coeff * envelope + (1 - attack_coeff) * current_sample
            else:
                envelope = release_coeff * envelope + (1 - release_coeff) * current_sample

            # Apply compression
            if envelope > threshold:
                gain = 1.0 + (1.0 / ratio - 1.0) * (envelope - threshold) / envelope
                compressed_audio[i] = audio[i] * gain
            else:
                compressed_audio[i] = audio[i]

        return compressed_audio

    def convert_to_mono(self, audio: np.ndarray) -> np.ndarray:
        """
        Convert multi-channel audio to mono.

        Args:
            audio: Input audio (could be mono or multi-channel)

        Returns:
            Mono audio signal
        """
        if audio.ndim > 1:
            # Average all channels to create mono
            return np.mean(audio, axis=1)
        else:
            return audio

    def trim_silence(self, audio: np.ndarray,
                    threshold_db: float = -40.0,
                    min_duration: float = 0.1) -> np.ndarray:
        """
        Trim leading and trailing silence from audio.

        Args:
            audio: Input audio signal
            threshold_db: Silence threshold in dB
            min_duration: Minimum duration to keep silent sections

        Returns:
            Audio with leading/trailing silence removed
        """
        threshold = 10 ** (threshold_db / 20.0)

        # Find non-silent sections
        non_silent = np.where(np.abs(audio) > threshold)[0]

        if len(non_silent) == 0:
            # All audio is silent, return original
            return audio

        start_idx = non_silent[0]
        end_idx = non_silent[-1] + 1

        # Add small buffer to avoid cutting off abruptly
        buffer_samples = int(0.05 * self.sample_rate)  # 50ms buffer
        start_idx = max(0, start_idx - buffer_samples)
        end_idx = min(len(audio), end_idx + buffer_samples)

        return audio[start_idx:end_idx]

    def adjust_gain(self, audio: np.ndarray, target_peak: float = 0.9) -> np.ndarray:
        """
        Adjust gain to prevent clipping while maintaining dynamic range.

        Args:
            audio: Input audio signal
            target_peak: Target peak amplitude (0.0 to 1.0)

        Returns:
            Gain-adjusted audio
        """
        current_peak = np.max(np.abs(audio))

        if current_peak > 0:
            gain_factor = target_peak / current_peak
            return audio * gain_factor
        else:
            return audio

    def process_quran_audio(self, audio: np.ndarray) -> np.ndarray:
        """
        Complete processing pipeline for Quranic recitation audio.
        Combines normalization, compression, and quality enhancement.

        Args:
            audio: Input audio signal as numpy array

        Returns:
            Processed and normalized audio
        """
        # Step 1: Convert to mono if multi-channel
        audio = self.convert_to_mono(audio)

        # Step 2: Trim leading/trailing silence
        audio = self.trim_silence(audio)

        # Step 3: Apply dynamic range compression
        audio = self.compress_dynamic_range(audio)

        # Step 4: Normalize to target LUFS level
        audio = self.normalize_lufs(audio)

        # Step 5: Final gain adjustment to prevent clipping
        audio = self.adjust_gain(audio, target_peak=0.95)

        return audio


def normalize_quran_audio(input_path: str,
                         output_path: Optional[str] = None,
                         target_lufs: float = -23.0,
                         sample_rate: int = 22050) -> Tuple[np.ndarray, int]:
    """
    Convenience function to normalize Quranic audio from file path.

    Args:
        input_path: Path to input audio file
        output_path: Optional path to save normalized audio
        target_lufs: Target loudness level in LUFS
        sample_rate: Target sample rate

    Returns:
        Tuple of (normalized_audio, sample_rate)
    """
    # Load audio file
    audio, loaded_sr = librosa.load(input_path, sr=sample_rate, mono=False)

    # Initialize normalizer
    normalizer = AudioNormalizer(target_lufs=target_lufs, sample_rate=sample_rate)

    # Process the audio
    normalized_audio = normalizer.process_quran_audio(audio)

    # Save if output path provided
    if output_path:
        sf.write(output_path, normalized_audio, sample_rate)

    return normalized_audio, sample_rate


def batch_normalize_quran_audio(input_paths: list,
                               output_dir: str,
                               target_lufs: float = -23.0) -> list:
    """
    Batch normalize multiple Quranic audio files.

    Args:
        input_paths: List of input audio file paths
        output_dir: Directory to save normalized files
        target_lufs: Target loudness level in LUFS

    Returns:
        List of output file paths
    """
    import os
    from pathlib import Path

    output_paths = []
    normalizer = AudioNormalizer(target_lufs=target_lufs)

    for input_path in input_paths:
        # Generate output path
        input_name = Path(input_path).stem
        output_path = os.path.join(output_dir, f"{input_name}_normalized.wav")

        # Load and process
        audio, sr = librosa.load(input_path, sr=normalizer.sample_rate)
        normalized_audio = normalizer.process_quran_audio(audio)

        # Save
        sf.write(output_path, normalized_audio, sr)
        output_paths.append(output_path)

        print(f"Processed: {input_path} -> {output_path}")

    return output_paths


def analyze_audio_quality(audio: np.ndarray, sample_rate: int = 22050) -> dict:
    """
    Analyze audio quality metrics for Quranic recitation.

    Args:
        audio: Audio signal as numpy array
        sample_rate: Sample rate of audio

    Returns:
        Dictionary containing quality metrics
    """
    # Calculate various audio quality metrics
    metrics = {}

    # Loudness
    meter = pyln.Meter(sample_rate)
    metrics['integrated_loudness'] = meter.integrated_loudness(audio)

    # Peak level
    metrics['peak_level_db'] = 20 * np.log10(np.max(np.abs(audio)) + 1e-8)

    # RMS level
    rms = np.sqrt(np.mean(audio**2))
    metrics['rms_level_db'] = 20 * np.log10(rms + 1e-8)

    # Dynamic range
    peak = np.max(np.abs(audio))
    rms_short = []
    frame_length = 1024
    hop_length = 512

    for i in range(0, len(audio) - frame_length, hop_length):
        frame = audio[i:i + frame_length]
        rms_frame = np.sqrt(np.mean(frame**2))
        rms_short.append(rms_frame)

    if rms_short:
        rms_min = np.min(rms_short)
        metrics['dynamic_range_db'] = 20 * np.log10(peak / (rms_min + 1e-8)) if rms_min > 0 else float('inf')
    else:
        metrics['dynamic_range_db'] = 0

    # Zero crossing rate (for voice detection)
    zcr = np.mean(librosa.feature.zero_crossing_rate(audio))
    metrics['zero_crossing_rate'] = zcr

    return metrics


# Example usage:
if __name__ == "__main__":
    # Example of how to use the AudioNormalizer
    # This would typically be used in the Quran Teaching AI pipeline

    # Create sample audio (for demonstration)
    sample_rate = 22050
    duration = 3.0  # 3 seconds
    t = np.linspace(0, duration, int(sample_rate * duration))

    # Create sample Quran recitation-like audio with varying dynamics
    sample_audio = 0.5 * np.sin(2 * np.pi * 220 * t)  # 220Hz tone
    # Add some variation to simulate recitation dynamics
    envelope = 0.5 + 0.5 * np.sin(2 * np.pi * 0.5 * t)  # Slow variation
    sample_audio = sample_audio * envelope

    # Add some noise to make it more realistic
    noise = 0.05 * np.random.normal(0, 1, len(sample_audio))
    noisy_audio = sample_audio + noise

    # Initialize the normalizer
    normalizer = AudioNormalizer(target_lufs=-23.0, sample_rate=sample_rate)

    # Process the audio
    normalized_audio = normalizer.process_quran_audio(noisy_audio)

    print(f"Original audio shape: {noisy_audio.shape}")
    print(f"Normalized audio shape: {normalized_audio.shape}")

    # Analyze quality
    original_metrics = analyze_audio_quality(noisy_audio, sample_rate)
    normalized_metrics = analyze_audio_quality(normalized_audio, sample_rate)

    print("\nOriginal Audio Metrics:")
    for key, value in original_metrics.items():
        print(f"  {key}: {value:.2f}")

    print("\nNormalized Audio Metrics:")
    for key, value in normalized_metrics.items():
        print(f"  {key}: {value:.2f}")

    print("\nAudioNormalizer methods available:")
    print("- normalize_lufs(): LUFS-based loudness normalization")
    print("- compress_dynamic_range(): Dynamic range compression")
    print("- convert_to_mono(): Multi-channel to mono conversion")
    print("- trim_silence(): Remove leading/trailing silence")
    print("- adjust_gain(): Peak gain adjustment")
    print("- process_quran_audio(): Complete pipeline")
    print("- analyze_audio_quality(): Quality metrics analysis")