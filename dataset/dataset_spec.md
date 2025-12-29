# Quran Audio Dataset Specification

## Overview
This document specifies the structure and requirements for the Quran Teaching AI Agent dataset. The dataset is designed to support advanced audio analysis, forced alignment, and tajwid rule learning for Quranic recitation.

## Dataset Structure

```
quran-dataset/
├── audio/
│   ├── reference-qari/
│   │   ├── hafs-warsh/
│   │   │   ├── surah_001/
│   │   │   │   ├── verse_001.wav
│   │   │   │   └── ...
│   │   │   └── ...
│   │   └── ...
│   ├── beginner-recitations/
│   │   ├── male-accent-malaysia/
│   │   ├── female-accent-malaysia/
│   │   ├── male-accent-mideast/
│   │   └── female-accent-mideast/
│   └── intermediate-advanced/
├── text/
│   ├── uthmani/
│   │   ├── surah_001.json
│   │   └── ...
│   ├── tajweed-marked/
│   │   ├── surah_001.json
│   │   └── ...
│   └── translations/
├── annotations/
│   ├── alignment/
│   │   ├── surah_001_alignment.json
│   │   └── ...
│   ├── tajwid-labels/
│   │   ├── surah_001_tajwid.json
│   │   └── ...
│   └── error-labels/
├── metadata/
│   ├── audio_metadata.json
│   ├── speaker_profiles.json
│   └── quality_scores.json
└── processed/
    ├── features/
    ├── embeddings/
    └── alignments/
```

## Audio Data Specifications

### Reference Qari Recordings
- **Format**: WAV, 44.1kHz, 16-bit, mono
- **Quality**: Professional studio recordings
- **Coverage**: Complete Quran (114 surahs) with multiple qira'at
- **Primary Qira'at**: Hafs 'an 'Asim (standard)
- **Secondary Qira'at**: Warsh 'an Nafi', Qaloon 'an Nafi'

### Beginner Recitations
- **Speakers**: 500+ speakers (balanced gender)
- **Accents**: Malaysian Arabic pronunciation, other regional accents
- **Recording Conditions**: 
  - Mobile recordings: 44.1kHz, 16-bit, mono
  - Studio recordings: 48kHz, 24-bit, mono
- **Quality Range**: Good to poor (to cover learning spectrum)

### Audio Quality Categories
1. **High Quality**: Studio recording, minimal background noise
2. **Medium Quality**: Quiet environment, some minor artifacts
3. **Low Quality**: Home recording, noticeable background noise

## Text Data Specifications

### Uthmani Mushaf Text
```json
{
  "surah_id": 1,
  "surah_name": "Al-Fatihah",
  "verses": [
    {
      "verse_id": 1,
      "uthmani_text": "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      "simple_text": "بسم الله الرحمن الرحيم",
      "phonetic_transcription": "bismi Allah al-rahman al-rahim",
      "verse_start_time": 0.0,
      "verse_end_time": 3.5
    }
  ]
}
```

### Tajwid Marked Text
```json
{
  "surah_id": 1,
  "verse_id": 1,
  "tajwid_annotations": [
    {
      "character": "ب",
      "position": 0,
      "tajwid_rule": "makhraj",
      "makhraj": "lips",
      "harakat": "kasra",
      "duration": 0.1
    },
    {
      "character": "س",
      "position": 2,
      "tajwid_rule": "madd",
      "madd_type": "madd_3",
      "expected_duration": 2.0,
      "actual_duration": 1.8
    }
  ]
}
```

## Annotation Specifications

### Forced Alignment Annotations
```json
{
  "audio_id": "rec_001_verse_001",
  "alignment": [
    {
      "phoneme": "b",
      "start_time": 0.0,
      "end_time": 0.1,
      "confidence": 0.95,
      "tajwid_rule": "normal",
      "harakat": "kasra"
    },
    {
      "phoneme": "i",
      "start_time": 0.1,
      "end_time": 0.15,
      "confidence": 0.92,
      "tajwid_rule": "madd",
      "harakat": "fatha",
      "madd_duration": 2.0
    }
  ]
}
```

### Tajwid Ground Truth Labels
```json
{
  "recording_id": "rec_001",
  "tajwid_violations": [
    {
      "type": "madd",
      "position": 2,
      "expected_duration": 2.0,
      "actual_duration": 1.2,
      "severity": "major",
      "rule_reference": "madd_3"
    },
    {
      "type": "ghunnah",
      "position": 15,
      "nasal_energy": 0.3,
      "expected_energy": 0.7,
      "severity": "moderate"
    }
  ]
}
```

### Error Classification Schema
- **Makhraj Errors**: Articulation point mistakes
- **Tajwid Violations**: Rule violations (madd, ghunnah, ikhfa, idgham, qalqalah)
- **Harakat Timing**: Incorrect vowel duration
- **Rhythm/Waqf**: Pausing and timing errors
- **Pronunciation**: General pronunciation mistakes

## Speaker Profiles

### Reference Qari Profiles
```json
{
  "qari_id": "qari_001",
  "name": "Sheikh Abdul Rahman Al-Sudais",
  "recitation_style": "hafs",
  "recording_quality": "professional",
  "accent": "mideast",
  "experience_years": 25,
  "certification": "huffaz"
}
```

### Beginner Speaker Profiles
```json
{
  "speaker_id": "speaker_001",
  "age_group": "18-25",
  "gender": "male",
  "native_language": "malay",
  "arabic_proficiency": "beginner",
  "quran_learning_duration": "6_months",
  "accent_region": "malaysia",
  "learning_goals": ["proper_pronunciation", "tajwid_rules"],
  "previous_experience": "iqra_1-6"
}
```

## Quality Metrics

### Audio Quality Assessment
- **SNR (Signal-to-Noise Ratio)**: Minimum 20dB for usable recordings
- **Background Noise Level**: Below -40dB
- **Clipping Detection**: Maximum 0.1% of samples
- **Frequency Response**: 20Hz-20kHz range

### Annotation Quality
- **Alignment Accuracy**: Target >95% phoneme-level accuracy
- **Tajwid Label Accuracy**: Target >90% rule identification
- **Inter-annotator Agreement**: Target >85% for complex rules

## Data Split Strategy

### Training Set (70%)
- 350 reference qari recordings
- 350 beginner recordings (balanced quality)
- 200 intermediate recordings

### Validation Set (15%)
- 75 reference qari recordings  
- 75 beginner recordings
- 50 intermediate recordings

### Test Set (15%)
- 75 reference qari recordings
- 75 beginner recordings (unseen speakers)
- 50 advanced recordings

## Privacy and Ethics

### Data Collection
- All recordings collected with informed consent
- Speaker anonymity preserved where requested
- Cultural sensitivity maintained in all annotations
- Islamic principles respected in all processing

### Usage Rights
- Reference qari recordings: Licensed for educational use
- Beginner recordings: Consent obtained for AI training
- All data: Used solely for Quran teaching AI development

## Version Control
- Dataset versioning follows semantic versioning
- Changes documented in CHANGELOG.md
- Backward compatibility maintained for core schemas
- Regular updates with new recordings and annotations

## Performance Benchmarks

### Target Performance
- **Phoneme Alignment**: >95% accuracy
- **Tajwid Detection**: >90% accuracy
- **Q-WER Calculation**: Real-time processing (2x speed)
- **Error Classification**: >85% accuracy for major violations

This dataset specification provides the foundation for training and evaluating the advanced Quran Teaching AI Agent with superior capabilities to existing solutions like Tarteel.ai.