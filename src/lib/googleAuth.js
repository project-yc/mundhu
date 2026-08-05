const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let scriptPromise = null;

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Failed to load Google Sign-In script.'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function isGoogleConfigured() {
  return Boolean(GOOGLE_CLIENT_ID);
}

// Renders Google's own "Sign in with Google" button into `container` — a
// custom-styled button can't trigger the credential flow directly (Google
// requires the real button/FedCM prompt), so we style Google's button
// (filled_black, pill) to match the rest of the form instead.
export async function initGoogleButton(container, { onCredential, text = 'signin_with', width = 360 }) {
  const google = await loadGoogleScript();
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response) => onCredential(response.credential),
    use_fedcm_for_prompt: true,
  });
  container.innerHTML = '';
  google.accounts.id.renderButton(container, {
    type: 'standard',
    theme: 'filled_black',
    size: 'large',
    shape: 'pill',
    text,
    logo_alignment: 'left',
    width: String(Math.min(Math.max(Math.round(width), 200), 400)),
  });
}

export async function exchangeGoogleCredential(idToken) {
  const res  = await fetch('/api/auth/v1/recruiter/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_token: idToken }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.message || data.error || `Error ${res.status}`);
  return data;
}
