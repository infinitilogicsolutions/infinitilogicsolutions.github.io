(function bootstrapFingerprinting() {
  const ns = window.InfinitiVisitor;

  if (!ns) {
    return;
  }

  const HEADLESS_CANVAS_HASHES = new Set(['e3b0c44298fc', '000000000000']);
  const HEADLESS_AUDIO_HASHES = new Set(['e3b0c44298fc', '000000000000']);

  const session = {
    startedAt: Date.now(),
    maxScrollRatio: 0,
    copyEventFired: false,
    mouseVsKeyboard: '',
    firstClickMs: null,
    mouseVectors: []
  };

  let staticSignalPromise;

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

  function toNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function round(value, decimals) {
    if (!Number.isFinite(value)) {
      return null;
    }

    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  function djb2Hash(input) {
    let hash = 5381;

    for (let index = 0; index < input.length; index += 1) {
      hash = (hash * 33) ^ input.charCodeAt(index);
    }

    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  function safeMatchMedia(query) {
    try {
      return typeof window.matchMedia === 'function' ? window.matchMedia(query) : null;
    } catch (error) {
      return null;
    }
  }

  function getColorScheme() {
    const dark = safeMatchMedia('(prefers-color-scheme: dark)');
    const light = safeMatchMedia('(prefers-color-scheme: light)');

    if (!dark || !light) {
      return null;
    }

    if (dark.matches) {
      return 'dark';
    }

    if (light.matches) {
      return 'light';
    }

    return null;
  }

  function getReducedMotion() {
    const media = safeMatchMedia('(prefers-reduced-motion: reduce)');
    return media ? media.matches : null;
  }

  function getContrastPreference() {
    const more = safeMatchMedia('(prefers-contrast: more)');
    const less = safeMatchMedia('(prefers-contrast: less)');
    const custom = safeMatchMedia('(prefers-contrast: custom)');

    if (!more || !less) {
      return null;
    }

    if (more.matches) {
      return 'high';
    }

    if (less.matches) {
      return 'low';
    }

    if (custom && custom.matches) {
      return 'custom';
    }

    return 'no-preference';
  }

  function getHdrSupport() {
    const media = safeMatchMedia('(dynamic-range: high)');
    return media ? media.matches : null;
  }

  function getConnection() {
    return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  }

  function getTimeZone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
    } catch (error) {
      return null;
    }
  }

  function parseUserAgent() {
    const userAgent = navigator.userAgent || '';
    const lower = userAgent.toLowerCase();
    let browser = 'Unknown';
    let browserVersion = '';

    if (/edg\//i.test(userAgent)) {
      browser = 'Edge';
      browserVersion = (userAgent.match(/Edg\/([\d.]+)/i) || [])[1] || '';
    } else if (/opr\//i.test(userAgent)) {
      browser = 'Opera';
      browserVersion = (userAgent.match(/OPR\/([\d.]+)/i) || [])[1] || '';
    } else if (/chrome\//i.test(userAgent) && !/edg\//i.test(userAgent)) {
      browser = 'Chrome';
      browserVersion = (userAgent.match(/Chrome\/([\d.]+)/i) || [])[1] || '';
    } else if (/firefox\//i.test(userAgent)) {
      browser = 'Firefox';
      browserVersion = (userAgent.match(/Firefox\/([\d.]+)/i) || [])[1] || '';
    } else if (/version\/([\d.]+).*safari/i.test(userAgent)) {
      browser = 'Safari';
      browserVersion = (userAgent.match(/Version\/([\d.]+)/i) || [])[1] || '';
    }

    let os = 'Unknown';

    if (/windows nt/i.test(userAgent)) {
      os = 'Windows';
    } else if (/android/i.test(userAgent)) {
      os = 'Android';
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
      os = 'iOS';
    } else if (/mac os x/i.test(userAgent)) {
      os = 'macOS';
    } else if (/linux/i.test(userAgent)) {
      os = 'Linux';
    }

    let deviceType = 'desktop';

    if (/ipad|tablet/i.test(lower) || (/android/i.test(lower) && !/mobile/i.test(lower))) {
      deviceType = 'tablet';
    } else if (/mobile|iphone|ipod|android/i.test(lower)) {
      deviceType = 'mobile';
    } else if ((navigator.maxTouchPoints || 0) > 1 && Math.min(window.screen.width, window.screen.height) < 1024) {
      deviceType = 'tablet';
    }

    return {
      browser,
      browserVersion,
      os,
      deviceType,
      userAgent
    };
  }

  function getCanvasHash() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 60;
      const context = canvas.getContext('2d');

      if (!context) {
        return null;
      }

      context.textBaseline = 'top';
      context.font = "16px 'JetBrains Mono', monospace";
      context.fillStyle = '#1d4ed8';
      context.fillRect(12, 8, 160, 24);
      context.fillStyle = '#ffffff';
      context.fillText('InfinitiLogicSolutions', 16, 12);
      context.strokeStyle = '#14b8a6';
      context.arc(196, 22, 14, 0, Math.PI * 2);
      context.stroke();

      return djb2Hash(canvas.toDataURL()).slice(0, 12);
    } catch (error) {
      return null;
    }
  }

  function getWebGlInfo() {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl') ||
        canvas.getContext('webgl2');

      if (!gl) {
        return {
          webglVendor: null,
          webglRenderer: null
        };
      }

      const debugExtension = gl.getExtension('WEBGL_debug_renderer_info');
      const vendor = debugExtension
        ? gl.getParameter(debugExtension.UNMASKED_VENDOR_WEBGL)
        : gl.getParameter(gl.VENDOR);
      const renderer = debugExtension
        ? gl.getParameter(debugExtension.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER);

      return {
        webglVendor: vendor || null,
        webglRenderer: renderer || null
      };
    } catch (error) {
      return {
        webglVendor: null,
        webglRenderer: null
      };
    }
  }

  async function getAudioInfo() {
    const OfflineAudioContextClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;

    if (!OfflineAudioContextClass) {
      return {
        audioSampleRate: null,
        audioChannels: null,
        audioHash: null
      };
    }

    let context;

    try {
      context = new OfflineAudioContextClass(1, 44100, 44100);
      const oscillator = context.createOscillator();
      const compressor = context.createDynamicsCompressor();

      oscillator.type = 'triangle';
      oscillator.frequency.value = 997;

      compressor.threshold.value = -50;
      compressor.knee.value = 40;
      compressor.ratio.value = 12;
      compressor.attack.value = 0;
      compressor.release.value = 0.2;

      oscillator.connect(compressor);
      compressor.connect(context.destination);
      oscillator.start(0);

      const renderedBuffer = await context.startRendering();
      const channelData = renderedBuffer.getChannelData(0).slice(2500, 5000);
      const sample = Array.from(channelData)
        .map((value) => value.toFixed(5))
        .join(',');

      return {
        audioSampleRate: renderedBuffer.sampleRate || 44100,
        audioChannels: renderedBuffer.numberOfChannels || 1,
        audioHash: djb2Hash(sample).slice(0, 12)
      };
    } catch (error) {
      return {
        audioSampleRate: null,
        audioChannels: null,
        audioHash: null
      };
    }
  }

  async function getBatteryInfo() {
    if (typeof navigator.getBattery !== 'function') {
      return {
        batteryLevel: null,
        batteryCharging: null
      };
    }

    try {
      const battery = await navigator.getBattery();

      return {
        batteryLevel: round(battery.level, 2),
        batteryCharging: Boolean(battery.charging)
      };
    } catch (error) {
      return {
        batteryLevel: null,
        batteryCharging: null
      };
    }
  }

  function getPerformanceMetrics() {
    try {
      const navigationEntry = performance.getEntriesByType('navigation')[0];

      if (navigationEntry) {
        return {
          pageLoadMs: Math.round(navigationEntry.loadEventEnd || navigationEntry.duration || 0),
          ttfbMs: Math.round(navigationEntry.responseStart || 0)
        };
      }

      if (performance.timing) {
        const timing = performance.timing;

        return {
          pageLoadMs: timing.loadEventEnd && timing.navigationStart ? timing.loadEventEnd - timing.navigationStart : null,
          ttfbMs: timing.responseStart && timing.navigationStart ? timing.responseStart - timing.navigationStart : null
        };
      }

      return {
        pageLoadMs: null,
        ttfbMs: null
      };
    } catch (error) {
      return {
        pageLoadMs: null,
        ttfbMs: null
      };
    }
  }

  function computeScrollDepthPct() {
    const documentElement = document.documentElement;
    const body = document.body;
    const scrollHeight = Math.max(
      documentElement ? documentElement.scrollHeight : 0,
      body ? body.scrollHeight : 0
    );
    const viewportHeight = window.innerHeight || (documentElement ? documentElement.clientHeight : 0) || 0;
    const denominator = Math.max(scrollHeight - viewportHeight, 0);

    if (denominator === 0) {
      return 100;
    }

    const scrolled = Math.max(window.scrollY || window.pageYOffset || 0, 0);
    const ratio = clamp(scrolled / denominator, 0, 1);
    session.maxScrollRatio = Math.max(session.maxScrollRatio, ratio);

    return Math.round(session.maxScrollRatio * 100);
  }

  function computeMouseEntropyScore() {
    if (session.mouseVectors.length < 3) {
      return 0;
    }

    const magnitudes = session.mouseVectors.map((vector) => vector.magnitude);
    const average =
      magnitudes.reduce((sum, value) => sum + value, 0) / Math.max(magnitudes.length, 1);
    const variance =
      magnitudes.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) /
      Math.max(magnitudes.length, 1);
    const normalized = clamp(Math.sqrt(variance) / 30, 0, 1);

    return round(normalized, 2) || 0;
  }

  function computeTimeOnPageSec() {
    return Math.max(1, Math.round((Date.now() - session.startedAt) / 1000));
  }

  function getStableVisitorSeed(baseSignals) {
    const seedParts = [
      baseSignals.screenWidth,
      baseSignals.screenHeight,
      baseSignals.viewportWidth,
      baseSignals.viewportHeight,
      baseSignals.devicePixelRatio,
      baseSignals.colorDepth,
      baseSignals.timezone,
      baseSignals.language,
      baseSignals.languages,
      baseSignals.browser,
      baseSignals.browserVersion,
      baseSignals.os,
      baseSignals.deviceType,
      baseSignals.cpuCores,
      baseSignals.memoryGB,
      baseSignals.maxTouchPoints,
      baseSignals.pluginCount,
      baseSignals.webglVendor,
      baseSignals.webglRenderer,
      baseSignals.canvasHash,
      baseSignals.audioSampleRate,
      baseSignals.audioHash
    ];

    return seedParts.map((value) => String(value || '')).join('|');
  }

  function deriveVisitorState(baseSignals) {
    const existingVisitorId = readStorage(ns.storageKeys.visitorId, '');
    const visitorId = existingVisitorId || djb2Hash(getStableVisitorSeed(baseSignals)).slice(0, 12);
    const isNew = !existingVisitorId;
    const priorVisitCount = toNumber(readStorage(ns.storageKeys.visitCount, '0'), 0);
    const visitCount = priorVisitCount + 1;

    writeStorage(ns.storageKeys.visitorId, visitorId);
    writeStorage(ns.storageKeys.visitCount, String(visitCount));

    return {
      visitorId,
      isNew,
      visitCount
    };
  }

  function getBotSignals(payload) {
    const ua = payload.browser;
    const renderer = String(payload.webglRenderer || '').toLowerCase();
    const vendor = String(payload.webglVendor || '').toLowerCase();
    const triggered = [];
    let score = 0;

    function hit(condition, points, key) {
      if (!condition) {
        return;
      }

      score += points;
      triggered.push(key);
    }

    hit(payload.webdriverFlag === true, 40, 'webdriver');
    hit(payload.phantomFlag === true, 35, 'phantom');
    hit(payload.nightmareFlag === true, 35, 'nightmare');
    hit(payload.seleniumFlag === true, 35, 'selenium');
    hit(renderer.includes('swiftshader') || renderer.includes('llvmpipe'), 25, 'webglRenderer');
    hit(vendor.includes('brian paul') || vendor.includes('mesa'), 20, 'webglVendor');
    hit(HEADLESS_CANVAS_HASHES.has(String(payload.canvasHash || '')), 25, 'canvasHash');
    hit(HEADLESS_AUDIO_HASHES.has(String(payload.audioHash || '')), 20, 'audioHash');
    hit(payload.colorScheme === null, 10, 'colorScheme');
    hit(payload.connectionType === null && ua === 'Chrome', 10, 'connectionType');
    hit(payload.cpuCores === null || payload.cpuCores === 0, 10, 'cpuCores');
    hit(payload.memoryGB === null && ua === 'Chrome', 10, 'memoryGB');
    hit(payload.pluginCount === 0 && ua === 'Chrome', 15, 'pluginCount');
    hit(payload.chromeRuntimeOk === false && ua === 'Chrome', 20, 'chromeRuntimeOk');
    hit(payload.outerWidthOk === false, 15, 'outerWidthOk');
    hit(payload.timeOnPageSec < 2, 20, 'timeOnPageSec');
    hit(payload.scrollDepthPct === 0 && payload.timeOnPageSec > 5, 15, 'scrollDepthPct');
    hit(payload.mouseEntropyScore === 0, 15, 'mouseEntropy');
    hit(payload.firstClickMs === null || payload.firstClickMs < 100, 15, 'firstClickMs');
    hit(
      payload.deviceType === 'mobile' && payload.isTouch === false,
      10,
      'isTouchMismatch'
    );

    const cappedScore = Math.min(score, 100);
    let label = 'Human';

    if (cappedScore > 80) {
      label = 'Bot';
    } else if (cappedScore > 60) {
      label = 'Likely Bot';
    } else if (cappedScore > 40) {
      label = 'Suspicious';
    } else if (cappedScore > 20) {
      label = 'Likely Human';
    }

    return {
      botScore: cappedScore,
      botLabel: label,
      botSignals: triggered.join(',')
    };
  }

  function getCurrentBehaviorSignals() {
    const timeOnPageSec = computeTimeOnPageSec();
    const scrollDepthPct = computeScrollDepthPct();

    return {
      timeOnPageSec,
      scrollDepthPct,
      copyEventFired: session.copyEventFired,
      mouseVsKeyboard: session.mouseVsKeyboard || '',
      firstClickMs: session.firstClickMs,
      mouseEntropyScore: computeMouseEntropyScore()
    };
  }

  async function collectStaticSignals() {
    const browserInfo = parseUserAgent();
    const connection = getConnection();
    const webglInfo = getWebGlInfo();
    const [audioInfo, batteryInfo] = await Promise.all([getAudioInfo(), getBatteryInfo()]);

    const baseSignals = {
      timestamp: new Date().toISOString(),
      page: window.location.pathname || '/',
      referrer: document.referrer || '',
      screenWidth: window.screen.width || null,
      screenHeight: window.screen.height || null,
      viewportWidth: window.innerWidth || null,
      viewportHeight: window.innerHeight || null,
      devicePixelRatio: window.devicePixelRatio || 1,
      availScreenWidth: window.screen.availWidth || null,
      availScreenHeight: window.screen.availHeight || null,
      colorDepth: window.screen.colorDepth || null,
      hdrSupport: getHdrSupport(),
      colorScheme: getColorScheme(),
      reducedMotion: getReducedMotion(),
      contrastPref: getContrastPreference(),
      doNotTrack: navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack || '',
      cookieEnabled: typeof navigator.cookieEnabled === 'boolean' ? navigator.cookieEnabled : null,
      cpuCores: navigator.hardwareConcurrency || null,
      memoryGB: navigator.deviceMemory || null,
      jsHeapSizeLimit:
        window.performance &&
        performance.memory &&
        Number.isFinite(performance.memory.jsHeapSizeLimit)
          ? performance.memory.jsHeapSizeLimit
          : null,
      isTouch: (navigator.maxTouchPoints || 0) > 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      batteryLevel: batteryInfo.batteryLevel,
      batteryCharging: batteryInfo.batteryCharging,
      connectionType: connection && connection.effectiveType ? connection.effectiveType : null,
      downlinkMbps:
        connection && typeof connection.downlink === 'number' ? round(connection.downlink, 2) : null,
      rttMs: connection && typeof connection.rtt === 'number' ? connection.rtt : null,
      saveData: connection && typeof connection.saveData === 'boolean' ? connection.saveData : null,
      isOnline: typeof navigator.onLine === 'boolean' ? navigator.onLine : null,
      timezone: getTimeZone(),
      language: navigator.language || null,
      languages: Array.isArray(navigator.languages) ? navigator.languages.join(',') : '',
      browser: browserInfo.browser,
      browserVersion: browserInfo.browserVersion,
      os: browserInfo.os,
      deviceType: browserInfo.deviceType,
      pdfViewerEnabled:
        typeof navigator.pdfViewerEnabled === 'boolean' ? navigator.pdfViewerEnabled : null,
      pluginCount: navigator.plugins ? navigator.plugins.length : null,
      webglVendor: webglInfo.webglVendor,
      webglRenderer: webglInfo.webglRenderer,
      canvasHash: getCanvasHash(),
      audioSampleRate: audioInfo.audioSampleRate,
      audioChannels: audioInfo.audioChannels,
      audioHash: audioInfo.audioHash,
      webdriverFlag: navigator.webdriver === true,
      phantomFlag: Boolean(window.phantom || window._phantom),
      nightmareFlag: Boolean(window.__nightmare),
      seleniumFlag: Boolean(
        document.__selenium_unwrapped ||
          window.__selenium_unwrapped ||
          window.selenium ||
          document.$cdc_asdjflasutopfhvcZLmcfl_
      ),
      chromeRuntimeOk:
        browserInfo.browser === 'Chrome'
          ? Boolean(window.chrome && window.chrome.runtime)
          : true,
      outerWidthOk: window.outerWidth > 0 && window.outerHeight > 0
    };

    const visitorState = deriveVisitorState(baseSignals);
    const performanceMetrics = getPerformanceMetrics();
    const profile = Object.assign({}, baseSignals, visitorState, performanceMetrics);

    writeStorage(ns.storageKeys.fingerprintCache, JSON.stringify(profile));
    ns.setState('profile', profile, ns.events.fingerprintReady);

    return profile;
  }

  function primeBehaviorTracking() {
    document.addEventListener(
      'copy',
      function onCopy() {
        session.copyEventFired = true;
      },
      { passive: true }
    );

    document.addEventListener(
      'keydown',
      function onKeydown(event) {
        if (!session.mouseVsKeyboard && (event.key === 'Tab' || event.key === 'Enter' || event.key === ' ')) {
          session.mouseVsKeyboard = 'keyboard';
        }
      },
      { passive: true }
    );

    document.addEventListener(
      'click',
      function onClick() {
        if (session.firstClickMs === null) {
          session.firstClickMs = Math.round(performance.now());
        }

        if (!session.mouseVsKeyboard) {
          session.mouseVsKeyboard = 'mouse';
        }
      },
      { passive: true }
    );

    window.addEventListener(
      'mousemove',
      function onMouseMove(event) {
        if (!session.mouseVsKeyboard) {
          session.mouseVsKeyboard = 'mouse';
        }

        const previous = session.mouseVectors[session.mouseVectors.length - 1];

        if (previous) {
          const deltaX = event.clientX - previous.x;
          const deltaY = event.clientY - previous.y;
          const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          if (magnitude > 0) {
            session.mouseVectors.push({
              x: event.clientX,
              y: event.clientY,
              magnitude
            });

            if (session.mouseVectors.length > 40) {
              session.mouseVectors.shift();
            }
          }
        } else {
          session.mouseVectors.push({
            x: event.clientX,
            y: event.clientY,
            magnitude: 0
          });
        }
      },
      { passive: true }
    );

    window.addEventListener(
      'scroll',
      function onScroll() {
        computeScrollDepthPct();
      },
      { passive: true }
    );
  }

  ns.getTrackingPayload = async function getTrackingPayload() {
    const baseSignals = await staticSignalPromise;
    const behaviorSignals = getCurrentBehaviorSignals();
    const payload = Object.assign({}, baseSignals, behaviorSignals);
    const botFields = getBotSignals(payload);

    return Object.assign(payload, botFields);
  };

  primeBehaviorTracking();
  staticSignalPromise = collectStaticSignals();
})();
