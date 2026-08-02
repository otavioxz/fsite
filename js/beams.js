// ============================================================
// Feixes de luz diagonais animados, via WebGL2 nativo (sem libs).
// — aqui é implementado direto contra a API do
// WebGL, sem baixar uma engine 3D inteira só pra desenhar um shader
// full-screen. Roda em resolução reduzida e a ~30fps, já que o
// efeito é lento e não precisa de mais que isso.
// ============================================================
(function () {
  const canvas = document.querySelector("[data-beams-canvas]");
  if (!canvas) return;

  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return; // navegador sem WebGL2: site segue normal sem o efeito

  const VERTEX_SRC = `#version 300 es
    void main() {
      vec2 pos = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
      gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
    }
  `;

  const FRAGMENT_SRC = `#version 300 es
    precision mediump float;
    out vec4 fragColor;
    uniform float uTime;
    uniform vec2 uResolution;

    // distância de um ponto até uma linha diagonal (rotacionada em torno de "origin"),
    // com perfil gaussiano suave, modulada por um brilho pseudoaleatório e recorrente no tempo
    float beam(vec2 uv, vec2 origin, float angle, float width, float seed) {
      vec2 p = uv - origin;
      float c = cos(angle);
      float s = sin(angle);
      vec2 pr = vec2(p.x * c - p.y * s, p.x * s + p.y * c);
      float d = pr.x / width;
      float line = exp(-d * d * 2.2);
      float flicker = 0.5 + 0.5 * sin(uTime * (0.22 + seed * 0.14) + seed * 12.9898);
      flicker = pow(flicker, 2.0);
      flicker = mix(0.25, 1.0, flicker); // nunca some de vez, só varia entre fraco e forte
      return line * flicker;
    }

    void main() {
      float aspect = uResolution.x / uResolution.y;
      vec2 uv = gl_FragCoord.xy / uResolution;
      uv.x *= aspect;
      float ar = aspect;

      float total = 0.0;
      total += beam(uv, vec2(ar * 0.85, 0.92), radians(-30.0), 0.07, 1.0);
      total += beam(uv, vec2(ar * 1.05, 0.55), radians(-34.0), 0.11, 2.4);
      total += beam(uv, vec2(ar * 0.65, 0.15), radians(-28.0), 0.05, 3.7);
      total += beam(uv, vec2(ar * 1.30, 0.30), radians(-36.0), 0.08, 0.6);
      total += beam(uv, vec2(ar * 0.40, 0.60), radians(-32.0), 0.06, 5.1);
      total += beam(uv, vec2(ar * 1.15, 0.05), radians(-26.0), 0.09, 6.8);
      total += beam(uv, vec2(ar * 0.20, 0.95), radians(-38.0), 0.05, 8.3);
      total = clamp(total, 0.0, 1.0);

      fragColor = vec4(vec3(1.0), total * 0.42);
    }
  `;

  function compile(type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = compile(gl.VERTEX_SHADER, VERTEX_SRC);
  const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SRC);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  const uTimeLoc = gl.getUniformLocation(program, "uTime");
  const uResolutionLoc = gl.getUniformLocation(program, "uResolution");

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // renderiza numa resolução menor que a tela e deixa o CSS esticar o
  // canvas — o efeito é borrado por natureza, então a perda de nitidez
  // é imperceptível e a economia de processamento é grande
  const RENDER_SCALE = 0.6;
  function resize() {
    const w = Math.max(1, Math.floor(window.innerWidth * RENDER_SCALE));
    const h = Math.max(1, Math.floor(window.innerHeight * RENDER_SCALE));
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uResolutionLoc, w, h);
  }
  window.addEventListener("resize", resize);
  resize();

  const FRAME_INTERVAL = 1000 / 30; // limita a ~30fps
  const start = performance.now();
  let lastFrame = 0;
  let rafId = null;

  function frame(now) {
    if (now - lastFrame >= FRAME_INTERVAL) {
      lastFrame = now;
      gl.uniform1f(uTimeLoc, (now - start) / 1000);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    rafId = requestAnimationFrame(frame);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!rafId) {
      rafId = requestAnimationFrame(frame);
    }
  });

  rafId = requestAnimationFrame(frame);
})();
