import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, XCircle, FileText, Eye, EyeOff, Play, Pause, Volume2, Award, BarChart2, BookOpen, Quote } from 'lucide-react';
import { motion, AnimatePresence, animate } from 'framer-motion';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ScoreDisplay({ result, referenceText, surahName }: { result: any, referenceText: string, surahName: string }) {
    const [activeTab, setActiveTab] = useState<'summary' | 'analysis'>('summary');
    const [showDebug, setShowDebug] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Reset tab when result changes (new recording)
    useEffect(() => {
        if (result) {
            setActiveTab('summary');
        }
    }, [result]);

    const analysis = result?.analysis || {};
    const audioInfo = result?.audio_info || {};
    const audioUrl = result?.audioUrl;
    const qwer = analysis.qwer || 0;

    const userTranscription = (audioInfo.transcription || "").replace(/[^\w\s\u0600-\u06FF]/gi, '');

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.onended = () => setIsPlaying(false);
        }
    }, [audioRef]);

    // --- Logic & Style Definitions ---
    let statusColor = "text-red-400";
    let statusBg = "bg-gradient-to-br from-red-900/40 to-black/60 border-red-500/20";
    let ringColor = "border-red-500/20";
    let Icon = XCircle;
    let statusText = "Needs Practice";
    let statusSub = "Keep trying! Consistent practice builds mastery.";

    if (qwer > 0 && qwer < 15) {
        statusColor = "text-emerald-400";
        statusBg = "bg-gradient-to-br from-emerald-900/40 to-black/60 border-emerald-500/20";
        ringColor = "border-emerald-500/30";
        Icon = CheckCircle2;
        statusText = "Excellent (Mumtaz)";
        statusSub = "MashaAllah! Your recitation is very accurate.";
    } else if (qwer >= 15 && qwer < 40) {
        statusColor = "text-pulse-gold";
        statusBg = "bg-gradient-to-br from-amber-900/40 to-black/60 border-pulse-gold/20";
        ringColor = "border-pulse-gold/30";
        Icon = Award;
        statusText = "Good (Jayyid)";
        statusSub = "Good effort. Focus on the highlighted areas to improve.";
    }

    const renderDiff = () => {
        const refWords = referenceText.split(" ");
        const userWords = userTranscription.split(" ");

        return (
            <div className="flex flex-wrap gap-2 md:gap-4 justify-end leading-loose" dir="rtl">
                {refWords.map((word, index) => {
                    const userWord = userWords[index] || "";
                    const isMatch = userWord.includes(word) || word.includes(userWord);

                    return (
                        <motion.span
                            key={index}
                            initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                            animate={isMatch
                                ? { opacity: 1, y: 0, filter: "blur(0px)", textShadow: ["0 0 0px #34d399", "0 0 15px #34d399", "0 0 0px #34d399"] }
                                : { opacity: 1, y: 0, filter: "blur(0px)" }
                            }
                            transition={{ delay: index * 0.05, duration: 0.5 }}
                            className={`px-2 py-1 md:px-3 md:py-2 rounded-lg text-xl md:text-3xl font-arabic transition-all
                ${isMatch
                                    ? "text-emerald-400 bg-emerald-500/5"
                                    : "text-red-400 bg-red-500/5 line-through decoration-red-500/40 decoration-2 opacity-80"
                                }
              `}
                        >
                            {word}
                        </motion.span>
                    );
                })}
            </div>
        );
    };

    // --- IDLE STATE: TELEPROMPTER MODE ---
    if (!result) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key="teleprompter"
                className="w-full max-w-3xl"
            >
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 opacity-80">
                    <Quote className="w-5 h-5 text-pulse-gold flipped-x scale-x-[-1]" />
                    <span className="text-sm font-bold tracking-widest text-pulse-gold uppercase">Reading Mode</span>
                </div>

                {/* Card */}
                <div className="bg-black/30 backdrop-blur-md rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden group">
                    {/* Glow Effect */}
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-pulse-gold/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2 group-hover:bg-pulse-gold/10 transition-colors duration-1000" />

                    <div className="relative z-10 flex flex-col gap-6">
                        <div className="text-center space-y-2">
                            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-[0.2em]">Surah Selection</h3>
                            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{surahName}</h2>
                        </div>

                        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-pulse-gold/50 to-transparent mx-auto my-4" />

                        <p className="text-2xl md:text-4xl font-arabic text-center leading-[2.5] text-white/90 drop-shadow-lg" dir="rtl">
                            {referenceText}
                        </p>

                        <p className="text-center text-zinc-500 text-xs mt-8 flex items-center justify-center gap-2">
                            <span className="animate-pulse w-2 h-2 rounded-full bg-pulse-gold"></span>
                            Press mic to verify your recitation
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    // --- RESULT STATE ---
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl"
        >
            {audioUrl && <audio ref={audioRef} src={audioUrl} />}

            {/* --- TAB NAVIGATION --- */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex p-1.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 mb-6 sticky top-20 z-40 shadow-xl"
            >
                <button
                    onClick={() => setActiveTab('summary')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${activeTab === 'summary'
                            ? 'bg-pulse-deep/20 text-pulse-glow shadow-inner border border-pulse-deep/30'
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                        }`}
                >
                    <BarChart2 className="w-4 h-4" />
                    RINGKASAN
                </button>
                <button
                    onClick={() => setActiveTab('analysis')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${activeTab === 'analysis'
                            ? 'bg-pulse-gold/10 text-pulse-gold shadow-inner border border-pulse-gold/20'
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                        }`}
                >
                    <BookOpen className="w-4 h-4" />
                    ANALISIS AYAT
                </button>
            </motion.div>

            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">

                    {/* --- TAB 1: SUMMARY --- */}
                    {activeTab === 'summary' && (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, type: "spring" }}
                            className={`relative overflow-hidden rounded-[2rem] border backdrop-blur-xl p-8 transition-all duration-500 ${statusBg} ${ringColor} shadow-2xl`}
                        >
                            <div className="flex flex-col items-center text-center gap-8">
                                {/* Header Status */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-center gap-3">
                                        <Icon className={`w-8 h-8 ${statusColor}`} />
                                        <h2 className={`text-3xl font-bold tracking-tight text-white`}>{statusText}</h2>
                                    </div>
                                    <p className="text-zinc-400 text-sm font-light leading-relaxed max-w-sm mx-auto">{statusSub}</p>
                                </div>

                                {/* Large Score Circle */}
                                <div className="relative group my-4">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className={`absolute -inset-6 rounded-full blur-3xl ${statusColor.replace('text-', 'bg-')}`}
                                    />
                                    <div className={`relative w-48 h-48 rounded-full border-[6px] ${ringColor} flex flex-col items-center justify-center bg-black/40 backdrop-blur-2xl shadow-inner`}>
                                        <span className={`text-7xl font-bold tracking-tighter ${statusColor}`}>
                                            <Counter value={qwer} />
                                        </span>
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold mt-2">Q-WER SCORE</span>
                                    </div>
                                </div>

                                {/* Action Buttons Row */}
                                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                    {/* Play Button */}
                                    {audioUrl ? (
                                        <button
                                            onClick={togglePlay}
                                            className="flex-1 bg-pulse-gold hover:bg-yellow-400 text-black px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-lg shadow-yellow-500/20 group"
                                        >
                                            {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black" />}
                                            <span className="uppercase text-xs tracking-wider">Dengar Semula (Talaqqi)</span>
                                        </button>
                                    ) : (
                                        <div className="flex-1 bg-white/5 px-6 py-4 rounded-xl flex items-center justify-center gap-2 text-white/20">
                                            <Volume2 className="w-5 h-5" />
                                            <span className="uppercase text-xs tracking-wider">No Audio</span>
                                        </div>
                                    )}

                                    {/* Stats Button */}
                                    <div className="flex-1 bg-black/40 px-6 py-4 rounded-xl border border-white/5 flex items-center justify-center gap-3">
                                        <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Total Errors:</span>
                                        <span className={`text-xl font-mono ${analysis.total_errors > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {analysis.total_errors || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* --- TAB 2: ANALYSIS (DIFF) --- */}
                    {activeTab === 'analysis' && (
                        <motion.div
                            key="analysis"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-[#0F1523]/90 rounded-[2rem] border border-white/5 overflow-hidden backdrop-blur-lg relative group min-h-[500px]"
                        >
                            {/* Pattern Overlay */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>

                            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/30">
                                <div className="flex items-center gap-3">
                                    <div className="bg-pulse-gold/10 p-2 rounded-lg border border-pulse-gold/20">
                                        <FileText className="w-5 h-5 text-pulse-gold" />
                                    </div>
                                    <div>
                                        <h3 className="text-white text-sm font-bold uppercase tracking-wide">Semakan Bacaan</h3>
                                        <p className="text-[10px] text-zinc-500">{surahName}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowDebug(!showDebug)}
                                    className="text-[10px] flex items-center gap-1.5 text-zinc-600 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                                >
                                    {showDebug ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    <span>Debug</span>
                                </button>
                            </div>

                            <div className="p-6 md:p-8">
                                {/* Legend */}
                                <div className="flex justify-center gap-6 mb-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-black/20 py-2 rounded-full mx-auto max-w-xs border border-white/5">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                                        <span>Tepat</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]"></span>
                                        <span>Salah / Tertinggal</span>
                                    </div>
                                </div>

                                {/* MUSHAF VIEW (Animated) */}
                                <div className="bg-[#0a0f1c] rounded-2xl p-6 md:p-8 border border-white/5 shadow-inner">
                                    {renderDiff()}
                                </div>
                            </div>

                            {/* Debug Panel */}
                            {showDebug && (
                                <div className="bg-black p-6 text-xs font-mono text-zinc-500 border-t border-white/10 break-all leading-relaxed">
                                    RAW AI INPUT: &quot;{userTranscription}&quot;
                                </div>
                            )}
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// Helper for Counter
function Counter({ value }: { value: number }) {
    const nodeRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;

        const controls = animate(0, value, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate: (latest) => {
                node.textContent = latest.toFixed(1);
            }
        });

        return () => controls.stop();
    }, [value]);

    return <span ref={nodeRef}>{value.toFixed(1)}</span>;
}
