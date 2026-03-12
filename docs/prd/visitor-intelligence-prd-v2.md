**PRODUCT REQUIREMENTS DOCUMENT** **Visitor Intelligence & UX Personalization System** infinitilogicsolutions.github.io **Version 2.0 | February 2026 | 67 Signals | Bot Detection Included** Status: Draft — Full Signal Coverage + Human vs Bot Classification  
---  
  
  


**Document Owner** |  Infiniti Logic Solutions |  **v2.0 — Feb 2026**  
---|---|---  
**Platform** |  GitHub Pages (Static) — Vanilla HTML/CSS/JS + Google Apps Script + Google Sheets  
**What's New in v2.0** |  67 total signals across 9 categories. Bot detection engine with 0–100 scoring. 12 JS environment bot checks. Behavioral signals: mouse entropy, first click timing, scroll depth. All signals logged to Google Sheets columns A–BQ.  
  
  


**1\. Executive Summary**

This is version 2.0 of the Visitor Intelligence & UX Personalization PRD for infinitilogicsolutions.github.io. This revision introduces two major enhancements: a complete expansion of the signal capture layer to 67 individual data points across 9 categories, and a new Bot Detection & Human Classification engine that scores each visitor from 0 to 100 and labels them accordingly in Google Sheets.

  


The system remains entirely serverless and free. All 67 signals are captured client-side in the browser and logged as a single row (columns A through BQ) in a Google Sheet via Google Apps Script. No backend server, database, or paid service is required.

  


**📊 v2.0 at a Glance** 67 signals captured per visit | 9 signal categories | 20 bot detection checks | 0-100 bot confidence score | 3 new Sheet columns: botScore, botLabel, botSignals | Total Sheet columns: A to BQ (69 columns) | Zero infrastructure cost  
---  
  
  


**2\. Signal Categories Overview**

All 67 signals are organized into 9 categories. The table below summarizes each category, the number of signals, and their primary purpose.

  


**Category** |  **Signals** |  **Sheet Cols** |  **Purpose**  
---|---|---|---  
**Session** |  **6** |  **A – F** |  **Visit correlation, page tracking, referrer source, new vs returning classification**  
**Display** |  **9** |  **G – O** |  **Screen size, viewport, pixel ratio, color depth, HDR — drives layout and asset decisions**  
**Preference** |  **5** |  **P – T** |  **Dark mode, reduced motion, contrast, Do Not Track — drives accessibility and theme UX. Null values are bot signals.**  
**Hardware** |  **7** |  **U – AA** |  **CPU cores, memory, heap, touch, battery — drives performance mode and animation decisions**  
**Network** |  **5** |  **AB – AF** |  **Connection type, speed, latency, save-data, online status — drives media loading strategy**  
**Locale** |  **3** |  **AG – AI** |  **Timezone, primary language, full language list — drives timestamp localization and formatting**  
**Browser & Platform** |  **6** |  **AJ – AO** |  **Browser, version, OS, device type, PDF viewer, plugin count — drives compatibility and bot detection**  
**Rendering & Fingerprint** |  **6** |  **AP – AU** |  **WebGL vendor/renderer, canvas hash, audio hash — the core fingerprint and primary bot detection signals**  
**Performance** |  **2** |  **AV – AW** |  **Full page load time, time-to-first-byte — site performance monitoring and bot speed detection**  
**Behavioral** |  **6** |  **AX – BC** |  **Time on page, scroll depth, copy events, mouse entropy, first click ms — the strongest human vs bot signals**  
**Bot Detection (JS Env)** |  **6** |  **BD – BI** |  **WebDriver flag, Phantom, Nightmare, Selenium, Chrome runtime, outer window size — automation framework fingerprints**  
**Bot Score** |  **3** |  **BJ – BL** |  **Computed bot confidence score (0-100), human/bot label, triggered signal list — the final verdict**  
**Google Identity** |  **5** |  **BM – BQ** |  **Name, email, photo, Google sub ID, consent timestamp — only populated after One Tap acceptance**  
  
  


**3\. Complete Signal Schema — All 67 Signals**

The table below is the definitive specification for every signal captured and every column written to Google Sheets. Each row corresponds to one column in the Sheet. Columns are in sheet order A through BQ.

  


