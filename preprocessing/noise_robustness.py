"""
Noise Robustness Module for Quran Teaching AI

This module handles noise robustness for Quranic recitation in Malaysian environments,
specifically addressing common noise sources like fans, background chatter, and
environmental sounds in mosques and homes.

Features:
- Stationary noise removal using spectral gating
- Voice enhancement with bandpass filtering
- Silence interval detection for verse segmentation
- Malaysian environment adaptation
"""

import numpy as np
import librosa
import noisereduce as nr
from scipy import signal
from typing import Tuple, Optional
import warnings


class AudioCleaner:
    """
    Audio cleaning and noise reduction class specifically designed for
    Quranic recitation in Malaysian environments.
    """

    def __init__(self, sample_rate: int = 22050, hop_length: int = 512):
        """
        Initialize the AudioCleaner with default parameters.

        Args:
            sample_rate: Target sample rate for processing
            hop_length: Hop length for STFT operations
        """
        self.sample_rate = sample_rate
        self.hop_length = hop_length
        self.noise_profile_duration = 0.5  # 0.5 seconds for noise profiling

    def remove_stationary_noise(self, audio: np.ndarray) -> np.ndarray:
        """
        Remove stationary noise by profiling the first 0.5 seconds of audio
        as noise and applying spectral gating using noisereduce.

        Args:
            audio: Input audio signal as numpy array

        Returns:
            Cleaned audio with stationary noise removed
        """
        # Calculate number of samples for noise profiling
        noise_samples = int(self.noise_profile_duration * self.sample_rate)

        # Ensure we have enough audio for noise profiling
        if len(audio) < noise_samples:
            warnings.warn("Audio too short for noise profiling, returning original")
            return audio

        # Extract the first 0.5 seconds as noise profile
        noise_profile = audio[:noise_samples]

        # Apply noise reduction using spectral gating
        # The stationary=True flag indicates that noise is stationary
        cleaned_audio = nr.reduce_noise(
            y=audio,
            sr=self.sample_rate,
            y_noise=noise_profile,
            stationary=True,
            prop_decrease=0.85,  # Aggressive noise reduction
            n_fft=2048,
            hop_length=self.hop_length
        )

        return cleaned_audio

    def enhance_voice(self, audio: np.ndarray) -> np.ndarray:
        """
        Apply bandpass filtering to focus on human voice frequencies,
        removing AC hum (50Hz) and high-frequency hiss common in Malaysian environments.

        Args:
            audio: Input audio signal as numpy array

        Returns:
            Audio with enhanced voice frequencies (80Hz - 8000Hz)
        """
        # Define voice frequency range
        low_freq = 80.0   # Lower bound for human voice
        high_freq = 8000.0  # Upper bound for human voice

        # Design bandpass filter using scipy
        nyquist = self.sample_rate / 2.0
        low = low_freq / nyquist
        high = high_freq / nyquist

        # Create Butterworth bandpass filter (order 6 for good roll-off)
        b, a = signal.butter(6, [low, high], btype='band', analog=False)

        # Apply the filter to the audio
        enhanced_audio = signal.filtfilt(b, a, audio)

        # Normalize to prevent clipping
        enhanced_audio = enhanced_audio / max(0.01, np.max(np.abs(enhanced_audio)))

        return enhanced_audio

    def detect_silence_intervals(self, audio: np.ndarray,
                               threshold_db: float = -40.0,
                               min_silence_duration: float = 0.1) -> list:
        """
        Detect silence intervals in audio to help split Quranic verses.
        This is specific to the "Quran Pulse" project for verse segmentation.

        Args:
            audio: Input audio signal as numpy array
            threshold_db: Silence threshold in dB (default -40dB)
            min_silence_duration: Minimum silence duration to detect (in seconds)

        Returns:
            List of tuples containing (start_time, end_time) of silence intervals
        """
        # Convert dB threshold to amplitude
        threshold = 10 ** (threshold_db / 20.0)

        # Calculate frame length for minimum silence duration
        min_silence_frames = int(min_silence_duration * self.sample_rate)

        # Calculate RMS energy for each frame
        frame_length = 1024
        hop_length = 512

        # Compute RMS energy for each frame
        frames = librosa.util.frame(audio, frame_length=frame_length, hop_length=hop_length)
        rms_energy = np.sqrt(np.mean(frames**2, axis=0))

        # Find frames below threshold (silence frames)
        silence_frames = rms_energy < threshold

        # Group consecutive silence frames into intervals
        silence_intervals = []
        current_start = None

        for i, is_silence in enumerate(silence_frames):
            if is_silence and current_start is None:
                # Start of a silence interval
                current_start = i
            elif not is_silence and current_start is not None:
                # End of a silence interval
                duration_frames = i - current_start
                if duration_frames >= min_silence_frames * hop_length / frame_length:
                    start_time = current_start * hop_length / self.sample_rate
                    end_time = i * hop_length / self.sample_rate
                    silence_intervals.append((start_time, end_time))
                current_start = None

        # Handle case where silence continues to the end
        if current_start is not None:
            duration_frames = len(silence_frames) - current_start
            if duration_frames >= min_silence_frames * hop_length / frame_length:
                start_time = current_start * hop_length / self.sample_rate
                end_time = len(silence_frames) * hop_length / self.sample_rate
                silence_intervals.append((start_time, end_time))

        return silence_intervals

    def process_quran_audio(self, audio: np.ndarray) -> Tuple[np.ndarray, list]:
        """
        Complete processing pipeline for Quranic recitation audio.
        Combines noise removal, voice enhancement, and silence detection.

        Args:
            audio: Input audio signal as numpy array

        Returns:
            Tuple of (cleaned_audio, silence_intervals)
        """
        # Step 1: Remove stationary noise (fans, AC hum, background noise)
        audio_cleaned = self.remove_stationary_noise(audio)

        # Step 2: Enhance voice frequencies (80Hz - 8000Hz)
        audio_enhanced = self.enhance_voice(audio_cleaned)

        # Step 3: Detect silence intervals for verse segmentation
        silence_intervals = self.detect_silence_intervals(audio_enhanced)

        return audio_enhanced, silence_intervals


