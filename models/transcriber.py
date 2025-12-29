import whisper
from typing import Optional


class QuranTranscriber:
    def __init__(self):
        """Initialize the Quran transcriber with Whisper model."""
        self.model = whisper.load_model("small")
    
    def transcribe(self, audio_path: str) -> str:
        """Transcribe audio file and return the transcribed text.
        
        Args:
            audio_path: Path to the audio file to transcribe
            
        Returns:
            Transcribed text as string
        """
        # Load audio file
        result = self.model.transcribe(audio_path)
        return result['text'].strip()