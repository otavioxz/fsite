// ============================================================
// Integração com Discord em tempo real via Lanyard (lanyard.rest)
// Requer: CONFIG.discord.userId preenchido + estar no servidor
// Discord do Lanyard (https://discord.gg/lanyard) para o cache ativar.
// ============================================================
(function () {
  const STATUS_COLORS = {
    online: "#23a55a",
    idle: "#f0b232",
    dnd: "#f23f43",
    offline: "#80848e",
  };
  const STATUS_LABELS = {
    online: "Online",
    idle: "Ausente",
    dnd: "Não perturbe",
    offline: "Offline",
  };

  // Mapa de insígnias públicas do Discord (bit do public_flags -> hash do ícone).
  // Não é uma API oficial documentada pela Discord, é a mesma tabela usada por
  // vários projetos open-source de "profile card". Nitro e Server Boost NÃO
  // aparecem aqui pois exigem acesso privilegiado que o Lanyard não tem.
  const BADGE_MAP = {
    1: { name: "Discord Staff", hash: "5e74e9b61934fc1f67c65515d1f7e60d" },
    2: { name: "Discord Partner", hash: "3f9748e53446a137a052f3454e2de41e" },
    4: { name: "HypeSquad Events", hash: "bf01d1073931f921909045f3a39fd264" },
    8: { name: "Bug Hunter Nível 1", hash: "2717692c7dca7289b35297368a940dd0" },
    64: { name: "HypeSquad Bravery", hash: "8a88d63823d8a71cd5e390baa45efa02" },
    128: { name: "HypeSquad Brilliance", hash: "011940fd013da3f7fb926e4a1cd2e618" },
    256: { name: "HypeSquad Balance", hash: "3aa41de486fa12454c3761e8e223442e" },
    512: { name: "Early Supporter", hash: "7060786766c9c840eb3019e725d2b358" },
    16384: { name: "Bug Hunter Nível 2", hash: "848f79194d4be5ff5f81505cbd0ce1e6" },
    131072: { name: "Early Verified Bot Developer", hash: "6df5892e0f35b051f8b61eace34f4967" },
    262144: { name: "Moderador Certificado", hash: "fee1624003e2fee35cb398e125dc479b" },
    4194304: { name: "Active Developer", hash: "6bdc42827a38498929a4920da12695d9" },
  };

  const userId = CONFIG.discord && CONFIG.discord.userId;
  const statusTextEl = document.querySelector("[data-status-text]");
  const statusDots = document.querySelectorAll("[data-status-dot]");
  const statusPings = document.querySelectorAll("[data-status-ping]");
  const avatarImg = document.querySelector("[data-avatar-img]");
  const avatarInitials = document.querySelector("[data-avatar-initials]");
  const activityEl = document.querySelector("[data-discord-activity]");

  function applyStatus(status) {
    const color = STATUS_COLORS[status] || STATUS_COLORS.offline;
    statusDots.forEach((el) => (el.style.backgroundColor = color));
    statusPings.forEach((el) => (el.style.backgroundColor = color));
    if (statusTextEl) statusTextEl.textContent = STATUS_LABELS[status] || "Offline";
  }

  function applyAvatar(discordUser) {
    if (!discordUser || !discordUser.avatar) return;
    const url = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=128`;
    if (avatarImg) {
      avatarImg.src = url;
      avatarImg.style.display = "block";
      if (avatarInitials) avatarInitials.style.display = "none";
    }
  }

  function applyBadges(discordUser) {
    if (!discordUser || typeof window.renderProfileBadges !== "function") return;
    const flags = discordUser.public_flags || 0;
    const active = Object.entries(BADGE_MAP)
      .filter(([bit]) => (flags & Number(bit)) === Number(bit))
      .map(([, badge]) => ({
        name: badge.name,
        img: `https://cdn.discordapp.com/badge-icons/${badge.hash}.png`,
      }));
    window.renderProfileBadges(active);
  }

  const SPOTIFY_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.42.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.18-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"></path></svg>';

  const VSCODE_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.15 2.587 18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z"></path></svg>';
  const GAME_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="11" y2="11"></line><line x1="8" x2="8" y1="9" y2="13"></line><line x1="15" x2="15.01" y1="12" y2="12"></line><line x1="18" x2="18.01" y1="10" y2="10"></line><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"></path></svg>';

  // editores de código reconhecidos como "Studying" (o resto vira "Jogando")
  const CODE_APPS = /visual studio code|^code$|vscode|cursor|vscodium|intellij|pycharm|webstorm|sublime|neovim|zed/i;

  const esc = (str) =>
    String(str == null ? "" : str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Converte o asset de uma atividade (large_image/small_image) em URL.
  // "mp:external/..." é imagem externa servida pelo proxy de mídia do Discord;
  // o resto é asset da aplicação no CDN.
  function assetUrl(act, key) {
    const img = act.assets && act.assets[key];
    if (!img) return "";
    if (img.startsWith("mp:external/")) return `https://media.discordapp.net/external/${img.slice(12)}`;
    if (img.startsWith("mp:")) return `https://media.discordapp.net/${img.slice(3)}`;
    if (act.application_id) return `https://cdn.discordapp.com/app-assets/${act.application_id}/${img}.png`;
    return "";
  }

  function fmtElapsed(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  }

  function activityBlock(act) {
    const isCode = CODE_APPS.test(act.name);
    const large = assetUrl(act, "large_image");
    const small = assetUrl(act, "small_image");
    const start = act.timestamps && act.timestamps.start;
    const label = isCode ? "Studying" : "Jogando";
    // no VS Code o nome do app vira subtítulo; o título é o que está sendo feito
    const title = act.details || act.name;
    const lines = [act.state, act.details ? act.name : ""].filter(Boolean);
    return `
      <div class="activity-block ${isCode ? "is-code" : "is-game"}">
        <div class="activity-label">
          <span class="activity-label-icon">${isCode ? VSCODE_ICON : GAME_ICON}</span>
          <span>${label}</span>
          ${start ? `<span class="activity-elapsed" data-elapsed-start="${start}">${fmtElapsed(Date.now() - start)}</span>` : ""}
        </div>
        <div class="spotify-now-row">
          <div class="activity-cover">
            ${large
              ? `<img class="spotify-now-cover" src="${esc(large)}" alt="${esc(act.assets.large_text || act.name)}" />`
              : `<span class="activity-cover-fallback">${isCode ? VSCODE_ICON : GAME_ICON}</span>`}
            ${small ? `<img class="activity-cover-badge" src="${esc(small)}" alt="" />` : ""}
          </div>
          <div class="spotify-now-info">
            <div class="spotify-now-title">${esc(title)}</div>
            ${lines.map((l) => `<div class="spotify-now-artist">${esc(l)}</div>`).join("")}
          </div>
        </div>
      </div>`;
  }

  function spotifyBlock(s) {
    return `
      <div class="activity-block">
        <div class="spotify-now-label">Ouvindo Spotify</div>
        <div class="spotify-now-row">
          <img class="spotify-now-cover" src="${esc(s.album_art_url)}" alt="${esc(s.album || s.song)}" />
          <div class="spotify-now-info">
            <div class="spotify-now-title">${esc(s.song)}</div>
            <div class="spotify-now-artist">${esc(s.artist)}</div>
          </div>
          <span class="spotify-now-icon">${SPOTIFY_ICON}</span>
        </div>
      </div>`;
  }

  // atualiza o "tempo decorrido" a cada segundo
  setInterval(() => {
    if (!activityEl) return;
    activityEl.querySelectorAll("[data-elapsed-start]").forEach((el) => {
      el.textContent = fmtElapsed(Date.now() - Number(el.getAttribute("data-elapsed-start")));
    });
  }, 1000);

  function applyActivity(data) {
    if (!activityEl || !CONFIG.showDiscordActivity) return;

    // atividade principal (editor/jogo) + Spotify, podendo aparecer as duas
    const blocks = [];
    if (Array.isArray(data.activities)) {
      const act = data.activities.find((a) => a.type === 0 && a.name);
      if (act) blocks.push(activityBlock(act));
    }
    if (data.listening_to_spotify && data.spotify) blocks.push(spotifyBlock(data.spotify));

    if (blocks.length) {
      activityEl.innerHTML = blocks.join("");
      activityEl.classList.add("visible");
    } else {
      activityEl.innerHTML = "";
      activityEl.classList.remove("visible");
    }
  }

  function handleData(data) {
    applyStatus(data.discord_status || "offline");
    applyAvatar(data.discord_user);
    applyBadges(data.discord_user);
    applyActivity(data);
  }

  if (!userId) {
    applyStatus("offline");
    return; // sem ID configurado, mantém offline estático
  }

  // 1) Busca inicial via REST para pintar algo imediatamente
  fetch(`https://api.lanyard.rest/v1/users/${userId}`)
    .then((r) => r.json())
    .then((res) => {
      if (res && res.success) handleData(res.data);
    })
    .catch(() => {});

  // 2) Conexão em tempo real via WebSocket
  let socket;
  let heartbeatInterval;

  function connect() {
    socket = new WebSocket("wss://api.lanyard.rest/socket");

    socket.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      switch (msg.op) {
        case 1: // Hello -> inicia heartbeat + subscribe
          if (msg.d && msg.d.heartbeat_interval) {
            heartbeatInterval = setInterval(() => {
              if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ op: 3 }));
              }
            }, msg.d.heartbeat_interval);
          }
          socket.send(
            JSON.stringify({ op: 2, d: { subscribe_to_id: userId } })
          );
          break;
        case 0: // Evento com dados de presença
          if (msg.t === "INIT_STATE" || msg.t === "PRESENCE_UPDATE") {
            handleData(msg.d);
          }
          break;
      }
    });

    socket.addEventListener("close", () => {
      clearInterval(heartbeatInterval);
      setTimeout(connect, 5000); // tenta reconectar
    });

    socket.addEventListener("error", () => socket.close());
  }

  connect();
})();