**🎨 Color Key** Tier: Green = High value | Yellow = Medium value | Red = Low value Category: Red = Bot Check | Orange = Bot Score | Purple = Google Identity | Blue = other categories PII: Red YES = personal data (consent required) | Green No = anonymous signal  
---  
  
  


**Col** |  **Field** |  **Example** |  **Source API** |  **Tier** |  **Category** |  **UX / Bot Use** |  **PII**  
---|---|---|---|---|---|---|---  
**A** |  **timestamp** |  2026-02-24T14:32:11Z |  new Date().toISOString() |  **High** |  **Session** |  Correlation & time analysis |  **No**  
**B** |  **visitorId** |  a3f9b2c1d4e5 |  djb2 hash of all signals |  **High** |  **Session** |  Returning visitor detection |  **No**  
**C** |  **isNew** |  true |  localStorage check ils_visitor_id |  **High** |  **Session** |  Welcome back toast |  **No**  
**D** |  **visitCount** |  5 |  localStorage ils_visit_count |  **High** |  **Session** |  Loyalty segmentation |  **No**  
**E** |  **page** |  /blog.html |  window.location.pathname |  **High** |  **Session** |  Page popularity analysis |  **No**  
**F** |  **referrer** |  https://t.co/xyz |  document.referrer |  **High** |  **Session** |  Traffic source tracking |  **No**  
**G** |  **screenWidth** |  1920 |  screen.width |  **High** |  **Display** |  Device class detection |  **No**  
**H** |  **screenHeight** |  1080 |  screen.height |  **High** |  **Display** |  Device class detection |  **No**  
**I** |  **viewportWidth** |  1440 |  window.innerWidth |  **High** |  **Display** |  Responsive layout hints |  **No**  
**J** |  **viewportHeight** |  810 |  window.innerHeight |  **High** |  **Display** |  Fold detection |  **No**  
**K** |  **devicePixelRatio** |  2 |  window.devicePixelRatio |  **High** |  **Display** |  Retina asset serving |  **No**  
**L** |  **availScreenWidth** |  1920 |  screen.availWidth |  **Medium** |  **Display** |  Taskbar-adjusted layout |  **No**  
**M** |  **availScreenHeight** |  1040 |  screen.availHeight |  **Medium** |  **Display** |  Taskbar-adjusted layout |  **No**  
**N** |  **colorDepth** |  24 |  screen.colorDepth |  **Medium** |  **Display** |  Display quality profiling |  **No**  
**O** |  **hdrSupport** |  true |  matchMedia('(dynamic-range: high)') |  **Low** |  **Display** |  Future HDR content decisions |  **No**  
**P** |  **colorScheme** |  dark |  matchMedia('prefers-color-scheme: dark') |  **High** |  **Preference** |  Auto dark/light mode — BOT SIGNAL if null |  **No**  
**Q** |  **reducedMotion** |  true |  matchMedia('prefers-reduced-motion') |  **High** |  **Preference** |  Disable animations — BOT SIGNAL if null |  **No**  
**R** |  **contrastPref** |  high |  matchMedia('prefers-contrast') |  **Medium** |  **Preference** |  Accessibility mode — BOT SIGNAL if null |  **No**  
**S** |  **doNotTrack** |  1 |  navigator.doNotTrack |  **Medium** |  **Preference** |  Respect privacy preferences |  **No**  
**T** |  **cookieEnabled** |  true |  navigator.cookieEnabled |  **Medium** |  **Preference** |  Feature fallback — BOT SIGNAL if false |  **No**  
**U** |  **cpuCores** |  8 |  navigator.hardwareConcurrency |  **High** |  **Hardware** |  Perf mode — BOT SIGNAL if 0 or null |  **No**  
**V** |  **memoryGB** |  4 |  navigator.deviceMemory |  **High** |  **Hardware** |  Low-memory mode — BOT SIGNAL if null |  **No**  
**W** |  **jsHeapSizeLimit** |  2147483648 |  performance.memory.jsHeapSizeLimit (Chrome) |  **Medium** |  **Hardware** |  Heavy feature gating |  **No**  
**X** |  **isTouch** |  true |  navigator.maxTouchPoints > 0 |  **High** |  **Hardware** |  Tap-friendly UI — BOT SIGNAL if mismatch vs UA |  **No**  
**Y** |  **maxTouchPoints** |  5 |  navigator.maxTouchPoints |  **Medium** |  **Hardware** |  Multi-touch gesture support |  **No**  
**Z** |  **batteryLevel** |  0.72 |  navigator.getBattery().level |  **Medium** |  **Hardware** |  Reduce animations when low |  **No**  
**AA** |  **batteryCharging** |  true |  navigator.getBattery().charging |  **Low** |  **Hardware** |  Power state awareness |  **No**  
**AB** |  **connectionType** |  4g |  navigator.connection.effectiveType |  **High** |  **Network** |  Defer images — BOT SIGNAL if null |  **No**  
**AC** |  **downlinkMbps** |  8.5 |  navigator.connection.downlink |  **High** |  **Network** |  Preload vs defer decisions |  **No**  
**AD** |  **rttMs** |  120 |  navigator.connection.rtt |  **High** |  **Network** |  Latency-aware UX |  **No**  
**AE** |  **saveData** |  false |  navigator.connection.saveData |  **High** |  **Network** |  Data saver mode — skip media |  **No**  
**AF** |  **isOnline** |  true |  navigator.onLine |  **Medium** |  **Network** |  Offline mode detection |  **No**  
**AG** |  **timezone** |  Asia/Kolkata |  Intl.DateTimeFormat().resolvedOptions().timeZone |  **High** |  **Locale** |  Localize timestamps |  **No**  
**AH** |  **language** |  en-IN |  navigator.language |  **High** |  **Locale** |  Date/number formatting |  **No**  
**AI** |  **languages** |  en-IN,en,hi |  navigator.languages.join(',') |  **Medium** |  **Locale** |  Multi-language audience data |  **No**  
**AJ** |  **browser** |  Chrome 121 |  Parsed navigator.userAgent |  **High** |  **Browser** |  Compatibility segmentation |  **No**  
**AK** |  **browserVersion** |  121.0.6167 |  Parsed navigator.userAgent |  **Medium** |  **Browser** |  Feature support decisions |  **No**  
**AL** |  **os** |  macOS 14 |  Parsed navigator.userAgent |  **High** |  **Browser** |  OS-specific UX hints |  **No**  
**AM** |  **deviceType** |  desktop |  Inferred from UA + touch + screen |  **High** |  **Browser** |  Layout mode selection |  **No**  
**AN** |  **pdfViewerEnabled** |  true |  navigator.pdfViewerEnabled |  **Low** |  **Browser** |  Link vs embed PDF decisions |  **No**  
**AO** |  **pluginCount** |  3 |  navigator.plugins.length |  **Medium** |  **Browser** |  BOT SIGNAL if 0 in Chrome |  **No**  
**AP** |  **webglVendor** |  Google Inc. |  WebGLRenderingContext VENDOR string |  **Medium** |  **Rendering** |  BOT SIGNAL if Brian Paul / Mesa |  **No**  
**AQ** |  **webglRenderer** |  ANGLE (Intel Iris) |  WebGLRenderingContext RENDERER string |  **High** |  **Rendering** |  BOT SIGNAL if SwiftShader / llvmpipe |  **No**  
**AR** |  **canvasHash** |  8f3c2a1b |  Canvas 2D text rendering hash |  **High** |  **Rendering** |  BOT SIGNAL if matches headless hashes |  **No**  
**AS** |  **audioSampleRate** |  44100 |  AudioContext.sampleRate |  **Medium** |  **Rendering** |  Fingerprint signal |  **No**  
**AT** |  **audioChannels** |  2 |  AudioContext.destination.maxChannelCount |  **Low** |  **Rendering** |  Audio environment profiling |  **No**  
**AU** |  **audioHash** |  c4d7e9f2 |  AudioContext oscillator processing hash |  **High** |  **Rendering** |  BOT SIGNAL if matches headless output |  **No**  
**AV** |  **pageLoadMs** |  843 |  performance.timing loadEventEnd - navigationStart |  **High** |  **Performance** |  Perf monitoring & bot speed detection |  **No**  
**AW** |  **ttfbMs** |  210 |  performance.timing responseStart - navigationStart |  **Medium** |  **Performance** |  Server response monitoring |  **No**  
**AX** |  **timeOnPageSec** |  127 |  beforeunload timestamp delta |  **High** |  **Behavioral** |  BOT SIGNAL if < 2 sec |  **No**  
**AY** |  **scrollDepthPct** |  68 |  Max scroll / document height * 100 |  **High** |  **Behavioral** |  BOT SIGNAL if 0 with time > 5s |  **No**  
**AZ** |  **copyEventFired** |  true |  document copy event listener |  **Medium** |  **Behavioral** |  Content interest signal |  **No**  
**BA** |  **mouseVsKeyboard** |  mouse |  Tab keydown vs mousemove detection |  **Medium** |  **Behavioral** |  BOT SIGNAL if neither detected |  **No**  
**BB** |  **firstClickMs** |  3420 |  ms from page load to first click |  **High** |  **Behavioral** |  BOT SIGNAL if < 100ms or never |  **No**  
**BC** |  **mouseEntropyScore** |  0.83 |  Variance in mouse movement vectors (0-1) |  **High** |  **Behavioral** |  BOT SIGNAL if 0 (perfectly straight) |  **No**  
**BD** |  **webdriverFlag** |  false |  navigator.webdriver |  **High** |  **Bot Check** |  BOT SIGNAL +40pts if true |  **No**  
**BE** |  **phantomFlag** |  false |  window.phantom / window._phantom defined |  **High** |  **Bot Check** |  BOT SIGNAL +35pts if true |  **No**  
**BF** |  **nightmareFlag** |  false |  window.__nightmare defined |  **High** |  **Bot Check** |  BOT SIGNAL +35pts if true |  **No**  
**BG** |  **seleniumFlag** |  false |  document.__selenium_unwrapped defined |  **High** |  **Bot Check** |  BOT SIGNAL +35pts if true |  **No**  
**BH** |  **chromeRuntimeOk** |  true |  window.chrome.runtime exists in Chrome UA |  **High** |  **Bot Check** |  BOT SIGNAL +20pts if false in Chrome |  **No**  
**BI** |  **outerWidthOk** |  true |  window.outerWidth > 0 && outerHeight > 0 |  **High** |  **Bot Check** |  BOT SIGNAL +15pts if both 0 |  **No**  
**BJ** |  **botScore** |  12 |  Computed 0-100 from all bot signals |  **High** |  **Bot Score** |  Human=0-20 / Suspicious=41-60 / Bot=61+ |  **No**  
**BK** |  **botLabel** |  Human |  Derived from botScore threshold |  **High** |  **Bot Score** |  Human / Likely Human / Suspicious / Bot |  **No**  
**BL** |  **botSignals** |  webdriver,swiftshader |  Comma-separated list of triggered checks |  **High** |  **Bot Score** |  Audit trail of which signals fired |  **No**  
**BM** |  **googleName** |  John Doe |  One Tap JWT given_name + family_name |  **High** |  **Identity** |  Personalized greeting |  **YES**  
**BN** |  **googleEmail** |  j@gmail.com |  One Tap JWT email |  **High** |  **Identity** |  Audience identification |  **YES**  
**BO** |  **googlePhotoUrl** |  https://lh3... |  One Tap JWT picture |  **Medium** |  **Identity** |  Avatar in nav |  **YES**  
**BP** |  **googleSubId** |  107691503... |  One Tap JWT sub |  **High** |  **Identity** |  Stable cross-device identity |  **YES**  
**BQ** |  **consentTimestamp** |  2026-02-24T14:32Z |  Time One Tap accepted |  **High** |  **Identity** |  Consent audit trail |  **YES**  
  
  


