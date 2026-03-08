(function bootstrapVisitorTracker() {
  const ns = window.InfinitiVisitor;

  if (!ns || typeof ns.getTrackingPayload !== 'function') {
    return;
  }

  let sent = false;

  function getIdentityPayload() {
    let cachedIdentity = null;

    try {
      cachedIdentity = ns.parseJson(window.localStorage.getItem(ns.storageKeys.googleProfile), null);
    } catch (error) {
      cachedIdentity = null;
    }

    const identity = ns.getState('identity') || cachedIdentity;

    return {
      googleName: identity && identity.googleName ? identity.googleName : '',
      googleEmail: identity && identity.googleEmail ? identity.googleEmail : '',
      googlePhotoUrl: identity && identity.googlePhotoUrl ? identity.googlePhotoUrl : '',
      googleSubId: identity && identity.googleSubId ? identity.googleSubId : '',
      consentTimestamp: identity && identity.consentTimestamp ? identity.consentTimestamp : ''
    };
  }

  function normalizeValue(value) {
    if (value === undefined || value === null) {
      return '';
    }

    if (Array.isArray(value)) {
      return value.join(',');
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return value;
  }

  function orderPayload(payload) {
    return ns.config.sheetFieldOrder.reduce((result, fieldName) => {
      result[fieldName] = normalizeValue(payload[fieldName]);
      return result;
    }, {});
  }

  function fireAndForget(body) {
    const url = ns.config.appsScriptUrl;

    if (!url) {
      return Promise.resolve();
    }

    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([body], {
          type: 'text/plain;charset=UTF-8'
        });

        if (navigator.sendBeacon(url, blob)) {
          return Promise.resolve();
        }
      } catch (error) {
        // Fall through to fetch when beacon support is incomplete.
      }
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 5000);

    return fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8'
      },
      body,
      signal: controller.signal
    })
      .catch((error) => {
        console.error('Visitor tracking request failed:', error);
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
      });
  }

  async function sendPayload(reason) {
    if (sent) {
      return;
    }

    sent = true;

    try {
      const anonymousPayload = await ns.getTrackingPayload();
      const payload = orderPayload(
        Object.assign({}, anonymousPayload, getIdentityPayload(), {
          trackingReason: reason
        })
      );
      const body = JSON.stringify(payload);

      ns.setState('payload', payload, ns.events.payloadReady);
      await fireAndForget(body);
    } catch (error) {
      console.error('Failed to assemble visitor payload:', error);
    }
  }

  function queueSend(reason) {
    return function queuedSend() {
      sendPayload(reason);
    };
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      sendPayload('hidden');
    }
  });

  window.addEventListener('pagehide', queueSend('pagehide'));
  window.addEventListener('beforeunload', queueSend('beforeunload'));
  window.setTimeout(queueSend('timeout'), ns.config.fallbackSendDelayMs);
})();
