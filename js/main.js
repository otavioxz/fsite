// ============================================================
// Lógica geral: tema, animações de entrada, navegação, stats,
// e geração das seções de Projetos/Sobre a partir do config.js
// ============================================================
(function () {
  // ---------- Tilt 3D no card de perfil (segue o cursor) ----------
  const tiltZone = document.querySelector(".hero-card-perspective");
  const tiltCard = document.querySelector(".glow-wrap");
  if (tiltZone && tiltCard) {
    const MAX_TILT = 10; // graus, pra cada eixo
    tiltZone.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      const rect = tiltZone.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * MAX_TILT * 2;
      const rotateX = (0.5 - py) * MAX_TILT * 2;
      tiltCard.style.transition = "transform .06s linear";
      tiltCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
    });
    tiltZone.addEventListener("pointerleave", () => {
      tiltCard.style.transition = "transform .5s cubic-bezier(0.22, 1, 0.36, 1)";
      tiltCard.style.transform = "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    });
  }

  // ---------- Tema (dark/light) ----------
  const root = document.documentElement;
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.setAttribute("data-theme", saved || (prefersDark ? "dark" : "light"));

  const themeBtn = document.querySelector("[data-theme-toggle]");
  function renderThemeIcon() {
    const isDark = root.getAttribute("data-theme") === "dark";
    themeBtn.innerHTML = isDark
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"></path></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>';
  }
  if (themeBtn) {
    renderThemeIcon();
    themeBtn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      renderThemeIcon();
    });
  }

  // ---------- Logo do cabeçalho (imagem se CONFIG.logoIcon estiver setado, senão emoji) ----------
  const brandMark = document.querySelector("[data-brand-mark]");
  if (brandMark) {
    if (CONFIG.logoIcon) {
      const img = document.createElement("img");
      img.src = CONFIG.logoIcon;
      img.alt = "Logo";
      brandMark.appendChild(img);
    } else {
      brandMark.textContent = CONFIG.logoEmoji || "";
    }
  }

  // ---------- Preenche textos/links vindos do config ----------
  document.querySelectorAll("[data-cfg]").forEach((el) => {
    const val = CONFIG[el.getAttribute("data-cfg")];
    if (val !== undefined) el.textContent = val;
  });
  document.querySelectorAll("[data-cfg-href]").forEach((el) => {
    const path = el.getAttribute("data-cfg-href").split(".");
    let val = CONFIG;
    path.forEach((k) => (val = val ? val[k] : undefined));
    if (val) {
      el.href = val;
      el.style.display = "";
    } else {
      el.style.display = "none";
    }
  });

  const verifiedBadge = document.querySelector("[data-verified]");
  if (verifiedBadge) verifiedBadge.style.display = CONFIG.verified ? "" : "none";

  const avatarInitials = document.querySelector("[data-avatar-initials]");
  const avatarImg = document.querySelector("[data-avatar-img]");
  if (avatarInitials) {
    avatarInitials.textContent = (CONFIG.name || "?").trim().charAt(0).toUpperCase();
  }
  if (CONFIG.avatarFallback && avatarImg) {
    avatarImg.src = CONFIG.avatarFallback;
    avatarImg.style.display = "block";
    if (avatarInitials) avatarInitials.style.display = "none";
  }

  // ---------- Headline com animação letra a letra ----------
  const headlineEl = document.querySelector("[data-headline]");
  if (headlineEl) {
    let globalIndex = 0;
    CONFIG.headline.forEach((line) => {
      const lineEl = document.createElement("span");
      lineEl.className = "headline-line" + (line.muted ? " muted" : "");
      [...line.text].forEach((ch) => {
        const span = document.createElement("span");
        span.className = "letter";
        span.style.setProperty("--i", globalIndex++);
        span.textContent = ch === " " ? " " : ch;
        lineEl.appendChild(span);
      });
      headlineEl.appendChild(lineEl);
    });
  }

  const subtitleEl = document.querySelector("[data-subtitle]");
  if (subtitleEl) {
    const words = CONFIG.subtitle.split(" ");
    words.forEach((w, i) => {
      const span = document.createElement("span");
      span.className = "word";
      span.style.setProperty("--i", i);
      span.textContent = w;
      subtitleEl.appendChild(span);
    });
  }

  // ---------- CTAs ----------
  const primaryCta = document.querySelector("[data-primary-cta]");
  if (primaryCta) {
    primaryCta.querySelector("span").textContent = CONFIG.primaryCta.label;
    primaryCta.addEventListener("click", () => scrollToSel(CONFIG.primaryCta.scrollTo));
  }
  const secondaryCta = document.querySelector("[data-secondary-cta]");
  if (secondaryCta) {
    secondaryCta.querySelector("span").textContent = CONFIG.secondaryCta.label;
    secondaryCta.addEventListener("click", () => scrollToSel(CONFIG.secondaryCta.scrollTo));
  }
  function scrollToSel(sel) {
    const target = document.querySelector(sel);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  }

  // ---------- Badges do card de perfil ----------
  // Combina: badges manuais (Nitro/Booster, ligados via config) + badges reais
  // do Discord (public_flags, injetados pelo lanyard.js quando disponíveis).
  // Se nada estiver ativo, cai nos ícones decorativos de CONFIG.badgeIcons.
  const badgeWrap = document.querySelector("[data-badge-icons]");
  function manualBadges() {
    const list = [];
    if (CONFIG.showNitroBadge) list.push({ name: "Discord Nitro", img: "assets/badge/nitro.png" });
    if (CONFIG.showBoosterBadge) list.push({ name: "Server Booster", img: "assets/badge/boost.png" });
    return list;
  }
  function renderBadges(apiBadges) {
    if (!badgeWrap) return;
    const combined = [...manualBadges(), ...(apiBadges || [])];
    badgeWrap.innerHTML = "";
    if (combined.length === 0) {
      (CONFIG.badgeIcons || []).forEach((icon) => {
        const el = document.createElement("span");
        el.className = "mini-badge";
        el.textContent = icon;
        badgeWrap.appendChild(el);
      });
      return;
    }
    combined.forEach((b) => {
      const img = document.createElement("img");
      img.className = "mini-badge";
      img.src = b.img;
      img.alt = b.name;
      img.title = b.name;
      badgeWrap.appendChild(img);
    });
  }
  window.renderProfileBadges = renderBadges;
  renderBadges([]);

  // ---------- Stats com contagem animada ----------
  const ICONS = {
    terminal: '<path d="M12 19h8"></path><path d="m4 17 6-6-6-6"></path>',
    "git-branch": '<path d="M15 6a9 9 0 0 0-9 9V3"></path><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle>',
    cpu: '<path d="M12 20v2"></path><path d="M12 2v2"></path><path d="M17 20v2"></path><path d="M17 2v2"></path><path d="M2 12h2"></path><path d="M2 17h2"></path><path d="M2 7h2"></path><path d="M20 12h2"></path><path d="M20 17h2"></path><path d="M20 7h2"></path><path d="M7 20v2"></path><path d="M7 2v2"></path><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="8" y="8" width="8" height="8" rx="1"></rect>',
    activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path>',
  };
  const statsBar = document.querySelector("[data-stats]");
  if (statsBar) {
    CONFIG.stats.forEach((stat) => {
      const item = document.createElement("div");
      item.className = "stat-item";
      item.innerHTML = `
        <div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[stat.icon] || ""}</svg></div>
        <div>
          <div class="stat-value" data-target="${stat.value}" data-suffix="${stat.suffix || ""}">0</div>
          <div class="stat-label">${stat.label}</div>
        </div>`;
      statsBar.appendChild(item);
    });

    setTimeout(() => {
      statsBar.querySelectorAll(".stat-value").forEach((el) => {
        const target = parseFloat(el.getAttribute("data-target"));
        const suffix = el.getAttribute("data-suffix");
        const isDecimal = target % 1 !== 0;
        const duration = 1200;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = target * eased;
          el.textContent = (isDecimal ? value.toFixed(1) : Math.floor(value)) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, 500);
  }

  // ---------- Projetos ----------
  const projectsGrid = document.querySelector("[data-projects]");
  if (projectsGrid) {
    CONFIG.projects.forEach((p) => {
      const card = document.createElement("a");
      card.className = "project-card reveal";
      card.href = p.link || "#";
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      const thumb = p.image
        ? `<div class="project-thumb project-thumb-img"><img src="${p.image}" alt="${p.title}" /></div>`
        : `<div class="project-thumb" style="background:${p.color || "#3b82f6"}">${p.initial || p.title.charAt(0)}</div>`;
      card.innerHTML = `
        ${thumb}
        <div class="project-title">${p.title}</div>
        <div class="project-desc">${p.description}</div>
        <div class="project-tags">${(p.tags || []).map((t) => `<span class="tag">${t}</span>`).join("")}</div>
        <div class="project-link-arrow"><span>Ver projeto</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></div>
      `;
      projectsGrid.appendChild(card);
    });
  }

  // ---------- Sobre ----------
  const aboutText = document.querySelector("[data-about-text]");
  if (aboutText) aboutText.textContent = CONFIG.about;
  const skillsWrap = document.querySelector("[data-skills]");
  if (skillsWrap) {
    CONFIG.skills.forEach((s) => {
      const chip = document.createElement("span");
      chip.className = "skill-chip";
      chip.textContent = s;
      skillsWrap.appendChild(chip);
    });
  }

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => io.observe(el));
  // observa também os cards de projeto criados dinamicamente
  setTimeout(() => {
    document.querySelectorAll(".project-card.reveal:not(.in-view)").forEach((el) => io.observe(el));
  }, 0);

  // ---------- Navegação inferior (scroll spy + smooth scroll) ----------
  const navButtons = document.querySelectorAll("[data-nav-target]");
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => scrollToSel(btn.getAttribute("data-nav-target")));
  });
  const sections = [...navButtons]
    .map((b) => document.querySelector(b.getAttribute("data-nav-target")))
    .filter(Boolean);
  // Detecta qual seção está "sob" uma linha horizontal no meio da tela.
  // threshold:0 + rootMargin colapsado numa linha funciona pra seções de
  // qualquer altura (diferente de exigir X% da seção visível, que falha
  // quando a seção é maior que a própria tela).
  const navIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = "#" + entry.target.id;
          navButtons.forEach((b) => b.classList.toggle("active", b.getAttribute("data-nav-target") === id));
        }
      });
    },
    { threshold: 0, rootMargin: "-50% 0px -50% 0px" }
  );
  sections.forEach((s) => navIO.observe(s));

  // ---------- Ano do rodapé ----------
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
