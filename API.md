# API Documentation - Quran Pulse

## Base URL

`http://localhost:8000`

---

## Endpoints

### 1. Analyze Audio

Submit a Quranic recitation audio file for AI analysis.

* **URL:** `/analyze/audio`
* **Method:** `POST`
* **Content-Type:** `multipart/form-data`

#### Request Body

| Key | Type | Description |
| :--- | :--- | :--- |
| `file` | `File` | The audio file (`.mp3`, `.wav`) of the recitation. |

#### Success Response

* **Code:** `200 OK`
* **Content:**

    ```json
    {
      "success": true,
      "message": "Audio analysis completed successfully",
      "analysis": {
        "qwer": 15.5,
        "level": "Intermediate",
        "error_breakdown": {
          "makhraj": 4.65,
          "tajwid": 6.2,
          "harakat": 3.1,
          "rhythm": 1.55
        },
        "dominant_error_types": [
             "tajwid"
        ],
        "detailed_errors": [
          {
            "type": "transcription",
            "position": 0,
            "description": "Transcribed: الحمد لله رب العالمين"
          },
          {
            "type": "reference",
            "position": 0,
            "description": "Expected: الحمد لله رب العالمين"
          }
        ],
        "total_errors": 1,
        "total_phonemes": 25
      },
      "audio_info": {
        "duration": 12.5,
        "transcription": "Alhamdu lillahi...",
        "filename": "recitation.mp3"
      }
    }
    ```

#### Error Response

* **Code:** `400 Bad Request`
* **Content:**

    ```json
    {
      "detail": "File must be an audio file"
    }
    ```

* **Code:** `500 Internal Server Error`
* **Content:**

    ```json
    {
      "detail": "Error processing audio: [Details]"
    }
    ```
