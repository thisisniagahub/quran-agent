"use client";
import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface AudioRecorderProps {
  onResult: (data: any) => void;
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
          const response = await axios.post($("")/analyze/audio, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          
          onResult({
            ...response.data,
            audioUrl: audioUrl
          });
          
        } catch (error: any) {
          console.error("Error analyzing audio:", error);
          let message = "Gagal hubungi AI. Sila pastikan Ngrok hidup!";
          if (error.code === "ERR_NETWORK") {
             message = "Network Error: Tak dapat tembus ke PC Bos (Check Ngrok).";
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
      <div className="relative">
        {isRecording && (
          <>
            <motion.div
              animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 bg-pulse-glow/30 rounded-full blur-xl"
            />
            <motion.div
              animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.5, ease: "easeOut" }}
              className="absolute inset-0 bg-pulse-deep/40 rounded-full blur-md"
            />
          </>
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={elative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_30px_rgba(0,240,255,0.2)] 
            
          }
        >
          {isProcessing ? (
            <Loader2 className="w-12 h-12 text-pulse-glow animate-spin" />
          ) : isRecording ? (
            <Square className="w-10 h-10 text-white fill-current" />
          ) : (
            <Mic className="w-12 h-12 text-pulse-glow" />
          )}
        </button>
      </div>

      <p className={mt-8 font-medium tracking-wide text-lg transition-colors duration-300 }>
        {isProcessing 
          ? "Sedang Menganalisis..." 
          : isRecording 
            ? "Sedang Merekod... (Baca Al-Fatihah)" 
            : "Tekan untuk Mula"}
      </p>

      {errorMsg && (
        <div className="mt-6 flex items-center gap-2 text-red-400 bg-red-500/10 px-4 py-3 rounded-lg border border-red-500/20">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
