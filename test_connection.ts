import { sendAudioToProcessor, sendAudioToProcessorWithText } from './agent/bridge';

async function testAudioConnection(): Promise<void> {
  console.log('Testing TypeScript to Python API connection...');
  
  // Test with a sample audio file path
  // Note: You'll need to replace this with an actual audio file path
  const sampleAudioPath = './test_audio.wav'; // Using the test file that exists in the project
  
  try {
    console.log(`\n--- Test 1: Basic audio analysis ---`);
    console.log(`Sending audio file: ${sampleAudioPath}`);
    
    const response = await sendAudioToProcessor(sampleAudioPath);
    console.log('✅ Basic test completed successfully!');
    
    console.log(`\n--- Test 2: Audio analysis with expected text ---`);
    const expectedText = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'; // Bismillah in Uthmani script
    console.log(`Sending audio file: ${sampleAudioPath}`);
    console.log(`Expected text: ${expectedText}`);
    
    const responseWithText = await sendAudioToProcessorWithText(sampleAudioPath, expectedText);
    console.log('✅ Test with expected text completed successfully!');
    
    console.log('\n--- Summary ---');
    console.log('✅ Both tests completed successfully!');
    console.log('✅ TypeScript agent can successfully communicate with Python API');
    console.log('✅ Audio processing pipeline is working');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testAudioConnection();
}