import { sendAudioToProcessor } from './bridge';
import * as path from 'path';
import * as fs from 'fs';

async function runTest() {
  try {
    // Tunjuk ke fail MP3 yang awak dah rename tadi
    const audioPath = path.resolve(__dirname, '../test_audio.mp3'); 
    
    console.log('🔍 Memastikan fail wujud:', audioPath);
    
    if (!fs.existsSync(audioPath)) {
        console.error('❌ Fail test_audio.mp3 TIDAK JUMPA! Pastikan ejaan nama fail betul.');
        return;
    }

    console.log('🚀 Menghantar fail ke AI (Whisper)...');
    
    // Hantar ke server
    const result = await sendAudioToProcessor(audioPath);
    
    console.log('---------------------------------------------');
    console.log('✅ AI BERJAYA MENDENGAR!');
    console.log('📜 Transkripsi (Apa AI dengar):');
    
    // Kita ambil text dari response
    // Nota: Whisper mungkin letak text dalam 'detailed_errors' atau 'transcription' field bergantung pada implementation main.py tadi
    // Kita cuba print structure error pertama yang selalunya mengandungi text
    console.log(result.analysis?.detailed_errors?.[0]?.description || "Tiada teks dikesan"); 
    
    console.log('---------------------------------------------');
    console.log('📊 Markah Q-WER:', result.analysis?.qwer);
  } catch (error) {
    console.error('❌ TEST GAGAL:', error);
  }
}

runTest();
