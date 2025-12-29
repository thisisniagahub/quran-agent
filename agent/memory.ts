/**
 * Quran Teaching Agent Memory System
 * Manages learner profiles, error tracking, and progress analytics
 */

export interface LearnerProfile {
  id: string;
  name: string;
  currentLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  registrationDate: Date;
  totalSessions: number;
  totalRecitations: number;
  qwerHistory: Array<{
    timestamp: Date;
    score: number;
    level: string;
    dominantErrors: string[];
  }>;
}

export interface ErrorFrequency {
  type: string;
  count: number;
  lastSeen: Date;
  severity: 'minor' | 'moderate' | 'major';
  improvementTrend: 'improving' | 'declining' | 'stable';
}

export interface ProgressTrend {
  overallImprovement: number; // percentage improvement over time
  makhrajImprovement: number;
  tajwidImprovement: number;
  harakatImprovement: number;
  rhythmImprovement: number;
  learningVelocity: number; // rate of improvement
}

export class LearnerMemory {
  private profiles: Map<string, LearnerProfile> = new Map();
  private errorTracking: Map<string, Map<string, ErrorFrequency>> = new Map(); // learnerId -> errorType -> ErrorFrequency
  private progressTrends: Map<string, ProgressTrend> = new Map();

  createProfile(learnerId: string, name: string): LearnerProfile {
    const profile: LearnerProfile = {
      id: learnerId,
      name,
      currentLevel: 'Beginner',
      registrationDate: new Date(),
      totalSessions: 0,
      totalRecitations: 0,
      qwerHistory: []
    };

    this.profiles.set(learnerId, profile);
    this.errorTracking.set(learnerId, new Map());
    this.progressTrends.set(learnerId, {
      overallImprovement: 0,
      makhrajImprovement: 0,
      tajwidImprovement: 0,
      harakatImprovement: 0,
      rhythmImprovement: 0,
      learningVelocity: 0
    });

    return profile;
  }

  getProfile(learnerId: string): LearnerProfile | undefined {
    return this.profiles.get(learnerId);
  }

  updateQWERHistory(learnerId: string, qwerScore: number, level: string, dominantErrors: string[]): void {
    const profile = this.profiles.get(learnerId);
    if (!profile) return;

    profile.qwerHistory.push({
      timestamp: new Date(),
      score: qwerScore,
      level,
      dominantErrors
    });

    // Keep only last 50 records to prevent memory bloat
    if (profile.qwerHistory.length > 50) {
      profile.qwerHistory = profile.qwerHistory.slice(-50);
    }

    // Update current level based on recent performance
    this.updateLearnerLevel(learnerId);
  }

  trackError(learnerId: string, errorType: string, severity: 'minor' | 'moderate' | 'major'): void {
    const learnerErrors = this.errorTracking.get(learnerId);
    if (!learnerErrors) return;

    const error = learnerErrors.get(errorType);
    if (error) {
      error.count += 1;
      error.lastSeen = new Date();
      error.severity = severity;
    } else {
      learnerErrors.set(errorType, {
        type: errorType,
        count: 1,
        lastSeen: new Date(),
        severity,
        improvementTrend: 'stable'
      });
    }
  }

  getErrorFrequency(learnerId: string): ErrorFrequency[] {
    const learnerErrors = this.errorTracking.get(learnerId);
    if (!learnerErrors) return [];

    return Array.from(learnerErrors.values()).sort((a, b) => b.count - a.count);
  }

  updateProgressTrend(learnerId: string, improvements: {
    overall: number;
    makhraj: number;
    tajwid: number;
    harakat: number;
    rhythm: number;
    velocity: number;
  }): void {
    const trend = this.progressTrends.get(learnerId);
    if (!trend) return;

    trend.overallImprovement = improvements.overall;
    trend.makhrajImprovement = improvements.makhraj;
    trend.tajwidImprovement = improvements.tajwid;
    trend.harakatImprovement = improvements.harakat;
    trend.rhythmImprovement = improvements.rhythm;
    trend.learningVelocity = improvements.velocity;
  }

  getProgressTrend(learnerId: string): ProgressTrend | undefined {
    return this.progressTrends.get(learnerId);
  }

  incrementSession(learnerId: string): void {
    const profile = this.profiles.get(learnerId);
    if (profile) {
      profile.totalSessions += 1;
    }
  }

  incrementRecitation(learnerId: string): void {
    const profile = this.profiles.get(learnerId);
    if (profile) {
      profile.totalRecitations += 1;
    }
  }

  private updateLearnerLevel(learnerId: string): void {
    const profile = this.profiles.get(learnerId);
    if (!profile || profile.qwerHistory.length === 0) return;

    // Calculate average recent performance (last 5 sessions)
    const recentSessions = profile.qwerHistory.slice(-5);
    const avgScore = recentSessions.reduce((sum, session) => sum + session.score, 0) / recentSessions.length;

    if (avgScore < 0.3) {
      profile.currentLevel = 'Advanced';
    } else if (avgScore < 0.6) {
      profile.currentLevel = 'Intermediate';
    } else {
      profile.currentLevel = 'Beginner';
    }
  }

  getPersistentErrors(learnerId: string, threshold: number = 3): ErrorFrequency[] {
    const errors = this.getErrorFrequency(learnerId);
    return errors.filter(error => error.count >= threshold);
  }

  getImprovementTrend(learnerId: string): 'improving' | 'declining' | 'stable' {
    const profile = this.profiles.get(learnerId);
    if (!profile || profile.qwerHistory.length < 2) return 'stable';

    const recent = profile.qwerHistory.slice(-10); // Last 10 sessions
    if (recent.length < 2) return 'stable';

    const firstScore = recent[0].score;
    const lastScore = recent[recent.length - 1].score;
    
    if (lastScore > firstScore) return 'improving';
    if (lastScore < firstScore) return 'declining';
    return 'stable';
  }
}