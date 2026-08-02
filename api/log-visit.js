// Função serverless (Vercel) que recebe um "beacon" do client a cada
// carregamento de página e manda um embed pro Discord com o máximo de
// info que dá pra coletar sem exigir permissão do visitante: IP,
// geolocalização aproximada (via headers da Vercel), user-agent,
// referrer e alguns dados de navigator/screen enviados pelo client.
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    res.status(500).json({ error: "DISCORD_WEBHOOK_URL não configurada" });
    return;
  }

  const client = req.body && typeof req.body === "object" ? req.body : {};

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "desconhecido";

  const geo = {
    country: req.headers["x-vercel-ip-country"] || null,
    region: req.headers["x-vercel-ip-country-region"] || null,
    city: req.headers["x-vercel-ip-city"] ? decodeURIComponent(req.headers["x-vercel-ip-city"]) : null,
    lat: req.headers["x-vercel-ip-latitude"] || null,
    lon: req.headers["x-vercel-ip-longitude"] || null,
    tz: req.headers["x-vercel-ip-timezone"] || null,
    postal: req.headers["x-vercel-ip-postal-code"] || null,
  };

  const userAgent = req.headers["user-agent"] || "desconhecido";
  const referer = req.headers["referer"] || client.referrer || "direto";
  const locationStr = [geo.city, geo.region, geo.country].filter(Boolean).join(", ") || "desconhecida";

  const fields = [
    { name: "IP", value: `\`${ip}\``, inline: true },
    { name: "Localização (geo-IP)", value: locationStr, inline: true },
    { name: "CEP aprox.", value: geo.postal || "—", inline: true },
    { name: "Página", value: client.path || "/", inline: false },
    { name: "Referrer", value: referer, inline: false },
    { name: "User-Agent", value: String(userAgent).slice(0, 1000), inline: false },
    { name: "Idioma(s)", value: client.languages || client.language || "—", inline: true },
    { name: "Timezone (browser)", value: client.timezone || "—", inline: true },
    { name: "Timezone (IP)", value: geo.tz || "—", inline: true },
    { name: "Plataforma", value: client.platform || "—", inline: true },
    { name: "Resolução da tela", value: client.screen || "—", inline: true },
    { name: "Viewport", value: client.viewport || "—", inline: true },
    { name: "Pixel ratio", value: client.pixelRatio ? String(client.pixelRatio) : "—", inline: true },
    { name: "Núcleos de CPU", value: client.cores != null ? String(client.cores) : "—", inline: true },
    { name: "RAM aprox.", value: client.deviceMemory ? `${client.deviceMemory} GB` : "—", inline: true },
    { name: "Tipo de conexão", value: client.connection || "—", inline: true },
    { name: "Cookies habilitados", value: client.cookiesEnabled === false ? "não" : "sim", inline: true },
  ];

  if (geo.lat && geo.lon) {
    fields.push({
      name: "Mapa",
      value: `[Ver no mapa](https://www.google.com/maps?q=${geo.lat},${geo.lon})`,
      inline: false,
    });
  }

  const embed = {
    title: "🌐 Novo acesso ao site",
    description: client.title ? `**${client.title}**` : undefined,
    color: 0x5865f2,
    fields,
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (err) {
    // não bloqueia a resposta ao visitante se o Discord falhar
  }

  res.status(204).end();
};
