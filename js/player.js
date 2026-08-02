// ============================================================
// Player de música mockado (visual estilo Spotify, toca áudio real)
// Faixas configuradas em js/config.js -> CONFIG.songs
// ============================================================
(function () {
  const songs = (CONFIG.songs || []).filter((s) => s.src);
  if (songs.length === 0) return;

  const audio = new Audio();
  audio.volume = 0.35; // um pouco abaixo da metade

  let index = 0;
  let liked = new Set(JSON.parse(localStorage.getItem("likedSongs") || "[]"));

  const els = {
    cover: document.querySelector("[data-player-cover]"),
    coverImg: document.querySelector("[data-player-cover-img]"),
    title: document.querySelector("[data-player-title]"),
    artist: document.querySelector("[data-player-artist]"),
    heart: document.querySelector("[data-player-heart]"),
    current: document.querySelector("[data-player-current]"),
    duration: document.querySelector("[data-player-duration]"),
    progressInput: document.querySelector("[data-player-progress]"),
    progressFill: document.querySelector("[data-player-progress-fill]"),
    progressThumb: document.querySelector("[data-player-progress-thumb]"),
    playBtn: document.querySelector("[data-player-play]"),
    prevBtn: document.querySelector("[data-player-prev]"),
    nextBtn: document.querySelector("[data-player-next]"),
    volInput: document.querySelector("[data-player-volume]"),
    muteBtn: document.querySelector("[data-player-mute]"),
  };

  const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" fill="currentColor"></path></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"></rect><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"></rect></svg>';
  const ICON_VOL_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path><path d="M16 9a5 5 0 0 1 0 6"></path><path d="M19.364 18.364a9 9 0 0 0 0-12.728"></path></svg>';
  const ICON_VOL_MUTED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path><line x1="22" x2="16" y1="9" y2="15"></line><line x1="16" x2="22" y1="9" y2="15"></line></svg>';

  function fmt(t) {
    if (!isFinite(t) || t < 0) t = 0;
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  // Busca título + capa automaticamente via oEmbed do Spotify (sem chave/API key)
  // quando a faixa tem "spotifyUrl" configurado. Não retorna nome do artista,
  // por isso esse campo continua sendo preenchido manualmente no config.js.
  function resolveSpotifyMeta(song) {
    if (!song.spotifyUrl || song._resolved) return Promise.resolve(song);
    return fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(song.spotifyUrl)}`)
      .then((r) => r.json())
      .then((data) => {
        song.title = song.title || data.title;
        song.cover = song.cover || data.thumbnail_url;
        song._resolved = true;
        return song;
      })
      .catch(() => song);
  }

  function renderMeta(song) {
    if (els.title) els.title.textContent = song.title || "Carregando...";
    if (els.artist) els.artist.textContent = song.artist || "";
    if (els.coverImg) {
      if (song.cover) {
        els.coverImg.src = song.cover;
        els.coverImg.style.display = "block";
      } else {
        els.coverImg.style.display = "none";
      }
    }
  }

  function loadSong(i, autoplay) {
    index = (i + songs.length) % songs.length;
    const song = songs[index];
    audio.src = song.src;
    renderMeta(song);
    updateHeart();
    if (song.spotifyUrl && !song._resolved) {
      resolveSpotifyMeta(song).then((resolved) => {
        if (songs[index] === resolved) {
          renderMeta(resolved);
          updateHeart();
        }
      });
    }
    if (autoplay) audio.play().catch(() => {});
  }

  function updateHeart() {
    if (!els.heart) return;
    const isLiked = liked.has(songs[index].title);
    els.heart.classList.toggle("liked", isLiked);
  }

  function togglePlay() {
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  audio.addEventListener("play", () => {
    if (els.playBtn) els.playBtn.innerHTML = ICON_PAUSE;
  });
  audio.addEventListener("pause", () => {
    if (els.playBtn) els.playBtn.innerHTML = ICON_PLAY;
  });
  audio.addEventListener("ended", () => loadSong(index + 1, true));
  audio.addEventListener("volumechange", () => {
    if (els.muteBtn) els.muteBtn.innerHTML = audio.muted || audio.volume === 0 ? ICON_VOL_MUTED : ICON_VOL_ON;
  });
  audio.addEventListener("loadedmetadata", () => {
    if (els.duration) els.duration.textContent = fmt(audio.duration);
  });
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    if (els.progressFill) els.progressFill.style.width = pct + "%";
    if (els.progressThumb) els.progressThumb.style.left = `calc(${pct}% - 5px)`;
    if (els.progressInput) els.progressInput.value = pct;
    if (els.current) els.current.textContent = fmt(audio.currentTime);
  });

  if (els.playBtn) els.playBtn.addEventListener("click", togglePlay);
  if (els.nextBtn) els.nextBtn.addEventListener("click", () => loadSong(index + 1, !audio.paused));
  if (els.prevBtn) els.prevBtn.addEventListener("click", () => loadSong(index - 1, !audio.paused));

  if (els.progressInput) {
    els.progressInput.addEventListener("input", () => {
      if (!audio.duration) return;
      const pct = Number(els.progressInput.value);
      audio.currentTime = (pct / 100) * audio.duration;
    });
  }

  if (els.volInput) {
    els.volInput.addEventListener("input", () => {
      audio.volume = Number(els.volInput.value);
      if (audio.muted) audio.muted = false; // mexer no slider já desmuta
    });
  }

  if (els.muteBtn) {
    els.muteBtn.addEventListener("click", () => {
      audio.muted = !audio.muted;
    });
  }

  if (els.heart) {
    els.heart.addEventListener("click", () => {
      const title = songs[index].title;
      if (liked.has(title)) liked.delete(title);
      else liked.add(title);
      localStorage.setItem("likedSongs", JSON.stringify([...liked]));
      updateHeart();
    });
  }

  // Pré-busca os metadados das outras faixas em segundo plano, pra troca de
  // música ficar instantânea (sem esperar o fetch na hora de trocar)
  songs.forEach((song, i) => {
    if (i !== 0) resolveSpotifyMeta(song).catch(() => {});
  });

  loadSong(0, false);

  // Autoplay: todo navegador bloqueia áudio COM SOM antes de uma interação
  // do usuário na página — não tem como contornar isso, é política de
  // segurança do próprio browser. O que dá pra fazer (e é o padrão usado
  // por qualquer site com autoplay) é iniciar mudo, o que é sempre permitido.
  // O usuário liga o som clicando no ícone do autofalante ou no slider de volume.
  audio.muted = true;
  audio.play().catch(() => {}); // se nem mudo for permitido, fica pausado esperando o play manual

  // Assim que o usuário interagir com a página pela primeira vez (clique,
  // tecla ou toque), o som é ligado automaticamente — sem precisar que ele
  // ache o botão de mute do player.
  function unmuteOnFirstInteraction() {
    audio.muted = false;
    if (audio.paused) audio.play().catch(() => {});
    window.removeEventListener("click", unmuteOnFirstInteraction);
    window.removeEventListener("keydown", unmuteOnFirstInteraction);
    window.removeEventListener("touchstart", unmuteOnFirstInteraction);
  }
  window.addEventListener("click", unmuteOnFirstInteraction, { once: true });
  window.addEventListener("keydown", unmuteOnFirstInteraction, { once: true });
  window.addEventListener("touchstart", unmuteOnFirstInteraction, { once: true });
})();
