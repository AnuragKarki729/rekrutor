"use client";

import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@clerk/nextjs";
import { updateVideoCVAction } from "@/actions";

const supabaseClient = createClient( 
    "https://hwbttezjdwqixmaftiyl.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3YnR0ZXpqZHdxaXhtYWZ0aXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0Mjc1MjksImV4cCI6MjA0ODAwMzUyOX0.giYTTB68BJchfDZdqnsMDpt7rhgVPOvPwYp90-Heo4c"

);

function CandidateVideo() {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [capturing, setCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useUser();

  const videoConstraints = {
    facingMode: "user",
  };

  // Start recording
  const handleStartCaptureClick = useCallback(() => {
    setRecordedChunks([]);
    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm",
    });

    mediaRecorderRef.current.addEventListener("dataavailable", ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => [...prev, data]);
      }
    });

    mediaRecorderRef.current.start();
  }, []);

  // Stop recording
  const handleStopCaptureClick = useCallback(() => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
  }, []);

  // Upload video to Supabase
  const handleUpload = async () => {
    if (recordedChunks.length === 0) {
      alert("No video recorded to upload.");
      return;
    }

    setUploading(true);

    // Combine recorded chunks into a single Blob
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const fileName = `${user.id}-${Date.now()}.webm`;

    // Upload to Supabase
    const { data, error } = await supabaseClient.storage
      .from("rekrutor-public")
      .upload(`videos/${fileName}`, blob, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading video:", error);
      alert("Video upload failed.");
      setUploading(false);
      return;
    }

    const publicUrl = supabaseClient.storage
      .from("rekrutor-public")
      .getPublicUrl(`videos/${fileName}`).data.publicUrl;

    // Log and update videoCV
    console.log("Video uploaded successfully. URL:", publicUrl);
    await updateVideoCVAction(user.id, publicUrl, "/videocv");

    alert("Video uploaded successfully!");
    setUploading(false);
  };

  return (
    <div className="mx-8 max-w-5xl">
      <div className="flex flex-col items-center space-y-4">
        <Webcam
          audio
          muted
          ref={webcamRef}
          videoConstraints={videoConstraints}
          className="rounded-lg w-full transform scale-x-[-1]" // Mirroring
          style={{
            marginTop: "100px",
            width:"500px",
            height: "500px",
             border: "2px solid #ccc",
             borderRadius: "12px", // Rounded corners for a smooth look
            objectFit: "cover",
          }}
        />
        <div className="flex space-x-4">
          {capturing ? (
            <button
              onClick={handleStopCaptureClick}
              className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg"
            >
              Stop Recording
            </button>
          ) : (
            <button
              onClick={handleStartCaptureClick}
              className="px-6 py-2 bg-blue-500 text-white font-bold rounded-lg"
            >
              Start Recording
            </button>
          )}
          {recordedChunks.length > 0 && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className={`px-6 py-2 font-bold rounded-lg ${
                uploading ? "bg-gray-400" : "bg-green-500 text-white"
              }`}
            >
              {uploading ? "Uploading..." : "Upload Video"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CandidateVideo;
