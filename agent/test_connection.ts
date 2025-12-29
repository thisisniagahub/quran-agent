import { sendAudioToProcessor } from './bridge';
import * as path from 'path';

async function runTest() {
  try {
    // Use the test_audio.wav we verified earlier
    const audioPath = path.resolve(__dirname, '../test_audio.wav'); 
    console.log('Testing integration with audio file:', audioPath);
    
    const result = await sendAudioToProcessor(audioPath);
    console.log('✅ INTEGRATION SUCCESSFUL!');
    console.log('Received Q-WER Score:', result.analysis.qwer);
    console.log('Level:', result.analysis.level);
  } catch (error) {
    console.error('❌ INTEGRATION FAILED:', error);
  }
}

runTest();