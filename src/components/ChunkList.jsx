function ChunkList({ chunks, onSelectChunk }) {
  return (
    <div>
      {chunks.map((chunk, index) => (
        <div key={chunk.filename}>
          <p>{chunk.filename} ({chunk.duration}s)</p>
          <button onClick={() => onSelectChunk(chunk)}>Select</button>
        </div>
      ))}
    </div>
  );
}

export default ChunkList;