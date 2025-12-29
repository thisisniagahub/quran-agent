/**
 * Quran Weighted Error Rate (Q-WER) Calculator
 * Advanced error rate calculation for Quranic recitation with Islamic linguistic principles
 */

// Define error types based on Islamic linguistic categories
export interface Phoneme {
  id: string;
  text: string;
  makhraj: string; // Articulation point
  harakat: string; // Diacritic mark
  tajwidRule?: string; // Applied tajwid rule
  position: number; // Position in the verse
  isMeaningChanging: boolean; // Lahnan Jaliyy (meaning-changing) vs Khafiyy (cosmetic)
}

export enum ErrorType {
  MAKHRAJ = 'makhraj',
  TAJWID = 'tajwid',
  HARAKAT = 'harakat',
  RHYTHM = 'rhythm'
}

export interface ErrorInstance {
  type: ErrorType;
  position: number;
  severity: 'minor' | 'moderate' | 'major';
  isMeaningChanging: boolean; // Lahnan Jaliyy (true) vs Lahnan Khafiyy (false)
  weight: number;
  description: string;
}

export interface QWERResult {
  qwer: number; // Quran Weighted Error Rate (0-100)
  level: "Beginner" | "Intermediate" | "Advanced";
  errorBreakdown: {
    [ErrorType.MAKHRAJ]: number;
    [ErrorType.TAJWID]: number;
    [ErrorType.HARAKAT]: number;
    [ErrorType.RHYTHM]: number;
  };
  totalErrors: number;
  totalPhonemes: number;
  dominantErrorTypes: ErrorType[];
  detailedErrors: ErrorInstance[];
}

export class QWERCalculator {
  private readonly baseWeights = {
    [ErrorType.MAKHRAJ]: 3.0,    // Makhraj (articulation point) errors - highest weight
    [ErrorType.TAJWID]: 2.5,     // Tajwid rule violations - high weight
    [ErrorType.HARAKAT]: 2.0,    // Harakat (diacritic) errors - medium weight
    [ErrorType.RHYTHM]: 1.0      // Rhythm/waqf errors - baseline weight
  };

  /**
   * Calculate the severity multiplier based on Islamic linguistic principles
   * Lahnan Jaliyy (clear mistake that changes meaning) vs Lahnan Khafiyy (hidden/cosmetic mistake)
   */
  private calculateSeverityMultiplier(isMeaningChanging: boolean): number {
    if (isMeaningChanging) {
      return 2.0; // Lahnan Jaliyy - doubles the weight
    } else {
      return 0.5; // Lahnan Khafiyy - halves the weight
    }
  }

  /**
   * Calculate Quran Weighted Error Rate (Q-WER)
   * Formula: Q-WER = (Sum(Weighted Errors) / Total Phonemes) * 100
   */
  calculateQWER(actual: Phoneme[], expected: Phoneme[]): QWERResult {
    const totalPhonemes = expected.length;
    const errors: ErrorInstance[] = [];

    // Compare each phoneme and identify errors
    for (let i = 0; i < Math.max(actual.length, expected.length); i++) {
      const actualPhoneme = actual[i];
      const expectedPhoneme = expected[i];

      if (!expectedPhoneme) {
        // Extra phoneme in actual (insertion error)
        errors.push({
          type: ErrorType.MAKHRAJ,
          position: i,
          severity: 'major',
          isMeaningChanging: true,
          weight: this.baseWeights[ErrorType.MAKHRAJ],
          description: `Extra phoneme: ${actualPhoneme?.text || 'unknown'}`
        });
        continue;
      }

      if (!actualPhoneme) {
        // Missing phoneme in actual (deletion error)
        errors.push({
          type: ErrorType.MAKHRAJ,
          position: i,
          severity: 'major',
          isMeaningChanging: true,
          weight: this.baseWeights[ErrorType.MAKHRAJ],
          description: `Missing phoneme: ${expectedPhoneme.text}`
        });
        continue;
      }

      // Check for makhraj errors
      if (actualPhoneme.makhraj !== expectedPhoneme.makhraj) {
        errors.push({
          type: ErrorType.MAKHRAJ,
          position: i,
          severity: 'major',
          isMeaningChanging: true,
          weight: this.baseWeights[ErrorType.MAKHRAJ],
          description: `Makhraj error: expected ${expectedPhoneme.makhraj}, got ${actualPhoneme.makhraj}`
        });
      }

      // Check for harakat errors
      if (actualPhoneme.harakat !== expectedPhoneme.harakat) {
        const isMeaningChanging = this.isHarakatMeaningChanging(
          actualPhoneme.harakat,
          expectedPhoneme.harakat,
          actualPhoneme.text
        );

        errors.push({
          type: ErrorType.HARAKAT,
          position: i,
          severity: isMeaningChanging ? 'major' : 'minor',
          isMeaningChanging,
          weight: this.baseWeights[ErrorType.HARAKAT],
          description: `Harakat error: expected ${expectedPhoneme.harakat}, got ${actualPhoneme.harakat}`
        });
      }

      // Check for tajwid errors
      if (actualPhoneme.tajwidRule !== expectedPhoneme.tajwidRule) {
        errors.push({
          type: ErrorType.TAJWID,
          position: i,
          severity: 'moderate',
          isMeaningChanging: false, // Tajwid rules are about recitation, not meaning
          weight: this.baseWeights[ErrorType.TAJWID],
          description: `Tajwid error: expected ${expectedPhoneme.tajwidRule || 'none'}, got ${actualPhoneme.tajwidRule || 'none'}`
        });
      }
    }

    // Apply severity multipliers and calculate weighted errors
    let totalWeightedErrors = 0;
    const errorBreakdown = {
      [ErrorType.MAKHRAJ]: 0,
      [ErrorType.TAJWID]: 0,
      [ErrorType.HARAKAT]: 0,
      [ErrorType.RHYTHM]: 0
    };

    for (const error of errors) {
      const severityMultiplier = this.calculateSeverityMultiplier(error.isMeaningChanging);
      const finalWeight = error.weight * severityMultiplier;

      totalWeightedErrors += finalWeight;
      errorBreakdown[error.type] += finalWeight;
    }

    // Calculate Q-WER: (Sum(Weighted Errors) / Total Phonemes) * 100
    const qwer = totalPhonemes > 0
      ? (totalWeightedErrors / totalPhonemes) * 100
      : 0;

    // Determine level based on Q-WER score
    const level = this.determineLevel(qwer);

    // Identify dominant error types
    const dominantErrorTypes = this.getDominantErrorTypes(errorBreakdown);

    return {
      qwer,
      level,
      errorBreakdown,
      totalErrors: errors.length,
      totalPhonemes,
      dominantErrorTypes,
      detailedErrors: errors
    };
  }

