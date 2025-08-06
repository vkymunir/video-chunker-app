import React, { useState } from 'react';
import VideoUploader from './components/VideoUploader';
import VideoPreview from './components/VideoPreview';
import ChunkList from './components/ChunkList';
import EditingTools from './components/EditingTools';
import './styles/App.css';

function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPath, setVideoPath] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [selectedChunk, setSelectedChunk] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleVideoUpload = async (file) => {
    setVideoFile(file);
    setVideoPath(file.path);
    setChunks([]);
    setIsProcessing(true);
    
    try {
      const result = await window.electronAPI.processVideoChunks(file.path);
      setChunks(result.chunks);
    } catch (error) {
      console.error(error);
      alert('Failed to process video.');
    } finally {
      setIsProcessing(false);
    }
  };

  React.useEffect(() => {
    window.electronAPI.onProcessingProgress((progress) => {
      setProcessingProgress(progress);
    });

    return () => {
      window.electronAPI.removeAllListeners('processing-progress');
    };
  }, []);

  return (
    <div className="App">
      <h1>Video Chunker</h1>
      <VideoUploader onVideoUpload={handleVideoUpload} disabled={isProcessing} />
      
      {isProcessing && <p>Processing video into 5-second chunks... {Math.round(processingProgress)}%</p>}
      
      {videoPath && <VideoPreview videoPath={videoPath} />}
      
      {chunks.length > 0 && (
        <>
          <h2>Chunks ({chunks.length})</h2>
          <ChunkList chunks={chunks} onSelectChunk={setSelectedChunk} />
          
          {selectedChunk && (
            <div>
              <h3>Editing: {selectedChunk.filename}</h3>
              <EditingTools videoPath={selectedChunk.path} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;