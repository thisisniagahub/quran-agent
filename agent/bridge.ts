import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

/**
 * Bridge module to connect TypeScript agent to Python API
 * Handles audio file uploads and API communication
 */

/**
 * Sends an audio file to the Python API for processing
 * @param filePath - Path to the audio file to be processed
 * @returns Promise resolving to the API response
 */
export async function sendAudioToProcessor(filePath: string): Promise<any> {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    // Create FormData instance to send the file
    const formData = new FormData();
    
    // Append the audio file to the form data
    formData.append('file', fs.createReadStream(filePath));
    
    // Optional: You can also append expected_text if needed
    // formData.append('expected_text', ''); // Add expected text if available

    console.log(`Sending audio file to API: ${filePath}`);
    
    // Send POST request to the Python API
    const response = await axios.post('http://localhost:8000/analyze/audio', formData, {
      headers: {
        ...formData.getHeaders(), // This sets the correct Content-Type for multipart/form-data
      },
      timeout: 30000, // 30 second timeout
    });

    console.log('API Response received:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error: any) {
    console.error('Error sending audio to processor:', error.message);
    
    if (error.response) {
      // Server responded with error status
      console.error('API Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received from API:', error.request);
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
    }
    
    throw error;
  }
}

/**
 * Alternative function to send audio with additional parameters
 * @param filePath - Path to the audio file to be processed
 * @param expectedText - Optional expected text for comparison
 * @returns Promise resolving to the API response
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

    console.log(`Sending audio file to API: ${filePath}`);
    if (expectedText) {
      console.log(`With expected text: ${expectedText.substring(0, 50)}...`);
    }
    
    const response = await axios.post('http://localhost:8000/analyze/audio', formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000,
    });

    console.log('API Response received:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error: any) {
    console.error('Error sending audio to processor:', error.message);
    
    if (error.response) {
      console.error('API Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received from API:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    
    throw error;
  }
}

// Example usage function
export async function exampleUsage() {
  try {
    // Example call - replace with actual file path
    const result = await sendAudioToProcessor('./sample_audio.wav');
    console.log('Processing completed successfully');
    return result;
  } catch (error) {
    console.error('Processing failed:', error);
  }
}

export default sendAudioToProcessor;