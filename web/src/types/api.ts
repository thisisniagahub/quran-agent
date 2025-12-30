export interface QWERAnalysis {
    qwer: number;
    level: string;
    error_breakdown: Record<string, number>;
    total_errors: number;
    total_phonemes: number;
    dominant_error_types: string[];
    detailed_errors: Array<{
        type: string;
        position: number;
        description: string;
    }>;
}

export interface AudioAnalysisResponse {
    success: boolean;
    message: string;
    analysis: QWERAnalysis | null;
    audio_info?: Record<string, unknown>;
    audioUrl?: string; // Local Blob URL for playback
}
