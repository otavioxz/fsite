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

  function applyActivity(data) {
    if (!activityEl || !CONFIG.showDiscordActivity) return;

    if (data.listening_to_spotify && data.spotify) {
      const s = data.spotify;
      activityEl.innerHTML = `
        <div class="spotify-now-label">Ouvindo Spotify</div>
        <div class="spotify-now-row">
          <img class="spotify-now-cover" src="${s.album_art_url}" alt="${s.album || s.song}" />
          <div class="spotify-now-info">
            <div class="spotify-now-title">${s.song}</div>
            <div class="spotify-now-artist">${s.artist}</div>
          </div>
          <span class="spotify-now-icon">${SPOTIFY_ICON}</span>
        </div>`;
      activityEl.classList.add("visible");
      return;
    }

    let text = "";
    if (Array.isArray(data.activities)) {
      const act = data.activities.find((a) => a.type === 0 && a.name);
      if (act) text = `🎮 Jogando ${act.name}`;
    }
    if (text) {
      activityEl.textContent = text;
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
