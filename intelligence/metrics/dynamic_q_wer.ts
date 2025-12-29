// [Al-Hakam Module]
// Calculates Quran Weighted Error Rate based on User Level

export interface ErrorDetail {
  phoneme: string;
  type: 'MAKHRAJ' | 'TAJWID' | 'HARAKAT' | 'RHYTHM';
  severity: number; // 0.0 to 1.0
  isLahnanJaliyy: boolean; // True if meaning changes
}

export interface QWERScore {
  totalScore: number;
  dominantErrorType: string;
  verdict: 'PASS' | 'NEEDS_PRACTICE' | 'CRITICAL_RETRY';
}

export class AdaptiveQWER {
  // Base weights as defined in README
  private static WEIGHTS = {
    MAKHRAJ: 3.0,
    TAJWID: 2.5,
    HARAKAT: 2.0,
    RHYTHM: 1.0
  };

  /**
   * Calculates score.
   * Beginners are forgiven for Rhythm errors.
   * Advanced users are punished strictly for everything.
   */
  static calculate(errors: ErrorDetail[], totalPhonemes: number, userLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'): QWERScore {
    
    let totalWeightedErrors = 0;
    const typeCounts: Record<string, number> = { MAKHRAJ: 0, TAJWID: 0, HARAKAT: 0, RHYTHM: 0 };

    // 1. Dynamic Weight Adjustment
    const dynamicWeights = { ...this.WEIGHTS };
    
    if (userLevel === 'BEGINNER') {
      dynamicWeights.MAKHRAJ = 4.0; // Critical to get right early
      dynamicWeights.RHYTHM = 0.5;  // Lenient
    } else if (userLevel === 'ADVANCED') {
      dynamicWeights.RHYTHM = 2.0;  // Strict fluency required
    }

    // 2. Process Errors
    for (const err of errors) {
      let weight = dynamicWeights[err.type];
      
      if (err.isLahnanJaliyy) {
        weight *= 2.0; // Major penalty
      }
      
      const contribution = weight * err.severity;
      totalWeightedErrors += contribution;
      typeCounts[err.type] += contribution;
    }

    // 3. Normalize Score (0-100)
    // Heuristic: Max possible error per phoneme is roughly 6.0
    const rawErrorMetric = (totalWeightedErrors / (totalPhonemes * 6.0)) * 100;
    const accuracyScore = Math.max(0, 100 - rawErrorMetric);

    // 4. Verdict Logic
    const dominantType = Object.keys(typeCounts).reduce((a, b) => typeCounts[a] > typeCounts[b] ? a : b);

    let verdict: QWERScore['verdict'] = 'PASS';
    if (accuracyScore < 50) verdict = 'CRITICAL_RETRY';
    else if (accuracyScore < 80) verdict = 'NEEDS_PRACTICE';

    return {
      totalScore: parseFloat(accuracyScore.toFixed(2)),
      dominantErrorType: dominantType,
      verdict
    };
  }
}