**4\. Bot Detection Engine**

Every visit is automatically scored using a weighted multi-signal algorithm. The score ranges from 0 (definitely human) to 100 (definitely bot). No single signal is conclusive — the power of this system is cross-signal consistency. A real human on a real browser will naturally pass almost all checks without any effort.

  


**4.1 Scoring Algorithm**

The bot score is computed client-side in fingerprint.js before the payload is sent to Google Sheets. Each check that fails adds its defined points to a running total. The total is capped at 100. The final score, label, and list of triggered signals are stored in fields botScore (column BJ), botLabel (column BK), and botSignals (column BL).

  


**⚙️ Algorithm Summary** let score = 0, triggered = [] For each check: if (condition is met) { score += points; triggered.push(signalName) } botScore = Math.min(score, 100) botLabel = score <= 20 ? 'Human' : score <= 40 ? 'Likely Human' : score <= 60 ? 'Suspicious' : score <= 80 ? 'Likely Bot' : 'Bot' botSignals = triggered.join(',')  
---  
  
  


**4.2 Bot Check Definitions**

The table below lists all 20 checks, their point values, the Sheet field they relate to, and the reason they are reliable bot indicators.

  


**Bot Check** |  **Points** |  **Sheet Field** |  **Why It Works**  
---|---|---|---  
**navigator.webdriver = true** |  **+40** |  **webdriverFlag** |  **Selenium / Playwright / Puppeteer default — near-certain automation**  
**window.phantom / _phantom defined** |  **+35** |  **phantomFlag** |  **PhantomJS headless browser**  
**window.__nightmare defined** |  **+35** |  **nightmareFlag** |  **Nightmare.js automation framework**  
**document.__selenium_unwrapped defined** |  **+35** |  **seleniumFlag** |  **Selenium WebDriver injection artifact**  
**webglRenderer = SwiftShader/llvmpipe** |  **+25** |  **webglRenderer** |  **Software GPU renderer — no real graphics hardware**  
**webglVendor = Brian Paul / Mesa** |  **+20** |  **webglVendor** |  **Mesa open-source renderer — VM or headless environment**  
**canvasHash matches known headless set** |  **+25** |  **canvasHash** |  **Headless Chrome renders canvas differently to real Chrome**  
**audioHash matches headless output** |  **+20** |  **audioHash** |  **AudioContext output differs in headless environments**  
**colorScheme = null** |  **+10** |  **colorScheme** |  **Headless browsers have no system color preference**  
**connectionType = null** |  **+10** |  **connectionType** |  **Network Information API not exposed in headless**  
**cpuCores = 0 or null** |  **+10** |  **cpuCores** |  **Hardware concurrency not properly exposed**  
**memoryGB = null** |  **+10** |  **memoryGB** |  **Device memory API not exposed in headless Chrome**  
**pluginCount = 0 in Chrome UA** |  **+15** |  **pluginCount** |  **Real Chrome always has at least 1 plugin entry**  
**chrome.runtime missing in Chrome UA** |  **+20** |  **chromeRuntimeOk** |  **Real Chrome always has window.chrome.runtime**  
**outerWidth = 0 AND outerHeight = 0** |  **+15** |  **outerWidthOk** |  **Headless default — no visible browser window**  
**timeOnPageSec < 2** |  **+20** |  **timeOnPageSec** |  **Too fast for a human to read any content**  
**scrollDepthPct = 0 AND time > 5s** |  **+15** |  **scrollDepthPct** |  **Human readers always scroll; bots often do not**  
**mouseEntropyScore = 0** |  **+15** |  **mouseEntropy** |  **Bots move in perfectly straight lines or not at all**  
**firstClickMs < 100ms** |  **+15** |  **firstClickMs** |  **Humans cannot physically click this fast after page load**  
**isTouch mismatch vs UA deviceType** |  **+10** |  **isTouch** |  **Spoofed mobile UA but touch points = 0**  
  
  


