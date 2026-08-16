import { useCallback, useRef, useState } from 'react';
import { authFetch } from '../utils/authFetch';

/**
 * Streams an answer from the "Ask about our product" chatbot endpoint.
 *
 * Consumed by hand via fetch() + getReader() rather than EventSource:
 * EventSource can't send custom headers, so it has no way to carry the JWT
 * authFetch injects. authFetch (not axios) is used specifically because it
 * hands back the raw, unconsumed Response the stream is read from — axios
 * buffers/parses the body instead.
 */
export function useChatStream() {
  // idle | loading | streaming | done | error
  const [status, setStatus] = useState('idle');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
    setAnswer('');
    setError(null);
  }, []);

  const ask = useCallback(async (question) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');
    setAnswer('');
    setError(null);

    let response;
    try {
      response = await authFetch('/api/v1/chatbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name === 'AbortError') return;
      setStatus('error');
      setError('Could not reach the assistant.');
      return;
    }

    if (!response.ok) {
      let message = `Request failed (${response.status}).`;
      try {
        const body = await response.json();
        if (body?.error) message = body.error;
      } catch {
        // Non-JSON error body — keep the generic message.
      }
      setStatus('error');
      setError(message);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        // SSE events are separated by a blank line. The last split piece may
        // be a partial event still waiting on more bytes — keep it in the
        // buffer for the next chunk instead of parsing it early.
        const events = buffer.split('\n\n');
        buffer = events.pop();

        for (const raw of events) {
          const line = raw.trim();
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;

          let event;
          try {
            event = JSON.parse(payload);
          } catch {
            continue;
          }

          if (event.token) {
            setStatus('streaming');
            setAnswer((prev) => prev + event.token);
          } else if (event.error) {
            setStatus('error');
            setError(event.error);
            return;
          } else if (event.done) {
            setStatus('done');
          }
        }
      }
      setStatus((current) => (current === 'streaming' ? 'done' : current));
    } catch (err) {
      if (err.name === 'AbortError') return;
      setStatus('error');
      setError('Connection to the assistant was interrupted.');
    }
  }, []);

  return { status, answer, error, ask, reset };
}
