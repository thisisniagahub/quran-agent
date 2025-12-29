import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Sends audio file to Python API for analysis
 * @param filePath - Path to the audio file to be analyzed
 * @returns Promise resolving to the analysis response from Python server
 */
export async function sendAudioToProcessor(filePath: string): Promise<any> {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    // Create FormData instance to send file
    const formData = new FormData();
    
    // Append the audio file to the form data
    formData.append('file', fs.createReadStream(filePath));
    
    // You can also append expected text if needed
    // formData.append('expected_text', 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'); // Example Uthmani text

    console.log(`Sending audio file to Python API: ${filePath}`);
    
    // Send POST request to Python FastAPI server
    const response = await axios.post('http://localhost:8000/analyze/audio', formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000, // 30 second timeout
    });

    console.log('Response received from Python server:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error when sending to Python API:', error.response?.data || error.message);
      throw new Error(`API request failed: ${error.response?.data?.detail || error.message}`);
    } else {
      console.error('Error sending audio to processor:', error);
      throw error;
    }
  }
}

/**
 * Alternative function to send audio with expected text
 * @param filePath - Path to the audio file to be analyzed
 * @param expectedText - Expected Arabic text for alignment (optional)
 * @returns Promise resolving to the analysis response from Python server
 */
export async function sendAudioToProcessorWithText(filePath: string, expectedText: string = ''): Promise<any> {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    
    if (expectedText) {
      formData.append('expected_text', expectedText);
    }

    console.log(`Sending audio file to Python API: ${filePath}`);
    if (expectedText) {
      console.log(`Expected text: ${expectedText}`);
    }
    
    const response = await axios.post('http://localhost:8000/analyze/audio', formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000,
    });

    console.log('Response received from Python server:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error when sending to Python API:', error.response?.data || error.message);
      throw new Error(`API request failed: ${error.response?.data?.detail || error.message}`);
    } else {
      console.error('Error sending audio to processor:', error);
      throw error;
    }
  }
}

// Example usage function
export async function testConnection(): Promise<void> {
  console.log('Testing connection to Python API...');
  
  try {
    // This would test with a real audio file if available
    console.log('Bridge functions ready for use');
  } catch (error) {
    console.error('Test connection failed:', error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testConnection();
}