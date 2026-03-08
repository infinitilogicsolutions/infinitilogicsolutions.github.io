(function bootstrapVisitorConfig() {
  const ns = (window.InfinitiVisitor = window.InfinitiVisitor || {});

  ns.config = Object.assign(
    {
      appsScriptUrl:
        'https://script.google.com/macros/s/AKfycbyr6Amdq4inboH-AKGdo4tefcMibyhFvGmxf8-3tmdoEJod_8j6_5t2zsHcmTZm32SP/exec',
      googleClientId:
        '300617189698-em1o8dqvoe96gm8qsidoalph9g8dffen.apps.googleusercontent.com',
      oneTapEnabled: true,
      oneTapDelayMs: 2000,
      fallbackSendDelayMs: 120000,
      botPersonalizationMode: 'log_only',
      sheetFieldOrder: [
        'timestamp',
        'visitorId',
        'isNew',
        'visitCount',
        'page',
        'referrer',
        'screenWidth',
        'screenHeight',
        'viewportWidth',
        'viewportHeight',
        'devicePixelRatio',
        'availScreenWidth',
        'availScreenHeight',
        'colorDepth',
        'hdrSupport',
        'colorScheme',
        'reducedMotion',
        'contrastPref',
        'doNotTrack',
        'cookieEnabled',
        'cpuCores',
        'memoryGB',
        'jsHeapSizeLimit',
        'isTouch',
        'maxTouchPoints',
        'batteryLevel',
        'batteryCharging',
        'connectionType',
        'downlinkMbps',
        'rttMs',
        'saveData',
        'isOnline',
        'timezone',
        'language',
        'languages',
        'browser',
        'browserVersion',
        'os',
        'deviceType',
        'pdfViewerEnabled',
        'pluginCount',
        'webglVendor',
        'webglRenderer',
        'canvasHash',
        'audioSampleRate',
        'audioChannels',
        'audioHash',
        'pageLoadMs',
        'ttfbMs',
        'timeOnPageSec',
        'scrollDepthPct',
        'copyEventFired',
        'mouseVsKeyboard',
        'firstClickMs',
        'mouseEntropyScore',
        'webdriverFlag',
        'phantomFlag',
        'nightmareFlag',
        'seleniumFlag',
        'chromeRuntimeOk',
        'outerWidthOk',
        'botScore',
        'botLabel',
        'botSignals',
        'googleName',
        'googleEmail',
        'googlePhotoUrl',
        'googleSubId',
        'consentTimestamp'
      ]
    },
    ns.config || {}
  );

  ns.storageKeys = Object.assign(
    {
      visitorId: 'ils_visitor_id',
      visitCount: 'ils_visit_count',
      fingerprintCache: 'ils_fingerprint_cache',
      googleProfile: 'ils_google_profile',
      oneTapDismissed: 'ils_onetap_dismissed',
      welcomeToastSeen: 'ils_welcome_toast_seen'
    },
    ns.storageKeys || {}
  );

  ns.events = Object.assign(
    {
      fingerprintReady: 'ils:fingerprint-ready',
      identityReady: 'ils:identity-ready',
      payloadReady: 'ils:payload-ready'
    },
    ns.events || {}
  );

  ns.state = ns.state || {};

  ns.setState = function setState(key, value, eventName) {
    ns.state[key] = value;

    if (eventName) {
      document.dispatchEvent(
        new CustomEvent(eventName, {
          detail: value
        })
      );
    }

    return value;
  };

  ns.getState = function getState(key) {
    return ns.state[key];
  };

  ns.parseJson = function parseJson(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  };
})();
