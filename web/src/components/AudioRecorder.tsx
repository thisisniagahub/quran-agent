"use client";
import React, { useState, useRef } from 'react';
import { AudioLines, Square, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AudioAnalysisResponse } from '@/types/api';

interface AudioRecorderProps {
    onResult: (data: AudioAnalysisResponse) => void;
}

export default function AudioRecorder({ onResult }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // --- SETTING API URL (AUTO-UPDATED) ---
    const API_URL = "https://nonscheduled-kallie-unsupposable.ngrok-free.dev";
    // --------------------------------------

    const startRecording = async () => {
        setErrorMsg(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                setIsProcessing(true);
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);

                const formData = new FormData();
                const file = new File([audioBlob], "recording.wav", { type: "audio/wav" });
                formData.append('file', file);

                try {
                    console.log("Hantar ke:", API_URL);
                    const response = await axios.post(`${API_URL}/analyze/audio`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });

                    const finalResult: AudioAnalysisResponse = {
                        ...response.data,
                        audioUrl: audioUrl
                    };

                    onResult(finalResult);

                } catch (error: unknown) {
                    console.error("Error analyzing audio:", error);
                    let message = "Gagal hubungi AI. Sila pastikan Ngrok hidup!";

                    if (axios.isAxiosError(error)) {
                        if (error.code === "ERR_NETWORK") {
                            message = "Network Error: Tak dapat tembus ke PC Bos (Check Ngrok).";
                        } else if (error.response) {
                            message = `Server Error: ${error.response.status} - ${error.response.data?.detail || "Unknown"}`;
                        }
                    }
                    setErrorMsg(message);
                } finally {
                    setIsProcessing(false);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setErrorMsg("Sila benarkan akses mikrofon.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-10 w-full max-w-md mx-auto">
            <div className="relative group">
                {/* Glow Effects */}
                <div className={`absolute inset-0 rounded-full blur-[50px] transition-all duration-700 ${isRecording ? 'bg-pulse-gold/30 scale-125' : 'bg-pulse-deep/20 scale-100 group-hover:scale-110'}`}></div>

                {/* Pulse Waves Animation */}
                {isRecording && (
                    <>
                        <motion.div
                            animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                            className="absolute inset-0 bg-pulse-gold/20 rounded-full blur-xl"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: 0.5, ease: "easeOut" }}
                            className="absolute inset-0 bg-pulse-glow/20 rounded-full blur-md"
                        />
                    </>
                )}

                {/* Main Recording Button */}
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                    className={`relative z-10 w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl
            ${isRecording
                            ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_50px_rgba(239,68,68,0.5)] scale-100 ring-4 ring-red-400/30'
                            : 'bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-pulse-gold/30 hover:border-pulse-gold hover:shadow-[0_0_60px_rgba(212,175,55,0.3)] hover:scale-105'
                        }
          `}
                >
                    {isProcessing ? (
                        <Loader2 className="w-16 h-16 text-pulse-gold animate-spin backdrop-blur-md" />
                    ) : isRecording ? (
                        <Square className="w-12 h-12 text-white fill-current drop-shadow-md" />
                    ) : (
                        // AudioLines Icon with Gradient Effect
                        <div className="relative">
                            <AudioLines className="w-16 h-16 text-pulse-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                        </div>
                    )}
                </button>
            </div>

            {/* Helper Text */}
            <div className="mt-10 text-center space-y-2">
                <p className={`font-semibold tracking-wide text-xl transition-colors duration-300 ${isRecording ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                    {isProcessing ? "Analyzing Recitation..." : isRecording ? "Recording in progress..." : "Tap to Recite"}
                </p>
                {!isRecording && !isProcessing && (
                    <p className="text-pulse-gold/60 text-sm font-light tracking-widest uppercase">Start with Al-Fatihah</p>
                )}
            </div>

            {/* Error Message */}
            {errorMsg && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex items-center gap-3 text-red-200 bg-red-900/40 px-5 py-3 rounded-full border border-red-500/30 backdrop-blur-md"
                >
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-sm font-medium">{errorMsg}</span>
                </motion.div>
            )}
        </div>
    );
}
