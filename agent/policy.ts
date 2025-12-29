/**
 * Quran Teaching Agent Policy Engine
 * Autonomous lesson decision logic based on learner analytics
 */

import { LearnerMemory, ErrorFrequency, ProgressTrend } from './memory';

export interface LessonPlan {
  lessonId: string;
  topic: string;
  focusAreas: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  objectives: string[];
  exercises: LessonExercise[];
  prerequisites: string[];
}

export interface LessonExercise {
  type: 'phoneme_isolation' | 'tajwid_focus' | 'rhythm_practice' | 'full_verse' | 'makhraj_drill';
  content: string; // Arabic text to practice
  targetErrors?: string[]; // Specific errors this exercise addresses
  repetitions: number;
  expectedMastery: number; // Expected Q-WER improvement
}

export interface PolicyRecommendation {
  nextLesson: LessonPlan;
  confidence: number; // 0-1 confidence in recommendation
  reasoning: string;
  alternativeOptions: LessonPlan[];
  estimatedImprovement: number; // Expected Q-WER improvement
}

export class PolicyEngine {
  private memory: LearnerMemory;

  constructor(memory: LearnerMemory) {
    this.memory = memory;
  }

  generateNextLesson(learnerId: string): PolicyRecommendation | null {
    const profile = this.memory.getProfile(learnerId);
    if (!profile) return null;

    const persistentErrors = this.memory.getPersistentErrors(learnerId, 3);
    const improvementTrend = this.memory.getImprovementTrend(learnerId);
    const progressTrend = this.memory.getProgressTrend(learnerId);

    // Rule 1: If error occurs ≥ 3 times → focused drill
    if (persistentErrors.length > 0) {
      const mostFrequentError = persistentErrors[0];
      return this.createFocusedDrillLesson(learnerId, mostFrequentError, profile.currentLevel);
    }

    // Rule 2: If Q-WER improved ≥ 15% → advance
    if (this.hasSignificantImprovement(learnerId)) {
      return this.createAdvancementLesson(learnerId, profile.currentLevel);
    }

    // Rule 3: Persistent makhraj error → phoneme isolation
    const makhrajErrors = persistentErrors.filter(err => err.type.includes('makhraj'));
    if (makhrajErrors.length > 0) {
      return this.createMakhrajIsolationLesson(learnerId, makhrajErrors[0], profile.currentLevel);
    }

    // Default: Continue progressive learning
    return this.createProgressiveLesson(learnerId, profile.currentLevel);
  }

  private createFocusedDrillLesson(
    learnerId: string, 
    error: ErrorFrequency, 
    currentLevel: string
  ): PolicyRecommendation {
    const exerciseType = this.mapErrorToExerciseType(error.type);
    const targetContent = this.selectTargetedContent(error.type, currentLevel);

    const lesson: LessonPlan = {
      lessonId: `drill-${Date.now()}`,
      topic: `Focused Drill: ${error.type}`,
      focusAreas: [error.type],
      difficulty: currentLevel.toLowerCase() as any,
      duration: 15,
      objectives: [`Reduce ${error.type} occurrences by 50%`],
      exercises: [{
        type: exerciseType,
        content: targetContent,
        targetErrors: [error.type],
        repetitions: 10,
        expectedMastery: 0.8
      }],
      prerequisites: []
    };

    return {
      nextLesson: lesson,
      confidence: 0.9,
      reasoning: `Persistent error detected (${error.count} occurrences). Creating focused drill to address ${error.type}.`,
      alternativeOptions: [],
      estimatedImprovement: 0.15
    };
  }

  private createAdvancementLesson(learnerId: string, currentLevel: string): PolicyRecommendation {
    const newLevel = this.getNextLevel(currentLevel);
    const content = this.selectAdvancementContent(newLevel);

    const lesson: LessonPlan = {
      lessonId: `advancement-${Date.now()}`,
      topic: `Advancement to ${newLevel}`,
      focusAreas: ['comprehensive'],
      difficulty: newLevel.toLowerCase() as any,
      duration: 20,
      objectives: [`Introduce ${newLevel}-level concepts and challenges`],
      exercises: [{
        type: 'full_verse',
        content: content,
        repetitions: 5,
        expectedMastery: 0.7
      }],
      prerequisites: []
    };

    return {
      nextLesson: lesson,
      confidence: 0.85,
      reasoning: `Significant improvement detected. Advancing to ${newLevel} level.`,
      alternativeOptions: [],
      estimatedImprovement: 0.1
    };
  }