**4.3 Score Thresholds & Actions**

The botLabel field translates the numeric score into a human-readable classification. The table below defines the threshold ranges, recommended system actions, and the Google Sheets COUNTIF formula to use in the dashboard tab.

  


**Score Range** |  **Label** |  **Action** |  **Sheet Filter**  
---|---|---|---  
**0 – 20** |  **Human ✅** |  Personalize UI, count as real visitor, show in dashboard |  =COUNTIF(BK:BK,"Human")  
**21 – 40** |  **Likely Human 🟡** |  Count as real visitor with low-confidence flag |  =COUNTIF(BK:BK,"Likely Human")  
**41 – 60** |  **Suspicious 🟠** |  Exclude from UX personalization. Flag for review. |  =COUNTIF(BK:BK,"Suspicious")  
**61 – 80** |  **Likely Bot 🔴** |  Exclude from all metrics. Log botSignals for pattern analysis. |  =COUNTIF(BK:BK,"Likely Bot")  
**81 – 100** |  **Bot 🤖** |  Exclude entirely. Consider Apps Script IP-based rate limiting. |  =COUNTIF(BK:BK,"Bot")  
  
  


**4.4 Bot Detection Limitations**

  * Sophisticated bots (e.g. Playwright with stealth plugins) can spoof navigator.webdriver and some JS environment signals. However, canvas hash, audio hash, and behavioral signals remain very difficult to fake perfectly.
  * VPNs and corporate proxies do not affect the bot score — the checks are purely client-side JavaScript environment checks, not IP-based.
  * Some legitimate automated tools (e.g. Googlebot for SEO) will score as bots. This is expected and correct — they are not human visitors. Filter them out of UX personalization but keep them for SEO analysis.
  * Battery API, Network Information API, and Device Memory API are not available in all browsers. Null values from these APIs alone do not indicate a bot — they are weighted accordingly.



  