def enhance_quran_audio(input_path: str,
                       output_path: Optional[str] = None,
                       environment_type: str = "home",
                       snr_threshold: float = 15.0) -> np.ndarray:
    """
    Convenience function to enhance Quranic audio from file path.

    Args:
        input_path: Path to input audio file
        output_path: Optional path to save enhanced audio
        environment_type: Type of environment ('home', 'mosque', 'outdoor')
        snr_threshold: SNR threshold for processing

    Returns:
        Enhanced audio as numpy array
    """
    # Load audio file
    audio, sample_rate = librosa.load(input_path, sr=22050)

    # Initialize cleaner
    cleaner = AudioCleaner(sample_rate=sample_rate)

    # Process the audio
    enhanced_audio, silence_intervals = cleaner.process_quran_audio(audio)

    # Save if output path provided
    if output_path:
        import soundfile as sf
        sf.write(output_path, enhanced_audio, sample_rate)

    return enhanced_audio


# Example usage:
if __name__ == "__main__":
    # Example of how to use the AudioCleaner
    # This would typically be used in the Quran Teaching AI pipeline

    # Create sample audio (for demonstration)
    sample_rate = 22050
    duration = 5.0  # 5 seconds
    t = np.linspace(0, duration, int(sample_rate * duration))

    # Create sample audio with some noise
    sample_audio = np.sin(2 * np.pi * 440 * t)  # 440Hz tone
    noise = np.random.normal(0, 0.1, len(sample_audio))
    noisy_audio = sample_audio + noise

    # Initialize the cleaner
    cleaner = AudioCleaner(sample_rate=sample_rate)

    # Process the audio
    cleaned_audio, silence_intervals = cleaner.process_quran_audio(noisy_audio)

    print(f"Original audio length: {len(noisy_audio) / sample_rate:.2f}s")
    print(f"Cleaned audio length: {len(cleaned_audio) / sample_rate:.2f}s")
    print(f"Detected {len(silence_intervals)} silence intervals")
    print("Silence intervals (start_time, end_time):")
    for start, end in silence_intervals:
        print(f"  {start:.2f}s - {end:.2f}s")

    print("\nAudioCleaner methods available:")
    print("- remove_stationary_noise(): Removes stationary noise using first 0.5s as profile")
    print("- enhance_voice(): Applies 80Hz-8000Hz bandpass filter")
    print("- detect_silence_intervals(): Finds silence for verse segmentation")
    print("- process_quran_audio(): Complete pipeline")