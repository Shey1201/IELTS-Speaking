
import React, { useRef, useState, useEffect } from 'react';

interface RecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isProcessing: boolean;
}

const Recorder: React.FC<RecorderProps> = ({ onRecordingComplete, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  // Keep track of stream in ref for cleanup in useEffect with empty deps
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopRecordingCleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startVisualizer = (stream: MediaStream) => {
    if (!canvasRef.current) return;
    
    // Check if context exists and is running, reuse or close? 
    // Usually easier to create new one for new stream, ensuring old is closed.
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
    }

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);
    
    source.connect(analyser);
    analyser.fftSize = 256;
    
    audioContextRef.current = audioCtx;
    analyserRef.current = analyser;
    sourceRef.current = source;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    
    if (!canvasCtx) return;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        canvasCtx.fillStyle = `rgb(${50 + barHeight + 100}, 150, 255)`;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    
    draw();
  };

  const stopRecordingCleanup = () => {
    if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
    }
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(err => console.error("Error closing AudioContext:", err));
      audioContextRef.current = null;
    }
    
    // Use ref for stream cleanup to handle closure issues in useEffect
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Also try to stop from state if available (redundant but safe if ref missed)
    if (audioStream) {
       audioStream.getTracks().forEach(track => track.stop());
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      streamRef.current = stream;
      startVisualizer(stream);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob);
        // cleanup called in stopRecording for immediate UI response, but good to ensure here too
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required to record.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // 1. Immediate UI Feedback: Stop Timer & Visuals
      if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
      }
      setIsRecording(false);
      
      // 2. Stop Hardware
      stopRecordingCleanup();
      mediaRecorderRef.current.stop();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 w-full min-h-[200px]">
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={60} 
        className={`mb-6 w-full max-w-md h-[60px] rounded bg-white shadow-sm ${!isRecording ? 'opacity-30' : ''}`}
      />
      
      <div className="text-4xl font-mono font-medium text-slate-700 mb-6">
        {formatTime(duration)}
      </div>

      <div className="flex items-center gap-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-8 py-3 rounded-full text-white font-medium shadow-md transition-all transform hover:scale-105 ${
              isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
            {isProcessing ? "Processing..." : "Start Recording"}
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-slate-800 text-white font-medium shadow-md hover:bg-slate-900 transition-all transform hover:scale-105"
          >
            <span className="w-3 h-3 bg-red-500 rounded-sm"></span>
            Stop & Grade
          </button>
        )}
      </div>
      
      {isProcessing && (
        <div className="mt-4 text-sm text-blue-600 font-medium flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Analyzing with Gemini AI...
        </div>
      )}
    </div>
  );
};

export default Recorder;
