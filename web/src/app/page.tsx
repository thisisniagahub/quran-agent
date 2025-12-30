"use client";

import Navbar from "@/components/Navbar";
import AudioRecorder from "@/components/AudioRecorder";
import ScoreDisplay from "@/components/ScoreDisplay";
import { useState } from "react";
import Image from "next/image";
import { AudioAnalysisResponse } from "@/types/api";
import { SURAH_DATA } from "@/data/surahs";
import { ChevronDown } from "lucide-react";

export default function Home() {
  const [analysis, setAnalysis] = useState<AudioAnalysisResponse | null>(null);
  const [selectedSurah, setSelectedSurah] = useState(SURAH_DATA[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <main className="min-h-screen bg-bg-ocean relative overflow-hidden flex flex-col items-center bg-islamic-pattern font-sans">

      {/* --- CINEMATIC WATERMARK --- */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="relative w-[150vw] h-[150vw] opacity-5 -rotate-12 blur-sm">
          <Image
            src="/logo-watermark.png"
            alt="Background Ambience"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Background Ambience: Gold & Blue Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-pulse-deep/20 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[900px] h-[900px] bg-pulse-gold/10 rounded-full blur-[180px] pointer-events-none z-0" />
      <div className="absolute top-[20%] left-[50%] w-[600px] h-[600px] bg-pulse-glow/5 rounded-full blur-[120px] -translate-x-1/2 pointer-events-none z-0" />

      {/* Navigation */}
      <div className="relative z-50 w-full">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-6 gap-10 mt-10 md:mt-0 relative z-10 py-12">

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-pulse-gold/10 border border-pulse-gold/20 backdrop-blur-sm mb-4">
            <span className="text-pulse-gold text-xs font-semibold tracking-widest uppercase">AI Tajweed Coach</span>
          </div>

          {/* --- SURAH SELECTOR DROP DOWN --- */}
          <div className="relative inline-block text-left mb-6">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-3 transition-all duration-300 group"
            >
              <span className="text-xl md:text-2xl font-bold text-white tracking-tight">{selectedSurah.name}</span>
              <ChevronDown className={`w-5 h-5 text-zinc-400 group-hover:text-white transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                <div className="absolute z-50 mt-2 w-64 bg-[#0F1523] border border-white/10 rounded-2xl shadow-2xl overflow-hidden left-1/2 -translate-x-1/2 backdrop-blur-xl">
                  {SURAH_DATA.map((surah) => (
                    <button
                      key={surah.id}
                      onClick={() => {
                        setSelectedSurah(surah);
                        setAnalysis(null); // Reset analysis on change
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${selectedSurah.id === surah.id ? 'text-pulse-gold bg-pulse-gold/5' : 'text-zinc-400'
                        }`}
                    >
                      <span className="font-semibold">{surah.name}</span>
                      {selectedSurah.id === surah.id && <div className="w-2 h-2 rounded-full bg-pulse-gold"></div>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <p className="text-slate-400 max-w-xl mx-auto text-lg font-light leading-relaxed">
            Connect your heart with the Quran. Recite <span className="text-white font-medium">{selectedSurah.name}</span> and get instant AI feedback.
          </p>
        </div>

        {/* Interactive Zone */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 w-full min-h-[500px]">

          {/* Recorder Column */}
          <div className="flex-1 flex justify-center w-full max-w-lg order-2 lg:order-1">
            <AudioRecorder onResult={setAnalysis} />
          </div>

          {/* Score / Teleprompter Column */}
          <div className="flex-1 flex justify-center w-full max-w-2xl order-1 lg:order-2">
            <ScoreDisplay
              result={analysis}
              referenceText={selectedSurah.referenceText}
              surahName={selectedSurah.name}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