  private createMakhrajIsolationLesson(
    learnerId: string, 
    error: ErrorFrequency, 
    currentLevel: string
  ): PolicyRecommendation {
    const makhrajTarget = this.extractMakhrajTarget(error.type);
    const content = this.selectMakhrajContent(makhrajTarget);

    const lesson: LessonPlan = {
      lessonId: `makhraj-${Date.now()}`,
      topic: `Makhraj Isolation: ${makhrajTarget}`,
      focusAreas: ['makhraj', error.type],
      difficulty: currentLevel.toLowerCase() as any,
      duration: 12,
      objectives: [`Improve ${makhrajTarget} articulation`],
      exercises: [{
        type: 'makhraj_drill',
        content: content,
        targetErrors: [error.type],
        repetitions: 15,
        expectedMastery: 0.85
      }],
      prerequisites: []
    };

    return {
      nextLesson: lesson,
      confidence: 0.88,
      reasoning: `Persistent makhraj error detected. Creating phoneme isolation exercise for ${makhrajTarget}.`,
      alternativeOptions: [],
      estimatedImprovement: 0.2
    };
  }

  private createProgressiveLesson(learnerId: string, currentLevel: string): PolicyRecommendation {
    const content = this.selectProgressiveContent(currentLevel);
    const focusAreas = this.determineFocusAreas(learnerId);

    const lesson: LessonPlan = {
      lessonId: `progressive-${Date.now()}`,
      topic: `Progressive Learning`,
      focusAreas: focusAreas,
      difficulty: currentLevel.toLowerCase() as any,
      duration: 18,
      objectives: [`Continue progressive skill development`],
      exercises: [{
        type: 'full_verse',
        content: content,
        repetitions: 8,
        expectedMastery: 0.75
      }],
      prerequisites: []
    };

    return {
      nextLesson: lesson,
      confidence: 0.8,
      reasoning: `Continuing progressive learning based on current level and performance trends.`,
      alternativeOptions: [],
      estimatedImprovement: 0.08
    };
  }

  private mapErrorToExerciseType(errorType: string): LessonExercise['type'] {
    if (errorType.includes('makhraj')) return 'makhraj_drill';
    if (errorType.includes('tajwid')) return 'tajwid_focus';
    if (errorType.includes('harakat')) return 'rhythm_practice';
    if (errorType.includes('rhythm') || errorType.includes('waqf')) return 'rhythm_practice';
    return 'phoneme_isolation';
  }

  private selectTargetedContent(errorType: string, level: string): string {
    // Content selection logic based on error type and level
    const contentMap: Record<string, Record<string, string>> = {
      'makhraj_b': {
        'Beginner': 'ب ب ب',
        'Intermediate': 'بسم الله',
        'Advanced': 'البقرة: 1'
      },
      'makhraj_d': {
        'Beginner': 'د د د',
        'Intermediate': 'الذين',
        'Advanced': 'البقرة: 2'
      },
      'tajwid_madd': {
        'Beginner': 'آ آ آ',
        'Intermediate': 'الرحمن',
        'Advanced': 'الفاتحة'
      }
    };

    return contentMap[errorType]?.[level] || 'بسم الله الرحمن الرحيم';
  }

  private hasSignificantImprovement(learnerId: string): boolean {
    const profile = this.memory.getProfile(learnerId);
    if (!profile || profile.qwerHistory.length < 3) return false;

    const recent = profile.qwerHistory.slice(-3);
    const firstScore = recent[0].score;
    const lastScore = recent[recent.length - 1].score;
    
    return (lastScore - firstScore) >= 0.15; // 15% improvement
  }

  private getNextLevel(currentLevel: string): string {
    switch (currentLevel) {
      case 'Beginner': return 'Intermediate';
      case 'Intermediate': return 'Advanced';
      default: return 'Advanced';
    }
  }

  private extractMakhrajTarget(errorType: string): string {
    // Extract specific makhraj target from error type
    const makhrajMap: Record<string, string> = {
      'makhraj_b': 'lips',
      'makhraj_t': 'teeth',
      'makhraj_h': 'throat',
      'makhraj_l': 'tongue'
    };
    
    return makhrajMap[errorType] || 'general';
  }

  private selectMakhrajContent(makhrajTarget: string): string {
    const contentMap: Record<string, string> = {
      'lips': 'ب م',
      'teeth': 'ت د',
      'throat': 'ح خ ع غ',
      'tongue': 'ل ن'
    };
    
    return contentMap[makhrajTarget] || 'ب م';
  }

  private selectAdvancementContent(level: string): string {
    const contentMap: Record<string, string> = {
      'Intermediate': 'الفاتحة',
      'Advanced': 'البقرة: 1-5'
    };
    
    return contentMap[level] || 'بسم الله الرحمن الرحيم';
  }

  private selectProgressiveContent(level: string): string {
    const contentMap: Record<string, string> = {
      'Beginner': 'بسم الله الرحمن الرحيم',
      'Intermediate': 'الفاتحة',
      'Advanced': 'البقرة: 1-7'
    };
    
    return contentMap[level] || 'بسم الله الرحمن الرحيم';
  }

  private determineFocusAreas(learnerId: string): string[] {
    const errors = this.memory.getErrorFrequency(learnerId);
    const topErrors = errors.slice(0, 2).map(e => e.type);
    
    if (topErrors.length === 0) return ['comprehensive'];
    return topErrors;
  }
}