# Quran Teaching AI Agent (Quran Pulse) - Project Context

## Project Overview

**Quran Pulse: Acoustic-First AI Tutor** is an autonomous Quran teaching agent designed to exceed generic ASR (Automatic Speech Recognition) models by focusing on:
- **Acoustic precision** (Tajweed compliance)
- **Articulatory features** (Makhraj - proper articulation points)
- **Malaysian learner context** (local accent adaptation)

The system is built on a hybrid **Python (Core Engine)** and **TypeScript (Agent Intelligence)** architecture, optimizing for **Q-WER (Quran Weighted Error Rate)** rather than standard Word Error Rate, with dynamic weights based on theological error severity.

## Architecture

### Core Components

1. **Agent Intelligence** (`agent/` directory)
   - **LearnerMemory** (`memory.ts`): Manages learner profiles, error tracking, and progress analytics
   - **PolicyEngine** (`policy.ts`): Autonomous lesson decision logic based on learner analytics

2. **Core Engine** (`alignment/`, `preprocessing/` directories)
   - **QuranForcedAligner** (`alignment/forced_alignment.py`): Phoneme-level forced alignment with Tajwid rule detection
   - **AudioNormalizer** (`preprocessing/audio_normalization.py`): LUFS-based normalization for consistent loudness
   - **AudioCleaner** (`preprocessing/noise_robustness.py`): Noise reduction for Malaysian environments

3. **Dataset** (`dataset/` directory)
   - Comprehensive Quran audio dataset with Uthmani text, tajwid annotations, and error labels
   - Multiple qira'at (recitation styles) and speaker profiles

4. **API** (`api/openapi.yaml`)
   - RESTful API with OpenAPI 3.0 specification
   - Audio analysis, feedback generation, and lesson planning endpoints

### Q-WER Metric Weights

- **Makhraj (Articulation Point)**: 3.0x (Critical - Changes meaning/Lahnan Jaliyy)
- **Tajweed (Rules)**: 2.5x (High - Ghunnah, Idgham, Qalqalah)
- **Harakat (Vowels)**: 2.0x (Medium - Timing/Duration)
- **Rhythm/Fluency**: 1.0x (Low - Breath control)

Weights adapt dynamically based on User Level (Beginner vs Advanced).

## Technology Stack

### Python Dependencies (`requirements.txt`)
- **Audio Processing**: librosa, noisereduce, soundfile, pydub, pyloudnorm
- **Data Processing**: pandas, numpy, scipy, scikit-learn
- **ASR Evaluation**: jiwer
- **Scientific Computing**: numba, soxr

### TypeScript/JavaScript
- **Agent Intelligence**: TypeScript for memory management and policy engine
- **API**: OpenAPI 3.0 specification

## Key Features

### Audio Processing
- **Forced Alignment**: Phoneme-level alignment with Uthmani text
- **Tajwid Detection**: Automatic detection of madd, ghunnah, ikhfa, idgham, qalqalah
- **Noise Robustness**: Malaysian environment adaptation (fans, background chatter)
- **Audio Normalization**: LUFS-based loudness normalization for consistent quality

### Learning Intelligence
- **Adaptive Learning**: Policy engine generates personalized lesson plans
- **Error Tracking**: Persistent error detection and focused drill generation
- **Progress Analytics**: Comprehensive progress tracking with Q-WER metrics
- **Level Advancement**: Automatic level progression based on improvement

### API Endpoints
- `/analyze/audio`: Quran recitation analysis with tajwid evaluation
- `/agent/feedback`: Personalized feedback generation
- `/agent/next-lesson`: Next lesson recommendation

## Development Conventions

### Code Structure
- **Python**: Core audio processing and alignment in `alignment/` and `preprocessing/`
- **TypeScript**: Agent intelligence in `agent/` directory
- **Documentation**: Markdown files in `dataset/` and `api/` directories

### Testing and Validation
- Built-in validation suite for comparison against Tarteel/Whisper baselines
- Comprehensive dataset with quality metrics and benchmarks
- Real-time processing capability (2x speed target)

## Building and Running

### Prerequisites
- Python 3.9+
- Node.js 18+
- FFmpeg (for audio processing)

### Installation
1. **Core Engine (Python)**: `pip install -r requirements.txt`
2. **Intelligence Agent (TypeScript)**: `npm install && npm run build`

### Key Commands
- **Audio Analysis**: Use `/analyze/audio` endpoint with audio file and Uthmani text
- **Lesson Generation**: Query `/agent/next-lesson` with learner ID
- **Quality Assessment**: Process audio through forced alignment pipeline

## Compliance and Ethics

- **Scholar Validation**: All hardcoded rules in `schemas/` validated against Riwayah Hafs 'an 'Asim
- **Malaysian Context**: Adheres to standards referenced in *Akta 505 - Akta Pentadbiran Undang-Undang Islam*
- **Privacy**: Audio data processed locally (Edge AI ready) where possible
- **Cultural Sensitivity**: Islamic principles respected in all processing and annotations

## Directory Structure
```
quran-agent/
├── agent/              # TypeScript agent intelligence (memory, policy)
├── alignment/          # Python forced alignment module
├── api/               # OpenAPI 3.0 specification
├── dataset/           # Dataset specifications and documentation
├── preprocessing/     # Audio normalization and noise robustness
├── deployment/        # Deployment configurations
├── evaluation/        # Benchmark and validation scripts
├── logs/              # Application logs
├── metrics/           # Q-WER calculation and metrics
├── models/            # ML models (to be implemented)
├── schemas/           # Quranic rule schemas and validation
├── README.md         # Project overview
└── requirements.txt  # Python dependencies
```

## Project Goals

The Quran Pulse project aims to provide superior acoustic precision compared to existing solutions like Tarteel.ai and Whisper by focusing on:
- **Articulatory Correction** rather than semantic meaning
- **Tajweed-Rule Based** phoneme logic
- **Malaysian/Nusantara Accent Support**
- **Actionable Feedback** like "Raise your tongue for Saad" instead of generic "You missed a word"

This project represents an advanced, culturally-aware AI system specifically designed for Quranic education with theological accuracy as the primary goal.