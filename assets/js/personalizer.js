(function bootstrapPersonalizer() {
  const ns = window.InfinitiVisitor;

  if (!ns) {
    return;
  }

  function readStorage(key, fallback) {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function removeStorage(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      return;
    }
  }

  function readSession(key, fallback) {
    try {
      const value = window.sessionStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function writeSession(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error) {
      return;
    }
  }

  function getProfile() {
    return (
      ns.getState('profile') ||
      ns.parseJson(readStorage(ns.storageKeys.fingerprintCache, ''), null)
    );
  }

  function getIdentity() {
    return (
      ns.getState('identity') ||
      ns.parseJson(readStorage(ns.storageKeys.googleProfile, ''), null)
    );
  }

  function toggleExperienceClasses(profile) {
    if (!profile) {
      return;
    }

    const root = document.documentElement;
    const body = document.body;
    const prefersDark = profile.colorScheme === 'dark';
    const isPerfMode =
      profile.saveData === true ||
      (typeof profile.memoryGB === 'number' && profile.memoryGB > 0 && profile.memoryGB <= 4) ||
      (typeof profile.downlinkMbps === 'number' && profile.downlinkMbps > 0 && profile.downlinkMbps < 1.5) ||
      profile.batteryLevel !== null && profile.batteryLevel < 0.2;

    root.classList.toggle('dark', prefersDark);
    root.dataset.theme = prefersDark ? 'dark' : 'light';

    body.classList.toggle('no-motion', profile.reducedMotion === true);
    body.classList.toggle('touch-mode', profile.isTouch === true);
    body.classList.toggle('perf-mode', Boolean(isPerfMode));
  }

  function ensureNavIdentity() {
    const nav = document.querySelector('header nav');

    if (!nav) {
      return null;
    }

    let container = nav.querySelector('[data-nav-identity="true"]');

    if (!container) {
      container = document.createElement('div');
      container.className = 'nav-identity';
      container.dataset.navIdentity = 'true';
      nav.appendChild(container);
    }

    return container;
  }

  function renderNavIdentity() {
    const container = ensureNavIdentity();
    const identity = getIdentity();

    if (!container) {
      return;
    }

    if (!identity || !identity.googleSubId) {
      container.innerHTML = '<span class="nav-identity-placeholder">Anonymous visitor</span>';
      return;
    }

    const avatar = identity.googlePhotoUrl
      ? `<img src="${identity.googlePhotoUrl}" alt="" class="nav-avatar" referrerpolicy="no-referrer">`
      : `<span class="nav-avatar nav-avatar-fallback">${(identity.googleName || 'G').charAt(0).toUpperCase()}</span>`;

    container.innerHTML = `
      ${avatar}
      <div class="nav-identity-copy">
        <span class="nav-identity-label">Signed in with Google</span>
        <span class="nav-identity-name">${identity.googleName || identity.googleEmail}</span>
      </div>
    `;
  }

  function showWelcomeToast() {
    const profile = getProfile();

    if (!profile || profile.isNew || window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
      return;
    }

    if (readSession(ns.storageKeys.welcomeToastSeen, '') === '1') {
      return;
    }

    const identity = getIdentity();
    const toast = document.createElement('div');
    toast.className = 'visitor-toast';
    toast.innerHTML = `
      <strong>Welcome back${identity && identity.googleName ? `, ${identity.googleName.split(' ')[0]}` : ''}.</strong>
      <span>Your preferences are active for this visit.</span>
    `;

    document.body.appendChild(toast);
    writeToastSeen();

    window.setTimeout(() => {
      toast.classList.add('is-visible');
    }, 40);

    window.setTimeout(() => {
      toast.classList.remove('is-visible');
      window.setTimeout(() => toast.remove(), 300);
    }, 4200);
  }

  function writeToastSeen() {
    writeSession(ns.storageKeys.welcomeToastSeen, '1');
  }

  function clearVisitorData() {
    Object.keys(ns.storageKeys).forEach((keyName) => {
      removeStorage(ns.storageKeys[keyName]);
    });

    try {
      window.sessionStorage.removeItem(ns.storageKeys.welcomeToastSeen);
    } catch (error) {
      // Continue clearing local data even when sessionStorage is unavailable.
    }

    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect();
    }

    window.location.reload();
  }

  function renderPrivacyNotice() {
    const footer = document.querySelector('footer');

    if (!footer || footer.querySelector('[data-privacy-notice="true"]')) {
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'privacy-notice';
    wrapper.dataset.privacyNotice = 'true';
    wrapper.innerHTML = `
      <p>
        This site collects anonymous device signals, browser preferences, and interaction data to personalize the experience,
        analyze traffic, and detect automated bots. If you sign in with Google, your name and email are stored after consent.
        Data is held in a private Google Sheet and is never shared with third parties.
      </p>
      <button type="button" class="privacy-clear-button" data-clear-visitor-data="true">Clear my data</button>
    `;

    const footerInner = footer.querySelector('.max-w-5xl');

    if (footerInner) {
      footerInner.appendChild(wrapper);
    } else {
      footer.appendChild(wrapper);
    }

    const button = wrapper.querySelector('[data-clear-visitor-data="true"]');

    if (button) {
      button.addEventListener('click', clearVisitorData);
    }
  }

  function applyAll() {
    toggleExperienceClasses(getProfile());
    renderNavIdentity();
    renderPrivacyNotice();
    showWelcomeToast();
  }

  window.addEventListener('DOMContentLoaded', applyAll);
  document.addEventListener(ns.events.fingerprintReady, applyAll);
  document.addEventListener(ns.events.identityReady, applyAll);
})();
