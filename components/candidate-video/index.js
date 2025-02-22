"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@clerk/nextjs";
import { updateVideoCVAction } from "@/actions";
import { toast } from 'react-hot-toast';
import '@/components/ui/summary.css';

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
  const [aiSummary, setAiSummary] = useState("");
  const [editedSummary, setEditedSummary] = useState("");
  const [showTypewriter, setShowTypewriter] = useState(false);


  const videoConstraints = {
    facingMode: "user",
  };

  // Fetch previous video and AI summary on component mount
  useEffect(() => {
    const fetchPreviousData = async () => {
      try {
        const response = await fetch(`/api/profiles/${user.id}`);
        const profile = await response.json();
        setPreviousVideo(profile?.candidateInfo?.videoCV);
        const summary = profile?.candidateInfo?.aiSummary || "";
        setAiSummary(summary); // Set AI summary from profile
        setEditedSummary(summary); // Initialize edited summary
        //console.log('Profile data:', profile?.candidateInfo);
      } catch (error) {
        console.error("Error fetching previous data:", error);
      }
    };

    if (user?.id) {
      fetchPreviousData();
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

  const handlePrintDetails = async () => {
    setShowTypewriter(true);
    try {
      const response = await fetch(`/api/profiles/${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }
      const profileData = await response.json();
      
      // First ensure candidateInfo exists and filter out parsedResponse
      const candidateInfo = profileData.candidateInfo || {};
      const { parsedResponse, totalExperience, profileLinks, resume, videoCV, ...filteredInfo } = candidateInfo;
      

      const cleanData = Object.entries(filteredInfo)
        .reduce((acc, [key, value]) => {
          if (value !== "" && value !== undefined) {
            if (typeof value === 'object') {
              const cleanNested = Object.entries(value)
                .reduce((nestedAcc, [nestedKey, nestedValue]) => {
                  if (nestedValue !== "" && nestedValue !== undefined) {
                    nestedAcc[nestedKey] = nestedValue;
                  }
                  return nestedAcc;
                }, {});
              if (Object.keys(cleanNested).length > 0) {
                acc[key] = cleanNested;
              }
            } else {
              acc[key] = value;
            }
          }
          return acc;
        }, {});

      // Format the data into a readable string
      const formattedText = Object.entries(cleanData)
        .map(([key, value]) => {
          if (typeof value === 'object') {
            return `${key}: ${JSON.stringify(value, null, 2)}`;
          }
          return `${key}: ${value}`;
        })
        .join('\n');

      //console.log('Formatted Text:', formattedText);
      //console.log(profileData)


    
      const summaryResponse = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: formattedText }),
      });

      if (!summaryResponse.ok) {
        throw new Error('Failed to generate summary');
      }

      const { summary } = await summaryResponse.json();
      setAiSummary(JSON.stringify(summary)); // Store the summary in state
      //console.log('Generated Summary:', summary);

      const updateResponse = await fetch(`/api/profiles/ai-summary/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aiSummary: summary  // This is the key change - remove nested candidateInfo
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update AI summary');
      }

      setAiSummary(summary);
      setEditedSummary(summary);
    

      //console.log(profileData)
  
      
      toast.success('Summary generated successfully!');

    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate summary');
    } finally {
      setTimeout(() => {
        setShowTypewriter(false);
      }, 1000); // Hide after 4 seconds
    }
  };

  const handleUpdateSummary = async () => {
    try {
      const updateResponse = await fetch(`/api/profiles/ai-summary/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aiSummary: editedSummary
        }),
      });
  
      if (!updateResponse.ok) {
        throw new Error('Failed to update AI summary');
      }
  
      setAiSummary(editedSummary);
      toast.success('Summary updated successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update summary');
    }
  };

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
    if (!webcamRef.current?.stream) {
      console.error('No webcam stream available');
      toast.error('Camera not ready. Please try again.');
      return;
    }

    setRecordedChunks([]);
    setCapturing(true);
    setPreviewUrl(null);
    
    try {
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: "video/webm",
      });

      mediaRecorderRef.current.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check camera permissions.');
      setCapturing(false);
    }
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
      toast.error("No video recorded to upload.");
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
        //console.log("Old file name:", oldFileName);
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

      //console.log("Upload data:", uploadData);

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
      // console.log("Video CV updated successfully:", updateData);

      // Update the UI to show new video
      setPreviousVideo(publicUrl);

      const videoElement = document.querySelector('video[src*="rekrutor-public"]');
      if (videoElement) {
        videoElement.load();
      }
      toast.success("Video CV updated successfully!");
      setRecordedChunks([]);


    } catch (error) {
      console.error("Error during upload process:", error);
      toast.error(error.message || "Failed to upload video");
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
    <div style={{background: "radial-gradient(circle,rgba(253, 144, 144, 0.64) 10%,rgba(156, 156, 251, 0.64) 40%,rgba(200, 200, 248, 0.84) 60%,rgba(224, 224, 251, 0.23) 80%,rgb(251, 251, 251) 90%,rgb(255, 253, 255) 90%)"}}>
    <div className='text-center bg-transparent' style={{background: "radial-gradient(circle,rgba(253, 144, 144, 0.64) 10%,rgba(156, 156, 251, 0.64) 40%,rgba(200, 200, 248, 0.84) 60%,rgba(224, 224, 251, 0.23) 80%,rgb(251, 251, 251) 90%,rgb(255, 253, 255) 90%)"}}>
    <div className="flex flex-row gap-12 mx-auto min-w-[400px] max-w-7xl px-0 py-8 h-[1000px] lg:w-[1200px]" style={{background: "radial-gradient(circle,rgba(253, 144, 144, 0.64) 10%,rgba(156, 156, 251, 0.64) 40%,rgba(200, 200, 248, 0.84) 60%,rgba(224, 224, 251, 0.23) 80%,rgb(251, 251, 251) 90%,rgb(255, 253, 255) 90%)"}}>
      {/* Main recording section */}
      <div className="flex flex-col space-y-6 min-w-[600px]">
        <div className="flex flex-row ml-0 w-full justify-start ">
          <div className="flex-1 min-w-[200px] max-w-[900px]">

            {isCameraOn ? (
              <>
                {!previewUrl ? (
                  <Webcam
                    audio
                    muted
                    mirrored={true}
                    ref={webcamRef}
                    videoConstraints={videoConstraints}
                    className="w-[500px] h-[500px] object-cover rounded-2xl shadow-lg transform border-[4px] border-gray-900"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full h-[500px] object-cover rounded-2xl shadow-lg border-[3px] border-gray-100"
                  />

                )}
              </>
            ) : (
              <div className="flex items-center justify-center bg-gray-50 w-full h-[500px] rounded-2xl shadow-lg border-4 border-gray-900">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  className="w-20 h-20 text-gray-300"
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
          </div>

          {aiSummary && (
            <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-lg p-6 border-[4px] border-gray-900 ">
              <h3 className="font-semibold text-lg mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg inline-block border-[3px] border-gray-900">
                My Summary
              </h3>
        

              {showTypewriter ? (
      <div className="w-full h-[250px] p-4 border-[3px] border-gray-900 
      rounded-xl text-white font-medium text-sm resize-none focus:ring-2 
      focus:ring-purple-500 focus:border-transparent transition-all
      bg-gradient-to-r from-purple-900 to-indigo-900 flex flex-col justify-center items-center">
      
      <div className="typewriter mt-4">
        <div className="slide">
          <i></i>
        </div>
        <div className="paper"></div>
        <div className="keyboard"></div>
      </div>
      <div className="mt-4 text-center">Robots and Great minds at work</div>
      </div>
    ) : (
      
              <textarea
              placeholder={editedSummary === "" || aiSummary === "" 
                ? "Click on the [Ask AI] button to generate a summary or write one in this box yourself. This is for your convenience to read while recording."
                : ""}
                value={editedSummary === "" || aiSummary === "" 
                  ? ""
                  : editedSummary}


                onChange={(e) => setEditedSummary(e.target.value)}
                className="w-full h-[250px] p-4 border-[3px] border-gray-900 
                rounded-xl text-white font-medium text-sm resize-none focus:ring-2 
                focus:ring-purple-500 focus:border-transparent transition-all
                bg-gradient-to-r from-purple-900 to-gray-900 to-50% text-center"
              />
              )}
              <div className="flex justify-end">
              


              <button
                onClick={handleUpdateSummary}
                disabled={editedSummary === "" || aiSummary === ""}
                className={`mt-4 px-6 py-2.5 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-4xl hover:scale-105 ${
                  editedSummary === "" || aiSummary === ""
                    ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                }`}>
                {editedSummary === "" || aiSummary === ""
                  ? "Summary is empty"
                  : "Update Summary"}
              </button>
              <p className="text-sm text-gray-500 mt-1"></p>

            </div>



            </div>
          )}
        </div>
        {/* {console.log("hello ", editedSummary===""? "true": "false")} */}

        <div className="flex space-x-4 mt-6">
          <button
            onClick={toggleCamera}
            className="hover:shadow-4xl hover:scale-105 px-6 py-2.5 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md"
          >
            {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
          </button>
          {isCameraOn && (
            <>
              {capturing ? (
                <button 
                  onClick={handleStopCaptureClick} 
                  className="hover:shadow-4xl hover:scale-105 px-6 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md flex items-center"
                >
                  <span className="mr-2 h-2 w-2 bg-white rounded-full animate-pulse"></span>
                  Stop Recording
                </button>
              ) : (
                <>
                  {!previewUrl && (
                    <button 
                      onClick={handleStartCaptureClick} 
                      className="hover:shadow-4xl hover:scale-105 px-6 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md"
                    >
                      Start Recording
                    </button>
                  )}
                </>
              )}
              <div className="flex flex-col items-center">
                <button
                  onClick={handlePrintDetails}
                  className="hover:scale-105 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md flex items-center gap-2"
                >

                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
                  </svg>
                  ASK AI
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
                  </svg>
                </button>
                <p className="text-sm text-gray-500 mt-1">Ask AI to summarize you</p>
              </div>

              {previewUrl && (
                <>
                  <button
                    onClick={handleRecordAgain}
                    className="hover:shadow-4xl hover:scale-105 px-6 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md"
                  >
                    Record Again
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className={`hover:shadow-4xl hover:scale-105 px-6 py-2.5 font-medium rounded-lg transition-all duration-200 shadow-md ${
                      uploading 
                        ? "bg-gray-400 cursor-not-allowed" 
                        : "bg-green-500 text-white hover:bg-green-600"
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
      {previousVideo ? (
        <div className="w-[200px] shrink-0">
          <div className="sticky top-24 rounded-2xl overflow-hidden bg-white shadow-lg border border-gray-100">
            <div className="aspect-video w-full bg-gray-900">
              <video 
                src={previousVideo} 
                controls 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900">Previous Video CV</h3>
              <p className="text-sm text-gray-500 mt-2">
                Updated Video will appear on the next login
              </p>
              <p className="text-xs text-gray-400 mt-1">
                
              </p>
            </div>
          </div>
        </div>
      ):(
        <div className="w-[200px] shrink-0">
        <div className="sticky top-24 rounded-2xl overflow-hidden bg-white shadow-lg border border-gray-100">
          <div className="aspect-video w-full bg-gray-900 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="p-6">
            <h3 className="font-semibold text-gray-900">Previous Video CV</h3>
            <p className="text-sm text-gray-500 mt-2">
              You have not uploaded a video yet
            </p>
          </div>
        </div>
      </div>
      )}
    </div>
    </div>
    </div>
  );
}

export default CandidateVideo;
