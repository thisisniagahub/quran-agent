import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, FileText, Eye, EyeOff, Play, Pause, Volume2, Award, Info } from 'lucide-react';

const REFERENCE_TEXT = "بسم الله الرحمن الرحيم الحمد لله رب العالمين الرحمن الرحيم مالك يوم الدين اياك نعبد واياك نستعين اهدنا الصراط المستقيم صراط الذين انعمت عليهم غير المغضوب عليهم ولا الضالين";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ScoreDisplay({ result }: { result: any }) {
    const [showDebug, setShowDebug] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

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

    // --- Logic & Premium Styling ---
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
        const refWords = REFERENCE_TEXT.split(" ");
        const userWords = userTranscription.split(" ");

        return (
            <div className="flex flex-wrap gap-3 justify-end leading-loose" dir="rtl">
                {refWords.map((word, index) => {
                    const userWord = userWords[index] || "";
                    const isMatch = userWord.includes(word) || word.includes(userWord);

                    return (
                        <span
                            key={index}
                            className={`px-3 py-1.5 rounded-xl text-2xl md:text-3xl font-arabic transition-all duration-300
                ${isMatch
                                    ? "text-emerald-400"
                                    : "text-red-400 line-through decoration-red-500/40 decoration-2 opacity-80"
                                }
              `}
                        >
                            {word}
                        </span>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {audioUrl && <audio ref={audioRef} src={audioUrl} />}

            {/* MAIN CARD */}
            <div className={`relative overflow-hidden rounded-[2rem] border backdrop-blur-xl p-8 transition-all duration-500 hover:shadow-2xl ${statusBg} ${ringColor} shadow-xl`}>

                {/* Detail Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-10">

                    {/* Score Circle */}
                    <div className="relative group">
                        {/* Outer Glow Ring */}
                        <div className={`absolute -inset-4 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 ${statusColor.replace('text-', 'bg-')}`}></div>

                        <div className={`relative w-40 h-40 rounded-full border-[8px] ${ringColor} flex flex-col items-center justify-center bg-black/40 backdrop-blur-2xl shadow-inner`}>
                            <span className={`text-6xl font-bold tracking-tighter ${statusColor}`}>
                                {typeof qwer === 'number' ? qwer.toFixed(1) : "0.0"}
                            </span>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mt-2">Q-WER</span>
                        </div>
                    </div>

                    {/* Feedback Logic */}
                    <div className="flex-1 text-center md:text-left space-y-6">
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <Icon className={`w-8 h-8 ${statusColor}`} />
                                <h2 className={`text-3xl md:text-4xl font-bold tracking-tight text-white`}>{statusText}</h2>
                            </div>
                            <p className="text-zinc-400 text-lg font-light leading-relaxed">{statusSub}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            {/* Play Button */}
                            {audioUrl ? (
                                <button
                                    onClick={togglePlay}
                                    className="bg-pulse-gold hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-yellow-500/20"
                                >
                                    {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black" />}
                                    <span className="uppercase text-xs tracking-wider">Replay Recitation</span>
                                </button>
                            ) : (
                                <div className="bg-white/5 px-6 py-3 rounded-xl flex items-center gap-2 text-white/20">
                                    <Volume2 className="w-5 h-5" />
                                    <span className="uppercase text-xs tracking-wider">No Audio</span>
                                </div>
                            )}

                            {/* Stats Chip */}
                            <div className="bg-black/40 px-5 py-3 rounded-xl border border-white/5 flex items-center gap-3">
                                <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Errors</span>
                                <span className="text-xl font-mono text-white">{analysis.total_errors || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ANALYSIS CARD (The Mushaf View) */}
            <div className="mt-8 bg-[#0F1523]/80 rounded-[2rem] border border-white/5 overflow-hidden backdrop-blur-lg relative group">

                {/* Subtle Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>

                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="bg-pulse-gold/20 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-pulse-gold" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold flex items-center gap-2">Verse Analysis</h3>
                            <p className="text-xs text-zinc-500">Surah Al-Fatihah</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowDebug(!showDebug)}
                        className="text-xs flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                    >
                        {showDebug ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>Raw Data</span>
                    </button>
                </div>

                <div className="p-8 md:p-10">
                    {/* Legend */}
                    <div className="flex justify-center gap-8 mb-8 text-xs font-medium uppercase tracking-widest text-zinc-500">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>
                            <span>Correct</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]"></span>
                            <span>Needs Work</span>
                        </div>
                    </div>

                    {/* THE QURAN TEXT */}
                    <div className="bg-[#0a0f1c] rounded-2xl p-8 border border-white/5 shadow-inner">
                        {renderDiff()}
                    </div>
                </div>

                {/* Debug Panel */}
                {showDebug && (
                    <div className="bg-black p-6 text-xs font-mono text-green-400/70 border-t border-white/10 break-all leading-relaxed">
                        <div className="flex items-center gap-2 mb-2 text-white/40 uppercase tracking-widest text-[10px]">
                            <Info className="w-3 h-3" /> AI Transcription Output
                        </div>
                        &quot;{userTranscription}&quot;
                    </div>
                )}
            </div>
        </div>
    );
}