  /**
   * Determine if a harakat change affects meaning (Lahnan Jaliyy vs Khafiyy)
   * This is a simplified implementation - in practice, this would require complex linguistic analysis
   */
  private isHarakatMeaningChanging(actualHarakat: string, expectedHarakat: string, phonemeText: string): boolean {
    // In Arabic, certain harakat changes can significantly change meaning
    // For example: changing fatha to kasra in certain contexts can change the meaning
    // This is a simplified check - real implementation would be more complex
    const meaningChangingHarakatPairs = [
      ['َ', 'ِ'], // fatha vs kasra
      ['َ', 'ُ'], // fatha vs damma
      ['ِ', 'ُ']  // kasra vs damma
    ];

    for (const [h1, h2] of meaningChangingHarakatPairs) {
      if ((actualHarakat === h1 && expectedHarakat === h2) ||
          (actualHarakat === h2 && expectedHarakat === h1)) {
        return true;
      }
    }

    return false;
  }

  private determineLevel(qwer: number): "Beginner" | "Intermediate" | "Advanced" {
    if (qwer >= 50) return "Beginner";
    if (qwer >= 25) return "Intermediate";
    return "Advanced";
  }

  private getDominantErrorTypes(errorBreakdown: {[key: string]: number}): ErrorType[] {
    const sortedEntries = Object.entries(errorBreakdown)
      .sort(([,a], [,b]) => b - a)
      .filter(([, weight]) => weight > 0);

    return sortedEntries.slice(0, 2).map(([type]) => type as ErrorType);
  }
}

/**
 * Convenience function for direct Q-WER calculation
 */
export function calculateQWER(actual: Phoneme[], expected: Phoneme[]): QWERResult {
  const calculator = new QWERCalculator();
  return calculator.calculateQWER(actual, expected);
}

// Example usage:
/*
const expectedPhonemes: Phoneme[] = [
  { id: '1', text: 'ب', makhraj: 'lips', harakat: 'kasra', position: 0, isMeaningChanging: false },
  { id: '2', text: 'س', makhraj: 'teeth', harakat: 'fatha', position: 1, isMeaningChanging: true },
  { id: '3', text: 'م', makhraj: 'lips', harakat: 'sukun', position: 2, isMeaningChanging: false }
];

const actualPhonemes: Phoneme[] = [
  { id: '1', text: 'ب', makhraj: 'lips', harakat: 'fatha', position: 0, isMeaningChanging: true }, // Error: harakat changed
  { id: '2', text: 'س', makhraj: 'throat', harakat: 'fatha', position: 1, isMeaningChanging: true }, // Error: makhraj changed
  { id: '3', text: 'م', makhraj: 'lips', harakat: 'sukun', position: 2, isMeaningChanging: false } // Correct
];

const result = calculateQWER(actualPhonemes, expectedPhonemes);
console.log(`Q-WER: ${result.qwer}%`);
console.log(`Level: ${result.level}`);
console.log(`Total Errors: ${result.totalErrors}`);
console.log(`Error Breakdown:`, result.errorBreakdown);
*/