import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseVoiceChatOptions {
  onTranscript: (text: string) => void;
}

export const useVoiceChat = ({ onTranscript }: UseVoiceChatOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const stopAndProcess = useCallback(async () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    
    setIsProcessing(true);
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      chunksRef.current = [];
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // If chunks is empty, recording was cancelled
        if (chunksRef.current.length === 0) {
          setIsProcessing(false);
          return;
        }
        
        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-stt`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error('Ошибка распознавания речи');
          }

          const data = await response.json();
          
          if (data.text) {
            onTranscript(data.text);
          } else {
            toast.error('Не удалось распознать речь');
          }
        } catch (error) {
          console.error('STT error:', error);
          toast.error('Ошибка распознавания речи');
        } finally {
          setIsProcessing(false);
          // Stop all tracks
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone error:', error);
      toast.error('Не удалось получить доступ к микрофону');
    }
  }, [onTranscript]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopAndProcess();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopAndProcess]);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording: stopAndProcess,
    cancelRecording,
    toggleRecording,
  };
};

export const playTTS = async (text: string): Promise<void> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!response.ok) {
      throw new Error('TTS request failed');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = reject;
      audio.play();
    });
  } catch (error) {
    console.error('TTS error:', error);
    toast.error('Ошибка озвучки');
  }
};
