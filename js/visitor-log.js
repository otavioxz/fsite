// ============================================================
// Registra cada visita mandando um "beacon" pra api/log-visit.js,
// que repassa os dados pro Discord. Roda em segundo plano e nunca
// quebra o site caso a rota não exista (ex.: rodando local sem
// `vercel dev`, ou hospedagem sem serverless functions).
// ============================================================
(function () {
  try {
    const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
    const payload = {
      path: location.pathname + location.search,
      title: document.title,
      referrer: document.referrer || null,
      language: navigator.language || null,
      languages: navigator.languages ? navigator.languages.join(", ") : null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: screen.width + "x" + screen.height,
      viewport: window.innerWidth + "x" + window.innerHeight,
      pixelRatio: window.devicePixelRatio || null,
      platform: navigator.platform || null,
      cores: navigator.hardwareConcurrency || null,
      deviceMemory: navigator.deviceMemory || null,
      connection: conn ? conn.effectiveType : null,
      cookiesEnabled: navigator.cookieEnabled,
    };
    fetch("/api/log-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch (e) {
    // silencioso — logging nunca deve afetar a experiência do site
  }
})();
