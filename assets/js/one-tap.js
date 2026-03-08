(function bootstrapOneTap() {
  const ns = window.InfinitiVisitor;

  if (!ns) {
    return;
  }

  const DISMISS_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

  function readStorage(key, fallback) {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      return;
    }
  }

  function isFirefox() {
    return /firefox/i.test(navigator.userAgent || '');
  }

  function loadCachedIdentity() {
    const cached = ns.parseJson(readStorage(ns.storageKeys.googleProfile, ''), null);

    if (cached && cached.googleSubId) {
      ns.setState('identity', cached, ns.events.identityReady);
    }
  }

  function shouldSuppressPrompt() {
    if (!ns.config.oneTapEnabled || !ns.config.googleClientId || isFirefox()) {
      return true;
    }

    const cachedIdentity = ns.getState('identity');

    if (cachedIdentity && cachedIdentity.googleSubId) {
      return true;
    }

    const dismissedAt = Number(readStorage(ns.storageKeys.oneTapDismissed, '0'));

    return Number.isFinite(dismissedAt) && dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_WINDOW_MS;
  }

  function storeDismissal() {
    writeStorage(ns.storageKeys.oneTapDismissed, String(Date.now()));
  }

  function decodeJwt(credential) {
    try {
      const parts = credential.split('.');

      if (parts.length < 2) {
        return null;
      }

      const payload = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(parts[1].length / 4) * 4, '=');
      const json = atob(payload);

      return JSON.parse(json);
    } catch (error) {
      console.error('Failed to decode Google One Tap credential:', error);
      return null;
    }
  }

  function buildIdentityProfile(tokenPayload) {
    const fullName = tokenPayload.name || [tokenPayload.given_name, tokenPayload.family_name].filter(Boolean).join(' ');

    return {
      googleName: fullName || '',
      googleEmail: tokenPayload.email || '',
      googlePhotoUrl: tokenPayload.picture || '',
      googleSubId: tokenPayload.sub || '',
      consentTimestamp: new Date().toISOString()
    };
  }

  function loadGoogleScript() {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        resolve();
        return;
      }

      const existing = document.querySelector('script[data-google-one-tap="true"]');

      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.dataset.googleOneTap = 'true';
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.appendChild(script);
    });
  }

  async function initializeOneTap() {
    if (shouldSuppressPrompt()) {
      return;
    }

    try {
      await loadGoogleScript();
    } catch (error) {
      console.error('Failed to load Google Identity Services:', error);
      return;
    }

    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: ns.config.googleClientId,
      callback(response) {
        const tokenPayload = decodeJwt(response.credential || '');

        if (!tokenPayload) {
          return;
        }

        const identity = buildIdentityProfile(tokenPayload);
        writeStorage(ns.storageKeys.googleProfile, JSON.stringify(identity));
        ns.setState('identity', identity, ns.events.identityReady);
      },
      cancel_on_tap_outside: true,
      auto_select: false
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isDismissedMoment && notification.isDismissedMoment()) {
        storeDismissal();
      }
    });
  }

  loadCachedIdentity();

  window.addEventListener('DOMContentLoaded', () => {
    window.setTimeout(initializeOneTap, ns.config.oneTapDelayMs);
  });
})();
