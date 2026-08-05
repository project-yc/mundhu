import { useEffect, useRef } from 'react';
import { initGoogleButton, isGoogleConfigured, exchangeGoogleCredential } from '../../lib/googleAuth';

// Renders `children` (your own custom-styled button) and overlays Google's
// real button on top, invisible (opacity-0) but still clickable — Google
// requires interaction with its real button/FedCM prompt to issue a
// credential, so a fully custom button can't trigger the flow directly.
// The overlay sits in front (position: absolute) so clicks land on it while
// your design underneath is what's actually visible. Use `group-hover:` in
// children to get hover feedback, since the overlay intercepts the pointer.
export default function GoogleAuthButton({ onSuccess, onError, className = '', children }) {
  const wrapperRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!wrapperRef.current || !overlayRef.current) return undefined;

    if (!isGoogleConfigured()) {
      onError?.('Google sign-in is not configured for this environment.');
      return undefined;
    }

    let cancelled = false;
    const width = wrapperRef.current.offsetWidth || 360;

    initGoogleButton(overlayRef.current, {
      width,
      onCredential: async (idToken) => {
        try {
          const data = await exchangeGoogleCredential(idToken);
          if (!cancelled) onSuccess?.(data);
        } catch (err) {
          if (!cancelled) onError?.(err.message || 'Google sign-in failed.');
        }
      },
    }).catch((err) => {
      if (!cancelled) onError?.(err.message || 'Failed to load Google sign-in.');
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapperRef} className={`relative group ${className}`}>
      {children}
      <div ref={overlayRef} className="absolute inset-0 overflow-hidden opacity-0" aria-hidden="true" />
    </div>
  );
}
