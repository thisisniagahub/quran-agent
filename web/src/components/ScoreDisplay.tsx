import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, FileText, Eye, EyeOff, Play, Pause, Volume2 } from 'lucide-react';

// Teks Rujukan (Al-Fatihah Tanpa Baris - Untuk comparison mudah)
const REFERENCE_TEXT = "بسم الله الرحمن الرحيم الحمد لله رب العالمين الرحمن الرحيم مالك يوم الدين اياك نعبد واياك نستعين اهدنا الصراط المستقيم صراط الذين انعمت عليهم غير المغضوب عليهم ولا الضالين";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ScoreDisplay({ result }: { result: any }) {
    const [showDebug, setShowDebug] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Safety Check Data
    const analysis = result?.analysis || {};
    const audioInfo = result?.audio_info || {};
    const audioUrl = result?.audioUrl; // New: Talaqqi Mode URL
    const qwer = analysis.qwer || 0;

    // Ambil teks dari AI
    const userTranscription = (audioInfo.transcription || "").replace(/[^\w\s\u0600-\u06FF]/gi, '');

    // Handle Playback
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

    // Reset play state when audio ends
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.onended = () => setIsPlaying(false);
        }
    }, [audioRef]); // Re-bind if ref changes (which is rare but safe)

    // Logik Level & Warna
    let statusColor = "text-red-500";
    let statusBg = "bg-red-500/10 border-red-500/30";
    let Icon = XCircle;
    let statusText = "Perlu Latihan";

    if (qwer > 0 && qwer < 15) {
        statusColor = "text-emerald-400";
        statusBg = "bg-emerald-400/10 border-emerald-400/30";
        Icon = CheckCircle2;
        statusText = "Mumtaz (Cemerlang)";
    } else if (qwer >= 15 && qwer < 40) {
        statusColor = "text-yellow-400";
        statusBg = "bg-yellow-400/10 border-yellow-400/30";
        Icon = AlertTriangle;
        statusText = "Jayyid (Baik)";
    }

    // --- LOGIK MERAH / HIJAU (DIFF CHECKER) ---
    const renderDiff = () => {
        const refWords = REFERENCE_TEXT.split(" ");
        const userWords = userTranscription.split(" ");

        return (
            <div className="flex flex-wrap gap-2 justify-end" dir="rtl">
                {refWords.map((word, index) => {
                    // Cari kalau user ada sebut perkataan ni
                    const userWord = userWords[index] || "";

                    // Logic mudah: Check inclusion
                    const isMatch = userWord.includes(word) || word.includes(userWord);

                    return (
                        <span
                            key={index}
                            className={`px-3 py-1 rounded-lg text-xl md:text-2xl font-arabic transition-all duration-500 border
                ${isMatch
                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" // Green (Correct)
                                    : "bg-red-500/20 text-red-400 border-red-500/30 line-through decoration-red-500/50" // Red (Wrong)
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
        <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Hidden Audio Element */}
            {audioUrl && <audio ref={audioRef} src={audioUrl} />}

            {/* KAD MARKAH UTAMA */}
            <div className={`relative overflow-hidden rounded-3xl border backdrop-blur-md p-6 md:p-8 ${statusBg} mb-6`}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">

                    {/* Bulatan Score */}
                    <div className="relative group flex-shrink-0">
                        <div className={`absolute inset-0 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${statusColor.replace('text-', 'bg-')}`}></div>
                        <div className="relative w-36 h-36 rounded-full border-[6px] border-white/5 flex flex-col items-center justify-center bg-pulse-dark/80 backdrop-blur-xl shadow-2xl">
                            <span className={`text-5xl font-black ${statusColor}`}>
                                {typeof qwer === 'number' ? qwer.toFixed(1) : "0.0"}
                            </span>
                            <span className="text-[10px] text-white/40 uppercase tracking-widest mt-2 font-semibold">Q-WER Score</span>
                        </div>
                    </div>

                    {/* Info Text & Controls */}
                    <div className="flex-1 w-full text-center md:text-left space-y-4">
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                <Icon className={`w-7 h-7 ${statusColor}`} />
                                <h2 className={`text-3xl font-bold tracking-tight ${statusColor}`}>{statusText}</h2>
                            </div>
                            <p className="text-white/50 text-sm">Analisis AI mendapati bacaan anda berada di tahap <span className="text-white font-medium">{analysis.level || "Unknown"}</span>.</p>
                        </div>

                        {/* ERROR STATS + PLAY BUTTON */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {/* Play Button Box */}
                            {audioUrl ? (
                                <button
                                    onClick={togglePlay}
                                    className="bg-pulse-glow/10 hover:bg-pulse-glow/20 border border-pulse-glow/30 rounded-lg p-3 flex flex-col items-center justify-center gap-1 group transition-all"
                                >
                                    {isPlaying ? (
                                        <Pause className="w-6 h-6 text-pulse-glow group-hover:scale-110 transition-transform" />
                                    ) : (
                                        <Play className="w-6 h-6 text-pulse-glow group-hover:scale-110 transition-transform" />
                                    )}
                                    <span className="text-[10px] text-pulse-glow uppercase font-bold tracking-wider">
                                        {isPlaying ? "Pause" : "Talaqqi Replay"}
                                    </span>
                                </button>
                            ) : (
                                <div className="bg-white/5 rounded-lg p-3 flex flex-col items-center justify-center opacity-50">
                                    <Volume2 className="w-6 h-6 text-white/40" />
                                    <span className="text-[10px] text-white/40 uppercase">No Audio</span>
                                </div>
                            )}

                            <div className="bg-black/20 rounded-lg p-3 border border-white/5 flex flex-col items-center justify-center">
                                <span className="text-xs text-white/40 uppercase block mb-1">Focus Area</span>
                                <span className="text-lg font-bold text-white capitalize leading-none">
                                    {analysis.dominant_error_types?.[0] || "None"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BAHAGIAN ANALISIS AYAT (Mistake Highlighter) */}
            <div className="bg-pulse-dark/50 rounded-3xl border border-pulse-deep/20 overflow-hidden shadow-2xl">
                <div className="bg-black/20 px-6 py-4 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-pulse-glow" />
                        Analisis Bacaan (Al-Fatihah)
                    </h3>
                    <button
                        onClick={() => setShowDebug(!showDebug)}
                        className="text-xs flex items-center gap-1 text-white/30 hover:text-white transition-colors"
                    >
                        {showDebug ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showDebug ? "Hide Raw" : "Show Raw"}
                    </button>
                </div>

                <div className="p-8 bg-gradient-to-b from-pulse-deep/5 to-transparent">
                    {/* VISUAL DIFF (Merah/Hijau) */}
                    <div className="mb-6 leading-loose" dir="rtl">
                        <p className="text-xs text-center text-white/30 mb-8 uppercase tracking-widest border-b border-white/5 pb-4">
                            <span className="text-emerald-400">HIJAU = TEPAT</span> &nbsp; • &nbsp; <span className="text-red-400 line-through">MERAH = SALAH/TERTINGGAL</span>
                        </p>
                        {renderDiff()}
                    </div>
                </div>

                {/* Debug Raw Transcription */}
                {showDebug && (
                    <div className="bg-black p-4 text-xs font-mono text-white/50 border-t border-white/10 break-all">
                        RAW AI HEARD: &quot;{userTranscription}&quot;
                    </div>
                )}
            </div>
        </div>
    );
}
