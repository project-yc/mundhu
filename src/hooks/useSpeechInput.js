import { useCallback, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

/**
 * Voice dictation for a text input, over the browser's built-in Web Speech API.
 *
 * `react-speech-recognition` is a thin wrapper around that API, so there is no
 * key, no cost and no backend route involved — but it also means support is
 * Chromium-only, and Chrome implements recognition by sending the audio to
 * Google's speech servers. Callers should hide the mic entirely when
 * `supported` is false rather than offering a control that can't work.
 *
 * `micBlocked` is separate from `supported`: the browser can support the API
 * while the user has denied the permission prompt, and that deserves a
 * disabled-with-explanation control instead of a vanishing one.
 */
export function useSpeechInput() {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    browserSupportsContinuousListening,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  const start = useCallback(() => {
    // Android's implementation stops after every utterance, so continuous mode
    // is requested only where the browser can actually honour it.
    SpeechRecognition.startListening({
      continuous: browserSupportsContinuousListening,
      language: 'en-US',
    });
  }, [browserSupportsContinuousListening]);

  const stop = useCallback(() => {
    SpeechRecognition.stopListening();
  }, []);

  // Recognition lives on a module-level manager, so it keeps running after the
  // bar unmounts (navigating away) unless it's explicitly stopped.
  useEffect(() => () => SpeechRecognition.stopListening(), []);

  return {
    supported: browserSupportsSpeechRecognition,
    micBlocked: !isMicrophoneAvailable,
    listening,
    transcript,
    start,
    stop,
    resetTranscript,
  };
}
