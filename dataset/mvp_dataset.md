# Quran Teaching AI Agent
# Dataset Specification - Minimum Viable Dataset

## Minimum Viable Dataset Requirements

### Audio Data Requirements
- **Total Duration**: 500 hours across 5 proficiency levels
- **Number of Reciters**: 200+ (balanced gender distribution)
- **Age Groups**: 
  - Children (7-12): 20%
  - Teenagers (13-17): 25% 
  - Adults (18-65): 50%
  - Seniors (65+): 5%

### Proficiency Level Distribution
```
Level 1 (Beginner):     150 hours (30%)
- IQRA 1-6 completion
- Basic letter recognition
- Simple word pronunciation

Level 2 (Elementary):   125 hours (25%)
- Surah Al-Fatihah mastery
- Basic tajwid rules
- Short surahs (3-7 verses)

Level 3 (Intermediate): 100 hours (20%)
- Medium surahs (8-20 verses)
- Intermediate tajwid
- Consistent recitation

Level 4 (Advanced):     75 hours (15%)
- Long surahs capability
- Advanced tajwid mastery
- Rhythm and melody

Level 5 (Expert):       50 hours (10%)
- Complete Quran recitation
- Multiple Qira'at knowledge
- Teaching capability
```

### Accent Distribution (Malaysian Focus)
- **Malaysian Arabic**: 60% (various states)
- **Middle Eastern**: 25% (Egyptian, Gulf, Levantine)
- **Other Asian**: 10% (Indonesian, Pakistani, etc.)
- **Other**: 5% (Western converts, etc.)

### Ayah Length Distribution
```
1-5 words:    40% (short verses)
6-10 words:   30% (medium verses)  
11-20 words:  20% (long verses)
21+ words:    10% (very long verses)
```

### Surah Coverage
- **Complete Coverage**: All 114 surahs represented
- **Frequency Weighting**: More recordings for commonly recited surahs
- **Difficulty Balance**: Equal representation across difficulty levels

### Annotation Requirements
- **Annotator Agreement**: Fleiss' Kappa > 0.75
- **Quality Levels**: 
  - High Quality: 40% (SNR > 30dB)
  - Medium Quality: 45% (SNR 20-30dB)
  - Low Quality: 15% (SNR 15-20dB) - for robustness training

### Annotation Categories
1. **Phoneme-level alignment**: 100% coverage
2. **Tajwid rule annotation**: 100% coverage
3. **Error classification**: 100% coverage
4. **Makhraj identification**: 100% coverage
5. **Quality assessment**: 100% coverage

### Data Split Strategy
```
Training Set:   70% (350 hours)
Validation Set: 15% (75 hours) 
Test Set:       15% (75 hours)
```

### Quality Assurance
- **Expert Review**: 10% of dataset reviewed by certified Quran teachers
- **Consistency Checks**: Automated validation of annotation consistency
- **Cultural Sensitivity**: Review by Malaysian Islamic scholars
- **Technical Validation**: Audio quality and format compliance

### Privacy and Ethics
- **Informed Consent**: All participants provided written consent
- **Data Anonymization**: Personal identifiers removed
- **Cultural Respect**: Islamic principles maintained
- **Usage Rights**: Educational and research purposes only

### Expected Performance Targets
- **Baseline Accuracy**: 85% on standard metrics
- **Makhraj Detection**: 90% precision/recall
- **Tajwid Rule Accuracy**: 88% overall
- **Q-WER Target**: < 0.3 for expert level, < 0.7 for beginner