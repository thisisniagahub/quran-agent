"use client";

import Navbar from "@/components/Navbar";
import AudioRecorder from "@/components/AudioRecorder";
import ScoreDisplay from "@/components/ScoreDisplay";
import { useState } from "react";
import { AudioAnalysisResponse } from "@/types/api";

export default function Home() {
  const [analysis, setAnalysis] = useState<AudioAnalysisResponse | null>(null);

  return (
    <main className="min-h-screen bg-bg-ocean relative overflow-hidden flex flex-col items-center bg-islamic-pattern font-sans">

      {/* Background Ambience: Gold & Blue Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-pulse-deep/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[900px] h-[900px] bg-pulse-gold/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-[20%] left-[50%] w-[600px] h-[600px] bg-pulse-glow/5 rounded-full blur-[120px] -translate-x-1/2 pointer-events-none" />

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-6 gap-16 mt-20 md:mt-0 relative z-10">

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-pulse-gold/10 border border-pulse-gold/20 backdrop-blur-sm mb-4">
            <span className="text-pulse-gold text-xs font-semibold tracking-widest uppercase">AI Tajweed Coach</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-2 leading-tight">
            Perfect Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pulse-glow to-pulse-deep">Recitation</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-lg md:text-xl font-light leading-relaxed">
            Experience real-time AI analysis for Tajweed, Makhraj, and Rhythm. <br className="hidden md:block" /> Connect your heart with the Quran.
          </p>
        </div>

        {/* Interactive Zone */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16 w-full">

          {/* Recorder Column */}
          <div className="flex-1 flex justify-center w-full max-w-lg">
            <AudioRecorder onResult={setAnalysis} />
          </div>

          {/* Score Column */}
          <div className="flex-1 flex justify-center w-full max-w-2xl">
            <ScoreDisplay result={analysis} />
          </div>
        </div>
      </div>
    </main>
  );
}