**5\. Google One Tap — Identity Capture**

Google One Tap is an optional, consent-based layer on top of the anonymous fingerprint system. When a user is signed into Google in their browser, a small prompt appears asking them to continue as their Google account. If accepted, their name, email, photo URL, and Google subject ID are added to the same row in Google Sheets alongside all device signals.

  


**🔐 Privacy Architecture** The One Tap JWT is decoded entirely client-side using atob() — no server-side token exchange is needed. No Google OAuth scopes are requested beyond basic profile. This means no access to Gmail, Calendar, Drive, or any other Google service. Users who dismiss the prompt are tracked anonymously via fingerprint only.  
---  
  
  


**5.1 One Tap Behavior Rules**

  * Prompt appears 2 seconds after DOMContentLoaded to avoid interfering with initial paint
  * If user has previously consented (ils_google_profile in localStorage), prompt is suppressed
  * If user dismisses prompt, suppressed for 7 days (ils_onetap_dismissed timestamp)
  * On Firefox: One Tap is known to be blocked — falls back to anonymous fingerprint silently
  * On mobile: prompt displayed as a bottom sheet (Google's default responsive behavior)



  


**5.2 Data Written to Sheets (Columns BM – BQ)**

  * BM — googleName: Display name from JWT (given_name + family_name)
  * BN — googleEmail: Email address from JWT
  * BO — googlePhotoUrl: Profile picture CDN URL from JWT
  * BP — googleSubId: Stable unique Google user ID (sub claim) — does not change even if email changes
  * BQ — consentTimestamp: ISO 8601 timestamp of when One Tap was accepted



  


**6\. Google Sheets Architecture**

**6.1 Tab Structure**

  * Tab 1: Raw Log — one row per visit, columns A through BQ (69 columns total)
  * Tab 2: Human Traffic — filtered view: =QUERY(Raw Log, "SELECT * WHERE BK='Human' OR BK='Likely Human'")
  * Tab 3: Bot Traffic — filtered view of Suspicious / Likely Bot / Bot rows for analysis
  * Tab 4: Dashboard — formula-driven metrics and charts using only human traffic



  


**6.2 Dashboard Tab — Key Metrics**

  * Total unique human visitors: =COUNTUNIQUE(FILTER('Raw Log'!B:B, ('Raw Log'!BK:BK="Human")+('Raw Log'!BK:BK="Likely Human")))
  * Bot rate %: =COUNTIF('Raw Log'!BK:BK,"Bot")/COUNTA('Raw Log'!BK:BK)*100
  * Dark mode adoption: =COUNTIF(FILTER('Raw Log'!P:P,('Raw Log'!BK:BK="Human")),"dark")/COUNTA(FILTER('Raw Log'!P:P,('Raw Log'!BK:BK="Human")))*100
  * New vs returning ratio: =COUNTIF(FILTER('Raw Log'!C:C,('Raw Log'!BK:BK="Human")),TRUE)/COUNTA(FILTER('Raw Log'!C:C,('Raw Log'!BK:BK="Human")))
  * One Tap opt-in rate: =COUNTA(FILTER('Raw Log'!BN:BN,'Raw Log'!BN:BN<>""))/COUNTA(FILTER('Raw Log'!B:B,('Raw Log'!BK:BK="Human")))*100
  * Top pages by human visits: =QUERY(FILTER('Raw Log'!A:BQ,('Raw Log'!BK:BK="Human")),"SELECT E, COUNT(E) GROUP BY E ORDER BY COUNT(E) DESC LIMIT 10")
  * Device type breakdown: =QUERY(FILTER(...),"SELECT AM, COUNT(AM) GROUP BY AM")
  * Top timezones: =QUERY(FILTER(...),"SELECT AG, COUNT(AG) GROUP BY AG ORDER BY COUNT(AG) DESC LIMIT 10")
  * Average time on page (humans): =AVERAGE(FILTER('Raw Log'!AX:AX,('Raw Log'!BK:BK="Human")))
  * Average scroll depth (humans): =AVERAGE(FILTER('Raw Log'!AY:AY,('Raw Log'!BK:BK="Human")))
  * Most common bot signals: =QUERY('Bot Traffic'!BL:BL,"SELECT BL, COUNT(BL) GROUP BY BL ORDER BY COUNT(BL) DESC")



  


**7\. System Architecture**

**Data Flow** User visits page → fingerprint.js collects all 67 signals (async, non-blocking) → Bot scoring algorithm computes botScore, botLabel, botSignals → one-tap.js presents Google prompt (if user logged into Google) → tracker.js assembles full 69-field payload → fetch() POST to Google Apps Script Web App (fire-and-forget, no-cors) → Apps Script appends single row to Raw Log sheet (columns A–BQ) → personalizer.js applies DOM/CSS changes based on profile (parallel, no dependency on Sheet write)  
---  
  
  


**7.1 File Structure**

**File** |  **Status** |  **Responsibility**  
---|---|---  
**assets/js/fingerprint.js** |  **NEW** |  **Collect all 64 device/behavioral/bot signals. Compute bot score. Cache to localStorage.**  
**assets/js/one-tap.js** |  **NEW** |  **Load Google Identity Services. Display One Tap prompt. Decode JWT. Store profile.**  
**assets/js/tracker.js** |  **NEW** |  **Assemble 69-field payload. POST to Apps Script. Handle timeout with AbortController.**  
**assets/js/personalizer.js** |  **NEW** |  **Apply dark mode, perf mode, touch mode, returning visitor toast, Google avatar in nav.**  
**assets/css/custom.css** |  **MODIFIED** |  **Add .perf-mode, .no-motion, .touch-mode, [data-theme='dark'] CSS rules.**  
**index/blog/projects/about/post.html** |  **MODIFIED** |  **Add <script async> tags for all 4 JS modules. Add privacy notice to footer.**  
**Google Apps Script (external)** |  **NEW** |  **doPost() function. Parses payload. Appends row to Raw Log sheet.**  
**Google Sheet (external)** |  **NEW** |  **Raw Log tab (A–BQ). Human Traffic tab. Bot Traffic tab. Dashboard tab.**  
  
  


**8\. Privacy & Legal**

**8.1 PII Policy**

**PII Handling Policy** 5 fields are PII: googleName (BM), googleEmail (BN), googlePhotoUrl (BO), googleSubId (BP), consentTimestamp (BQ). These are ONLY written to the Sheet after explicit Google One Tap acceptance. All other 64 signals are non-PII. The bot score and signals are derived from anonymous device data.  
---  
  
  


**8.2 Required Footer Disclosure**

_"This site collects anonymous device signals (screen size, browser, timezone, preferences, and interaction data) to personalize your experience, analyze traffic, and detect automated bots. If you sign in with Google, your name and email are also stored. All data is held in a private Google Sheet owned by the site operator and is never shared with third parties. To request deletion of your data, contact us or clear your browser's localStorage."_  
---  
  
  


**9\. Implementation Plan**

**#** |  **Phase** |  **Tasks** |  **Est. Effort**  
---|---|---|---  
**1** |  **Sheet + Apps Script** |  **Create Google Sheet with 69-column schema (A–BQ). Name tabs: Raw Log, Human Traffic, Bot Traffic, Dashboard. Write and deploy Apps Script doPost() function. Test with curl.** |  **2–3 hrs**  
**2** |  **fingerprint.js** |  **Implement all 64 signal collectors with try/catch fallbacks. Implement djb2 hash. Implement 20-check bot scoring algorithm. Add localStorage caching. Test across Chrome, Firefox, Safari, Edge, and headless Chrome.** |  **5–6 hrs**  
**3** |  **tracker.js** |  **Build 69-field payload assembler. Implement fire-and-forget fetch() with AbortController 5s timeout. Wire up beforeunload listener for timeOnPage. Validate rows appearing in Sheet.** |  **2 hrs**  
**4** |  **one-tap.js** |  **Register OAuth 2.0 Client ID in Google Cloud Console. Implement One Tap with 2s delay. Implement JWT decode. Add localStorage profile caching and 7-day dismiss suppression.** |  **2–3 hrs**  
**5** |  **personalizer.js** |  **Implement dark mode, perf mode, touch mode, reduced motion. Add returning visitor toast on index.html. Add Google avatar/name to nav. Localize all post timestamps.** |  **3–4 hrs**  
**6** |  **HTML + CSS wiring** |  **Add <script async> to all 5 HTML pages. Add .perf-mode / .no-motion / .touch-mode CSS. Add privacy notice to footer on all pages.** |  **1–2 hrs**  
**7** |  **Sheet dashboard** |  **Build Human Traffic and Bot Traffic filter tabs. Build Dashboard tab with all formulas from Section 6.2. Validate metrics against test data.** |  **2 hrs**  
**8** |  **Bot validation** |  **Run headless Chrome (Puppeteer) against live site. Verify bot score ≥ 61. Run Selenium. Verify webdriverFlag = true. Verify all 20 checks work as expected.** |  **1–2 hrs**  
**9** |  **Deploy & monitor** |  **Push to GitHub. Monitor Sheet for 48 hours. Validate human vs bot ratio looks realistic. Tune thresholds if needed.** |  **1 hr**  
  
  


**⏱ Total Estimated Effort** 18–25 hours of development. No ongoing maintenance required. The system is fully self-sustaining once deployed on free-tier infrastructure.  
---  
  
  


**10\. Risks & Mitigations**

**Risk** |  **Likelihood** |  **Impact** |  **Mitigation**  
---|---|---|---  
**Stealth bots bypass webdriver check** |  **Medium** |  **Low — noise in data** |  **Canvas + audio hash checks are very hard to spoof. Behavioral signals (scroll, mouse entropy) are impossible to perfectly fake at scale.**  
**Apps Script 20k/day rate limit** |  **Very Low** |  **Medium — data gaps** |  **20k calls/day is ~833/hour. A personal blog is extremely unlikely to hit this.**  
**One Tap blocked (Firefox / ad blockers)** |  **Medium** |  **Low — graceful fallback** |  **System falls back silently to anonymous fingerprint. No UX disruption. One Tap columns simply remain empty.**  
**GDPR challenge on fingerprint** |  **Low** |  **High — legal risk** |  **Privacy notice in footer. Data deletion mechanism via localStorage clear. No cross-site data sharing. Sheet is private.**  
**Apps Script URL scraped / spammed** |  **Medium** |  **Low — junk rows** |  **Add payload validation in Apps Script. Junk rows will score as bots and be filtered from dashboards automatically.**  
**Network API unavailable (Safari)** |  **High** |  **Low — partial data** |  **All signal collection wrapped in try/catch. Null values stored. Bot scoring does not penalize for Safari API gaps.**  
  
  


**11\. Open Questions**

  * Should the bot score threshold for UX exclusion be 41 (Suspicious) or 61 (Likely Bot)? Lower = more aggressive filtering.
  * Should Googlebot (SEO crawler) be whitelisted and tracked separately from malicious bots?
  * Should the 'Welcome back' toast appear on all pages or only index.html on return visits?
  * Is there a requirement to alert the site owner (e.g. via email) when bot traffic exceeds a threshold?
  * Should a 'Clear my data' link be surfaced in the privacy notice footer?
  * Should the Google Sheet be shared read-only with any other stakeholders?



  


**12\. Appendix — Third-Party Services**

**Service** |  **Purpose** |  **URL / Reference**  
---|---|---  
**Google Identity Services** |  **One Tap sign-in JS library** |  **accounts.google.com/gsi/client**  
**Google Cloud Console** |  **Create OAuth 2.0 Client ID** |  **console.cloud.google.com**  
**Google Apps Script** |  **Serverless POST endpoint** |  **script.google.com**  
**Google Sheets** |  **Data store + dashboard** |  **sheets.google.com**  
**FingerprintJS (reference)** |  **Open-source signal examples** |  **github.com/fingerprintjs/fingerprintjs**  
**CreepJS (reference)** |  **Advanced bot detection techniques** |  **github.com/abrahamjuliot/creepjs**  
  
  


_END OF DOCUMENT — PRD v2.0 — 67 Signals + Bot Detection — Infiniti Logic Solutions — February 2026_
