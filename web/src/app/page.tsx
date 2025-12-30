"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import AudioRecorder from "@/components/AudioRecorder";
import ScoreDisplay from "@/components/ScoreDisplay";
import Image from "next/image";
import { AudioAnalysisResponse } from "@/types/api";
import { SURAH_DATA } from "@/data/surahs";
import { QURAN_INDEX } from "@/data/quran-index";
import { IQRA_1_DATA, IqraPage } from "@/data/iqra";
import { ChevronDown, BookOpen, Library } from "lucide-react";

type ContentMode = 'quran' | 'iqra';

export default function Home() {
  const [analysis, setAnalysis] = useState<AudioAnalysisResponse | null>(null);
  const [mode, setMode] = useState<ContentMode>('quran');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Quran State
  const [selectedSurahId, setSelectedSurahId] = useState<number>(1); // Default Al-Fatihah

  // Iqra State
  const [selectedIqraPage, setSelectedIqraPage] = useState<IqraPage>(IQRA_1_DATA[0]);

  // Derived Data
  const currentTitle = mode === 'quran'
    ? QURAN_INDEX.find(s => s.id === selectedSurahId)?.name
    : selectedIqraPage.title;

  const currentReferenceText = mode === 'quran'
    ? (SURAH_DATA.find(s => s.name === QURAN_INDEX.find(idx => idx.id === selectedSurahId)?.name)?.referenceText || "Coming soon: Full Quran text integration...")
    : selectedIqraPage.content;

  const handleSurahSelect = (id: number) => {
    setSelectedSurahId(id);
    setAnalysis(null);
    setIsDropdownOpen(false);
  };

  const handleIqraSelect = (page: IqraPage) => {
    setSelectedIqraPage(page);
    setAnalysis(null);
    setIsDropdownOpen(false);
  };

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
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-6 gap-8 mt-8 md:mt-0 relative z-10 py-12">

        {/* Hero Section */}
        <div className="text-center space-y-6">

          {/* --- MODE SWITCHER (TABS) --- */}
          <div className="inline-flex bg-black/40 backdrop-blur-md p-1 rounded-xl border border-white/10 mx-auto">
            <button
              onClick={() => setMode('quran')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'quran' ? 'bg-pulse-deep text-pulse-glow shadow-lg' : 'text-zinc-500 hover:text-white'
                }`}
            >
              <BookOpen className="w-4 h-4" />
              Al-Quran
            </button>
            <button
              onClick={() => setMode('iqra')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'iqra' ? 'bg-emerald-900/40 text-emerald-400 shadow-lg' : 'text-zinc-500 hover:text-white'
                }`}
            >
              <Library className="w-4 h-4" />
              Iqra 1
            </button>
          </div>

          {/* --- CONTENT SELECTOR DROP DOWN --- */}
          <div className="relative inline-block text-left">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-3 transition-all duration-300 group mx-auto min-w-[280px] justify-between"
            >
              <span className="text-xl md:text-2xl font-bold text-white tracking-tight text-center flex-1">
                {currentTitle}
              </span>
              <ChevronDown className={`w-5 h-5 text-zinc-400 group-hover:text-white transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                <div className="absolute z-50 mt-2 w-full min-w-[320px] max-h-[400px] overflow-y-auto bg-[#0F1523] border border-white/10 rounded-2xl shadow-2xl left-1/2 -translate-x-1/2 backdrop-blur-xl custom-scrollbar">

                  {mode === 'quran' ? (
                    QURAN_INDEX.map((surah) => (
                      <button
                        key={surah.id}
                        onClick={() => handleSurahSelect(surah.id)}
                        className={`w-full text-left px-6 py-3 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${selectedSurahId === surah.id ? 'text-pulse-gold bg-pulse-gold/5' : 'text-zinc-400'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono opacity-50 w-6">{surah.id}</span>
                          <span className="font-semibold">{surah.name}</span>
                        </div>
                        {selectedSurahId === surah.id && <div className="w-2 h-2 rounded-full bg-pulse-gold"></div>}
                      </button>
                    ))
                  ) : (
                    IQRA_1_DATA.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => handleIqraSelect(page)}
                        className={`w-full text-left px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${selectedIqraPage.id === page.id ? 'text-emerald-400 bg-emerald-500/5' : 'text-zinc-400'
                          }`}
                      >
                        <span className="font-semibold">{page.title}</span>
                        {selectedIqraPage.id === page.id && <div className="w-2 h-2 rounded-full bg-emerald-400"></div>}
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <p className="text-slate-400 max-w-xl mx-auto text-lg font-light leading-relaxed px-4">
            Recite <span className="text-white font-medium">{currentTitle}</span> and get instant AI feedback.
            {mode === 'iqra' && <span className="block text-sm text-emerald-400/80 mt-1">Focus on pronouncing individual letters clearly.</span>}
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
              referenceText={currentReferenceText}
              surahName={currentTitle || ""}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
