// frontend/src/pages/DashboardPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [seed, setSeed] = useState('');
  const [proportion, setProportion] = useState('landscape');
  const [image, setImage] = useState(null);
  const [sourceImage, setSourceImage] = useState(null);
  const [targetImage, setTargetImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('generate');

  // Convert file -> base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select an image file'));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('File size must be less than 5MB'));
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });

  // ---- GENERATORS ----
  // const generateImage = async (model) => {
  //   setLoading(true);
  //   setError('');
  //   try {
  //     let payload = { prompt };
      
  //     if (negativePrompt) payload.negative_prompt = negativePrompt;
  //     if (seed) payload.seed = parseInt(seed);
      
  //     // Add model-specific parameters
  //     if (model === 'flux') {
  //       payload.proportion = proportion;
  //     }

  //     const res = await axios.post(`generate-${model}`, payload);
  //     setGeneratedImage(`data:image/png;base64,${res.data.image_data}`);
  //   } catch (err) {
  //     setError(err.response?.data?.error || err.message || 'Error generating image');
  //     console.error('Generation error:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // In your DashboardPage.js, update the generateImage function:
const generateImage = async (model) => {
  setLoading(true);
  setError('');
  try {
    let payload = { prompt };
    
    if (negativePrompt) payload.negative_prompt = negativePrompt;
    if (seed) payload.seed = parseInt(seed);
    
    // Add model-specific parameters
    if (model === 'flux') {
      payload.proportion = proportion;
    }

    const res = await axios.post(`https://pixelmindia.onrender.com/api/images/generate-${model}`, payload);
    
    if (res.data.error) {
      throw new Error(res.data.error);
    }
    
    if (!res.data.image_data) {
      throw new Error('No image data received from server');
    }
    
    setGeneratedImage(`data:image/png;base64,${res.data.image_data}`);
  } catch (err) {
    // Show the actual error message from the backend
    const errorMessage = err.response?.data?.message || 
                         err.response?.data?.error || 
                         err.message || 
                         'Error generating image';
    setError(errorMessage);
    console.error('Generation error:', err.response?.data || err);
  } finally {
    setLoading(false);
  }
};

  const handleFaceSwap = async () => {
    if (!sourceImage || !targetImage) {
      setError('Please upload both source and target images');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const sourceBase64 = await toBase64(sourceImage);
      const targetBase64 = await toBase64(targetImage);
      
      const res = await axios.post('https://pixelmindia.onrender.com/api/images/faceswap', {
        source_image_data: sourceBase64,
        target_image_data: targetBase64,
      });
      
      setGeneratedImage(`data:image/png;base64,${res.data.image_data}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error performing face swap');
      console.error('Face swap error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCutout = async () => {
    if (!image) {
      setError('Please upload an image');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const base64 = await toBase64(image);
      const res = await axios.post('https://pixelmindia.onrender.com/api/images/cutout', { 
        image_data: base64 
      });
      
      setGeneratedImage(`data:image/png;base64,${res.data.image_data}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error removing background');
      console.error('Cutout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpscale = async () => {
    if (!image) {
      setError('Please upload an image');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const base64 = await toBase64(image);
      const res = await axios.post('https://pixelmindia.onrender.com/api/images/upscale', {
        image_data: base64,
        upscaling_factor: 2,
      });
      
      setGeneratedImage(`data:image/png;base64,${res.data.image_data}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error upscaling image');
      console.error('Upscale error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOutpaint = async () => {
    if (!image) {
      setError('Please upload an image');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const base64 = await toBase64(image);
      const res = await axios.post('https://pixelmindia.onrender.com/api/images/outpaint', {
        image_data: base64,
        prompt,
        negative_prompt: negativePrompt,
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      });
      
      setGeneratedImage(`data:image/png;base64,${res.data.image_data}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error outpaining image');
      console.error('Outpaint error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    setPrompt('');
    setNegativePrompt('');
    setSeed('');
    setImage(null);
    setSourceImage(null);
    setTargetImage(null);
    setGeneratedImage(null);
    setError('');
  };

  return (
    <div className="dashboard">
      <h1>Pixelmind AI</h1>
      
      {error && <div className="error">{error}</div>}
      
      <div className="tab-navigation">
        <button 
          className={activeTab === 'generate' ? 'active' : ''} 
          onClick={() => setActiveTab('generate')}
        >
          Generate
        </button>
        <button 
          className={activeTab === 'edit' ? 'active' : ''} 
          onClick={() => setActiveTab('edit')}
        >
          Edit Images
        </button>
      </div>

      {activeTab === 'generate' && (
        <div className="generation-section">
          <h2>Generate New Images</h2>
          
          <div className="form-group">
            <label>Prompt:</label>
            <textarea
              placeholder="Describe what you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Negative Prompt (optional):</label>
            <textarea
              placeholder="What you don't want to see..."
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Seed (optional):</label>
            <input
              type="number"
              placeholder="Random seed number"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Proportion (for FLUX only):</label>
            <select value={proportion} onChange={(e) => setProportion(e.target.value)}>
              <option value="landscape">Landscape (1216×832)</option>
              <option value="portrait">Portrait (832×1216)</option>
              <option value="square">Square (1024×1024)</option>
              <option value="wide">Wide (1344×768)</option>
              <option value="vertical">Vertical (576×1024)</option>
            </select>
          </div>

          <div className="button-group">
            <button 
              onClick={() => generateImage('default')} 
              disabled={loading || !prompt}
            >
              {loading ? 'Generating...' : 'Generate Default (512×512)'}
            </button>
            <button 
              onClick={() => generateImage('xl')} 
              disabled={loading || !prompt}
            >
              {loading ? 'Generating...' : 'Generate XL (1024×1024)'}
            </button>
            <button 
              onClick={() => generateImage('flux')} 
              disabled={loading || !prompt}
            >
              {loading ? 'Generating...' : 'Generate FLUX'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'edit' && (
        <div className="editing-section">
          <h2>Edit Existing Images</h2>
          
          <div className="tool-section">
            <h3>Face Swap</h3>
            <div className="file-inputs">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setSourceImage(e.target.files[0])} 
              />
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setTargetImage(e.target.files[0])} 
              />
            </div>
            <button onClick={handleFaceSwap} disabled={loading}>
              {loading ? 'Processing...' : 'Swap Faces'}
            </button>
          </div>

          <div className="tool-section">
            <h3>Remove Background</h3>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setImage(e.target.files[0])} 
            />
            <button onClick={handleCutout} disabled={loading}>
              {loading ? 'Processing...' : 'Remove Background'}
            </button>
          </div>

          <div className="tool-section">
            <h3>Upscale Image</h3>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setImage(e.target.files[0])} 
            />
            <button onClick={handleUpscale} disabled={loading}>
              {loading ? 'Processing...' : 'Upscale 2×'}
            </button>
          </div>

          <div className="tool-section">
            <h3>Outpaint (Extend Image)</h3>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setImage(e.target.files[0])} 
            />
            <div className="form-group">
              <label>Extension Prompt:</label>
              <textarea
                placeholder="Describe what to add around the image..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
              />
            </div>
            <button onClick={handleOutpaint} disabled={loading}>
              {loading ? 'Processing...' : 'Outpaint Image'}
            </button>
          </div>
        </div>
      )}

      {generatedImage && (
        <div className="result-section">
          <h2>Generated Result</h2>
          <div className="image-container">
            <img src={generatedImage} alt="Generated result" />
            <div className="image-actions">
              <button onClick={downloadImage} className="btn-primary">
                Download Image
              </button>
              <button onClick={clearAll} className="btn-secondary">
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Processing your image...</p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;