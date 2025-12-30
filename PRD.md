# Product Requirements Document (PRD) - Quran Pulse

## 1. Executive Summary
**Quran Pulse** is an AI-powered Quran teaching agent focused on **acoustic precision** (Tajweed) and **articulatory accuracy** (Makhraj), surpassing standard ASR's semantic-only focus.

**Status:** Phase 1 (Backend Core) - **COMPLETED**

---

## 2. Technical Architecture

### 2.1 Core Components
*   **Backend API:** FastAPI (Python)
    *   **Entry Point:** `main.py`
    *   **AI Model:** OpenAI Whisper ('small' model) located in `models/transcriber.py`
    *   **Normalization:** Custom logic in `preprocessing/arabic_utils.py` handling:
        *   Diacritic Stripping (Tashkeel)
        *   Alef Normalization
        *   Isti'adzah Detection & Trimming
*   **Agent Bridge:** TypeScript (Node.js)
    *   **Bridge Module:** `agent/bridge.ts`
    *   **Test Script:** `agent/test_connection.ts`

### 2.2 Data Flow
1.  **Input:** User uploads `.mp3` / `.wav` audio.
2.  **Processing:**
    *   Audio Cleaning (Librosa/SoundFile)
    *   ASR Transcription (Whisper Small)
    *   Text Normalization (Arabic Utils)
    *   Alignment (JiWER)
3.  **Output:** Q-WER Score + Error Breakdown.

---

## 3. Success Metrics (Phase 1)
| Metric | Baseline (MVP) | Current Status |
| :--- | :--- | :--- |
| **Q-WER Score** | < 25% (Intermediate) | **~20% (Verified)** |
| **Transcription Accuracy** | High (> 90%) | **Achieved (Whisper Small)** |
| **False Positives** | Low (via Normalization) | **Minimized (Arabic Utils)** |

## 4. Roadmap
*   **Phase 1:** Backend Core & Bridge ✅ (DONE)
*   **Phase 2:** Advanced Tajweed Detection (Madd, Ghunnah) 🚧 (NEXT)
*   **Phase 3:** Real-time Feedback Loop
