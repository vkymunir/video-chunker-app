import React from "react";
import { useDropzone } from "react-dropzone";

function VideoUploader({ onVideoUpload, disabled }) {
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith("video/")) {
      onVideoUpload(file);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "video/*": [] },
    disabled,
  });

  return (
    <div {...getRootProps()} className="upload-area">
      <input {...getInputProps()} />
      <p>Drag & drop a video file here, or click to select</p>
    </div>
  );
}

export default VideoUploader;
