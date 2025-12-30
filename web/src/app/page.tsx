"use client";

import Navbar from "@/components/Navbar";
import AudioRecorder from "@/components/AudioRecorder";
import ScoreDisplay from "@/components/ScoreDisplay";
import { useState } from "react";

import { AudioAnalysisResponse } from "@/types/api";

export default function Home() {
  const [analysis, setAnalysis] = useState<AudioAnalysisResponse | null>(null);

  return (
    <main className="min-h-screen bg-bg-ocean relative overflow-hidden flex flex-col items-center">
      {/* Background Gradient Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-pulse-deep/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-pulse-glow/10 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-6 gap-16 mt-20 md:mt-0 relative z-10">

        {/* Header Text */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-2">
            Perfect Your <span className="text-pulse-glow">Recitation</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            Proprietary AI analysis for Tajweed, Makhraj, and Rhythm correctness in real-time.
          </p>
        </div>

        {/* Interactive Zone */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full">

          {/* The Recorder Pulse */}
          <div className="flex-1 flex justify-center">
            <AudioRecorder onResult={setAnalysis} />
          </div>

          {/* The Score Card */}
          <div className="flex-1 flex justify-center">
            <ScoreDisplay result={analysis} />
          </div>
        </div>
      </div>
    </main>
  );
}
