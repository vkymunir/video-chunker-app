function VideoPreview({ videoPath }) {
  return (
    <div>
      <h3>Video Preview</h3>
      <video controls width="100%" src={videoPath} />
    </div>
  );
}

export default VideoPreview;
