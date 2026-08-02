// Gera a versão de produção em dist/: JS bundlado + minificado/ofuscado,
// CSS minificado, assets copiados. É isso que a Vercel serve pro
// visitante (veja outputDirectory em vercel.json) — os fontes legíveis
// em js/ e css/ nunca são publicados.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const esbuild = require("esbuild");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const JS_ORDER = [
  "config.js",
  "main.js",
  "lanyard.js",
  "player.js",
  "beams.js",
  "visitor-log.js",
];

function hashOf(content) {
  return crypto.createHash("md5").update(content).digest("hex").slice(0, 8);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

// JS: concatena na ordem de carregamento original e minifica/ofusca tudo
// junto (mesmo escopo global, então os nomes internos batem certinho).
const jsSource = JS_ORDER.map((f) =>
  fs.readFileSync(path.join(ROOT, "js", f), "utf8")
).join("\n;\n");

const jsOut = esbuild.transformSync(jsSource, {
  loader: "js",
  minify: true,
  legalComments: "none",
  target: "es2018",
});

const jsHash = hashOf(jsOut.code);
fs.mkdirSync(path.join(DIST, "js"), { recursive: true });
fs.writeFileSync(path.join(DIST, "js", "app.min.js"), jsOut.code);

// CSS
const cssSource = fs.readFileSync(path.join(ROOT, "css", "style.css"), "utf8");
const cssOut = esbuild.transformSync(cssSource, {
  loader: "css",
  minify: true,
  legalComments: "none",
});
const cssHash = hashOf(cssOut.code);
fs.mkdirSync(path.join(DIST, "css"), { recursive: true });
fs.writeFileSync(path.join(DIST, "css", "style.min.css"), cssOut.code);

// assets/ copiados como estão (imagens/áudio não têm código pra esconder)
copyDir(path.join(ROOT, "assets"), path.join(DIST, "assets"));

// index.html: aponta pros arquivos gerados acima
let html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
html = html.replace(
  /<link rel="stylesheet" href="css\/style\.css(\?v=\d+)?" \/>/,
  `<link rel="stylesheet" href="css/style.min.css?v=${cssHash}" />`
);
html = html.replace(
  /\s*<script src="js\/[a-z-]+\.js(\?v=\d+)?"><\/script>\n?/g,
  ""
);
html = html.replace(
  "</body>",
  `  <script src="js/app.min.js?v=${jsHash}"></script>\n</body>`
);
// remove comentários HTML (<!-- Header -->, <!-- Hero -->, ...) — não
// tem código/lógica escondida neles, mas não precisam ir pro ar
html = html.replace(/<!--[\s\S]*?-->/g, "");
fs.writeFileSync(path.join(DIST, "index.html"), html);

console.log(`build ok: js=${jsOut.code.length}B (hash ${jsHash}), css=${cssOut.code.length}B (hash ${cssHash})`);
