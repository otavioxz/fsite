// ============================================================
// CONFIGURAÇÃO DO SITE — edite tudo aqui, não precisa mexer no resto
// ============================================================
const CONFIG = {
  // ---- Identidade ----
  name: "faike",
  username: "@f7qy",
  role: "DEV - BACKEND & QA TESTER",
  logoEmoji: "⚡",          // usado só se logoIcon abaixo estiver vazio
  logoIcon: "assets/icons/star.webp", // imagem do logo no canto superior esquerdo (tem prioridade sobre logoEmoji)
  verified: true,           // mostra o selinho azul ao lado do nome
  avatarFallback: "",       // URL de uma foto sua (opcional). Se vazio, usa iniciais.
                             // Se o Discord (abaixo) estiver conectado, o avatar do Discord tem prioridade.

  // ---- Discord (status ao vivo via Lanyard) ----
  // 1. Ative o "Modo desenvolvedor" no Discord (Config > Avançado)
  // 2. Clique com o botão direito no seu perfil > "Copiar ID do usuário"
  // 3. Entre no servidor do Lanyard para ativar o rastreamento: https://discord.gg/lanyard
  discord: {
    userId: "976215691059429417", // <- cole seu Discord User ID aqui (ex: "408002057522380801")
  },
  showDiscordActivity: true, // mostra "Jogando X" / "Ouvindo Y" embaixo do nome, se houver

  // ---- Redes sociais (rodapé) ----
  socials: {
    // deixe em branco "" para ocultar o ícone
    discord: "https://discord.com/users/976215691059429417", // link completo, ex: "https://discord.com/users/408002057522380801"
    twitter: "https://x.com/tavviio",
    github: "https://github.com/otavioxz",
  },

  // ---- Botão de link externo no card de perfil ----
  externalLinkUrl: "https://discord.com/users/976215691059429417",

  // ---- Hero / headline ----
  headline: [
    { text: "Criatividade.", muted: false },
    { text: "Engenharia.", muted: true },
    { text: "Experiência.", muted: false },
  ],
  subtitle: "Transformando ideias em aplicações web modernas, escaláveis e de alta performance.",
  primaryCta: { label: "Explorar", scrollTo: "#projetos" },
  secondaryCta: { label: "Saiba mais", scrollTo: "#sobre" },
  badgeIcons: ["⚡", "✦"], // ícones decorativos, usados só se nenhuma insígnia abaixo estiver ativa
  // Insígnias reais do Discord: Staff, HypeSquad, Bug Hunter, Active Developer
  // etc. aparecem sozinhas quando discord.userId está conectado. Nitro e
  // Server Booster não dá pra detectar pela API, então são manuais aqui:
  showNitroBadge: true,   // true se você tem Discord Nitro (usa assets/badge/nitro.png)
  showBoosterBadge: true, // true se você já impulsionou algum servidor (usa assets/badge/boost.png)

  // ---- Estatísticas ----
  stats: [
    { icon: "terminal", value: 3, suffix: "+", label: "Anos de Experiência" },
    { icon: "git-branch", value: 42, suffix: "+", label: "Projetos & Repos" },
    { icon: "cpu", value: 1200, suffix: "+", label: "Commits no Ano" },
    { icon: "activity", value: 99.9, suffix: "%", label: "Uptime de APIs" },
  ],

  // ---- Seção "Sobre" ----
  about: "Hi! I'm a Back-end Developer and QA Tester from Santa Catarina, Brazil, currently working at Magazord Digital Commerce. I work with Python, JavaScript and test automation, and I specialize in building bots and automations for Discord. I love learning new things and building projects that combine innovation and functionality.",
  skills: ["Python", "JavaScript", "Node.js", "Cypress", "MongoDB", "MySQL", "Postman", "Discord.js"],
  // Linha do tempo exibida ao lado do texto "Sobre". Adicione/edite à vontade.
  timeline: [
    { period: "Current", title: "Back-end & QA Tester", place: "Magazord Digital Commerce" },
    { period: "Personal projects", title: "Discord bots & automations", place: "Python · JavaScript" },
  ],

  // ---- Projetos (seção "Portfólio") ----
  // "image": opcional. Se preencher com uma URL/caminho de imagem, ela substitui
  // o ícone colorido com a sigla (initial). Deixe "" pra usar a sigla.
  projects: [
    {
      title: "Bot de Ticket com IA",
      description: "Realizei o desenvolvimento em JavaScript e utilizando a API do Grok, um bot de atendimento para servidores do Discord com IA respondendo o usuário até que algum responsável assuma o ticket.",
      tags: ["Discord.js", "Node.js", "Groq"],
      link: "https://github.com/otavioxz/sentinel-IA",
      color: "#6366f1",
      initial: "SI",
      image: "assets/image/ticketia.webp",
    },
    {
      title: "News API",
      description: "API REST para um app de notícias e blogs, com testes automatizados (Jest + Supertest), CI/CD via GitHub Actions e containerização com Docker.",
      tags: ["Express", "Docker", "CI/CD"],
      link: "https://github.com/otavioxz/news-api",
      color: "#3b82f6",
      initial: "NA",
      image: "assets/image/newsai.webp",
    },
    {
      title: "Bot Discord (Python)",
      description: "Bot multifuncional em Python com sistema de tickets, moderação (ban/mute/bloqueio de canal), XP e níveis, notificações de live e integração com Instagram, além de uma API própria em Flask para download de vídeos.",
      tags: ["Python", "Discord", "Flask"],
      link: "https://github.com/otavioxz/bot_discord.prototype",
      color: "#22b8f0",
      initial: "BD",
      image: "assets/image/botpy.webp",
    },
  ],

  // ---- Player de música (mockado, estilo Spotify) ----
  // "src" precisa apontar para um arquivo de áudio que você adiciona em assets/audio/
  // (o Spotify não deixa tocar a música em si, só os dados dela).
  //
  // "spotifyUrl": cole o link da faixa (ex: https://open.spotify.com/track/XXXXX)
  // e o site busca sozinho a CAPA e o TÍTULO pela API pública do Spotify.
  // Deixe "cover" e "title" em branco pra usar o que vier do Spotify, ou
  // preencha na mão pra sobrescrever. O ARTISTA não vem da API, sempre
  // precisa ser digitado manualmente em "artist".
  playerVolume: 0.15, // volume inicial do player, de 0 a 1 (0.15 = 15%)
  songs: [
    {
      title: "",
      artist: "Type O Negative",
      cover: "",
      // exemplo de formato válido (troque pelo link real da sua música):
      spotifyUrl: "https://open.spotify.com/intl-pt/track/4eGHEHqoDMMejzPhRFTc7p?si=036f41c74b64413d",
      src: "assets/audio/track1.mp3",
    },
    // para adicionar mais faixas, copie o bloco acima e aponte "src"
    // para um arquivo que exista em assets/audio/
  ],

  // ---- Rodapé ----
  footerName: "Faike",
};
