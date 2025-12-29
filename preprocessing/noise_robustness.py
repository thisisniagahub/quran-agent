
import numpy as np
import librosa
import noisereduce as nr
from scipy.signal import butter, lfilter
import soundfile as sf

class AudioCleaner:
    """
    [Al-Musami Module]
    Handles noise reduction specifically for Malaysian home environments
    (ceiling fans, traffic noise, echo).
    """

    def __init__(self, sr: int = 16000):
        self.sr = sr

    def load_and_clean(self, file_path: str):
        print(f"🔊 Al-Musami: Loading audio {file_path}...")

        # 1. Load Audio
        # librosa loads as float32, normalized between -1 and 1
        y, _ = librosa.load(file_path, sr=self.sr)

        # 2. Remove Stationary Noise (Fan/AC hum)
        # We assume the noise profile is constant-ish (typical Malaysian ceiling fan)
        # prop_decrease=0.75 means we remove 75% of the noise to avoid "robotic" artifacts
        y_clean = nr.reduce_noise(y=y, sr=self.sr, stationary=True, prop_decrease=0.75)

        # 3. Bandpass Filter (Human Voice Range)
        # Focus on 80Hz (Deep male voice) to 8000Hz (High Sibilance Sa, Shin)
        # This removes low rumble (lorry passing) and high frequency hiss
        y_filtered = self._bandpass_filter(y_clean, 80, 8000)

        # 4. Normalize Volume (LUFS-style simple normalization)
        y_normalized = librosa.util.normalize(y_filtered)

        return y_normalized

    def remove_stationary_noise(self, audio_data):
        """
        Remove stationary noise (like fan hum) from audio data.
        """
        # Remove stationary noise using noisereduce
        cleaned_audio = nr.reduce_noise(
            y=audio_data,
            sr=self.sr,
            stationary=True,
            prop_decrease=0.75
        )
        return cleaned_audio

    def enhance_voice(self, audio_data):
        """
        Enhance voice quality by applying bandpass filtering and normalization.
        """
        # Apply bandpass filter to focus on human voice range
        filtered_audio = self._bandpass_filter(audio_data, 80, 8000)

        # Normalize volume
        enhanced_audio = librosa.util.normalize(filtered_audio)

        return enhanced_audio

    def _bandpass_filter(self, data, lowcut, highcut, order=5):
        """
        Butterworth bandpass filter
        """
        nyq = 0.5 * self.sr
        low = lowcut / nyq
        high = highcut / nyq
        b, a = butter(order, [low, high], btype="band")
        return lfilter(b, a, data)

    def detect_silence_intervals(self, y, top_db=25):
        """
        Splits verses based on silence gaps.
        """
        return librosa.effects.split(y, top_db=top_db)

if __name__ == "__main__":
    print("✅ Al-Musami Noise Reduction Module Ready.")
    # Test block (Optional)
    # cleaner = AudioCleaner()
    # clean_audio = cleaner.load_and_clean("test.wav")

