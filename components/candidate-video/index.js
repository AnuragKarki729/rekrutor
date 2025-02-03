"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
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
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [previousVideo, setPreviousVideo] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const timerRef = useRef(null);

  const videoConstraints = {
    facingMode: "user",
  };

  // Fetch previous video on component mount
  useEffect(() => {
    const fetchPreviousVideo = async () => {
      try {
        const response = await fetch(`/api/profile/${user.id}`);
        const profile = await response.json();
        setPreviousVideo(profile?.candidateInfo?.videoCV);
        console.log('Profile data:', profile?.candidateInfo);
      } catch (error) {
        console.error("Error fetching previous video:", error);
      }
    };

    if (user?.id) {
      fetchPreviousVideo();
    }
  }, [user?.id]);

  // Add timer effect
  useEffect(() => {
    if (capturing) {
      timerRef.current = setInterval(() => {
        setRecordingTime((time) => {
          if (time >= 30) {
            handleStopCaptureClick();
            return 30;
          }
          return time + 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }

    return () => {
      clearInterval(timerRef.current);
    };
  }, [capturing]);

  // Modify handleStopCaptureClick to properly handle the recorded chunks
  const handleStopCaptureClick = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setCapturing(false);
      clearInterval(timerRef.current);
    }
  }, []);

  // Add dataavailable event handler outside of handleStartCaptureClick
  useEffect(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.addEventListener("dataavailable", handleDataAvailable);
    }
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.removeEventListener("dataavailable", handleDataAvailable);
      }
    };
  }, [mediaRecorderRef.current]);

  const handleDataAvailable = useCallback(({ data }) => {
    if (data.size > 0) {
      setRecordedChunks((prev) => {
        const newChunks = [...prev, data];
        // Create preview URL when recording is complete
        const blob = new Blob(newChunks, { type: "video/webm" });
        setPreviewUrl(URL.createObjectURL(blob));
        return newChunks;
      });
    }
  }, []);

  // Modify handleStartCaptureClick to clear previous recording
  const handleStartCaptureClick = useCallback(() => {
    setRecordedChunks([]);
    setCapturing(true);
    setPreviewUrl(null);
    
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm",
    });

    mediaRecorderRef.current.start();
  }, []);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Upload video to Supabase
  const handleUpload = async () => {
    if (recordedChunks.length === 0) {
      alert("No video recorded to upload.");
      return;
    }

    // Add confirmation dialog if there's a previous video
    if (previousVideo) {
      const confirmed = window.confirm(
        "Uploading a new Video CV will replace your existing one. Do you want to continue?"
      );
      if (!confirmed) return;
    }

    setUploading(true);

    try {
      // Delete previous video if exists
      if (previousVideo) {
        const oldFileName = previousVideo.split('/').pop();
        console.log("Old file name:", oldFileName);
        await supabaseClient.storage
          .from("rekrutor-public")
          .remove([`videos/${oldFileName}`]);
      }

      // Upload new video
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const fileName = `${user.id}.webm`;

      const { data: uploadData, error } = await supabaseClient.storage
        .from("rekrutor-public")
        .upload(`videos/${fileName}`, blob, {
          cacheControl: "3600",
          upsert: false,
        });

        console.log("Upload data:", uploadData);

      if (error) throw error;

      const publicUrl = supabaseClient.storage
        .from("rekrutor-public")
        .getPublicUrl(`videos/${fileName}`).data.publicUrl;

      // Update profile with new video URL
      const response = await fetch('/api/video-cv/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          videoUrl: publicUrl,
          pathToRevalidate: '/videocv'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update video CV');
      }

      const updateData = await response.json();
      console.log("Video CV updated successfully:", updateData);

      // Update the UI to show new video
      setPreviousVideo(publicUrl);

      const videoElement = document.querySelector('video[src*="rekrutor-public"]');
      if (videoElement) {
        videoElement.load();
      }
      alert("Video CV updated successfully!");
      setRecordedChunks([]);

    } catch (error) {
      console.error("Error during upload process:", error);
      alert(error.message || "Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  const toggleCamera = useCallback(() => {
    if (isCameraOn && webcamRef.current?.stream) {
      // Stop all tracks when turning camera off
      webcamRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOn(!isCameraOn);
  }, [isCameraOn]);

  const handleRecordAgain = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className="flex flex-row gap-8 mx-8 max-w-7xl">
      {/* Main recording section */}
      <div className="flex-1 flex flex-col items-center space-y-4">
        {isCameraOn ? (
          <>
            {!previewUrl ? (
              <Webcam
                audio
                muted
                mirrored = {true}
                ref={webcamRef}
                videoConstraints={videoConstraints}
                className="rounded-lg w-full transform scale-x-[-1]"
                style={{
                  marginTop: "100px",
                  width: "500px",
                  height: "500px",
                  border: "2px solid #ccc",
                  borderRadius: "12px",
                  objectFit: "cover",
                 }}
              />
            ) : (
              <video
                src={previewUrl}
                controls
                
                style={{
                  marginTop: "100px",
                  width: "500px",
                  height: "500px",
                  border: "2px solid #ccc",
                  borderRadius: "12px",
                  objectFit: "cover",
                  }}
              />
            )}
            {capturing && (
              <div className="absolute top-28 right-[calc(50%-230px)] bg-red-500 text-white px-3 py-1 rounded-full">
                Recording: {recordingTime}s / 30s
              </div>
            )}
          </>
        ) : (
          <div 
            className="flex items-center justify-center bg-gray-100"
            style={{
              marginTop: "100px",
              width: "500px",
              height: "500px",
              border: "2px solid #ccc",
              borderRadius: "12px",
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none"
              className="w-24 h-24 text-gray-400"
            >
              <path 
                d="M21 9C21 7.89543 20.1046 7 19 7H16.5C15.9477 7 15.5 6.55228 15.5 6C15.5 5.44772 15.0523 5 14.5 5H10M21 13V16M3 3L21 21M11.6598 15.9809C10.2795 15.8251 9.18287 14.7327 9.02069 13.3543M3 9V17C3 18.1046 3.89543 19 5 19M14 19H9" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={toggleCamera}
            className="px-6 py-2 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600"
          >
            {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
          </button>
          {isCameraOn && (
            <>
              {capturing ? (
                <button onClick={handleStopCaptureClick} className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg">
                  Stop Recording
                </button>
              ) : (
                <>
                  {!previewUrl && (
                    <button onClick={handleStartCaptureClick} className="px-6 py-2 bg-blue-500 text-white font-bold rounded-lg">
                      Start Recording
                    </button>
                  )}
                </>
              )}
              {previewUrl && (
                <>
                  <button
                    onClick={handleRecordAgain}
                    className="px-6 py-2 bg-blue-500 text-white font-bold rounded-lg"
                  >
                    Record Again
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className={`px-6 py-2 font-bold rounded-lg ${
                      uploading ? "bg-gray-400" : "bg-green-500 text-white"
                    }`}
                  >
                    {uploading ? "Uploading..." : "Upload Video"}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Previous video section */}
      {previousVideo && (
        <div className="w-80 shrink-0 flex flex-col justify-center">

          <div className="sticky top-24 rounded-lg overflow-hidden bg-white shadow-md">
            <div className="aspect-video w-full bg-black">
              <video 
                
                src={previousVideo} 
                
                controls 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900">Previous Video CV</h3>
              <p className="text-sm text-gray-500 mt-1">
                Your currently active Video CV {previousVideo.split('/').pop()}
                </p>
                <p>
                {user.id} Date: {Date.now()}
             
                </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidateVideo;
