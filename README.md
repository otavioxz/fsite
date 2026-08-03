# Portfólio

Site estático:
hero animado, card de perfil com status do Discord em tempo real,
barra de estatísticas, seção de projetos, seção sobre e um player de
música flutuante estilo Spotify.

Os fontes (`js/*.js`, `css/style.css`) ficam legíveis pra facilitar
edição, mas **não são publicados como estão** — o passo de build
(veja "Publicar") gera uma versão bundlada/minificada em `dist/`, que
é o que a hospedagem realmente serve. Isso evita que qualquer
visitante veja o código-fonte organizado na aba Sources do DevTools.

## Como editar

Praticamente tudo (nome, textos, links, projetos, músicas, stats)
fica em **`js/config.js`**. Abra o arquivo e edite os valores — o
resto do site se atualiza sozinho.

## Ativar o status do Discord em tempo real

1. No Discord, ative "Modo desenvolvedor" em Configurações > Avançado.
2. Clique com o botão direito no seu perfil > "Copiar ID do usuário".
3. Entre no servidor do Lanyard para ativar o rastreamento:
   https://discord.gg/lanyard
4. Cole seu ID em `js/config.js` -> `CONFIG.discord.userId`.

Sem isso o indicador de status fica sempre "Offline" (não quebra o
site, só não mostra dado real).

## Adicionar músicas ao player

1. Coloque seus arquivos `.mp3` em `assets/audio/` (veja o README lá
   dentro).
2. Edite `CONFIG.songs` em `js/config.js` com título, artista, capa
   (opcional) e o caminho do arquivo.

## Rodar localmente (edição)

Pra editar e ver o resultado na hora, não precisa de build. Basta
abrir `index.html` no navegador, ou servir a pasta com qualquer
servidor estático, por exemplo:

```
npx serve .
```

Isso serve os fontes originais (sem minificar) — bom pra desenvolver,
mas não é o que deve ir pro ar em produção (veja "Publicar" abaixo).

## Build de produção (esconder os fontes)

```
npm install
npm run build
```

Gera `dist/`: um `js/app.min.js` único (todo o JS bundlado, minificado
e com nomes de variáveis ofuscados), `css/style.min.css` minificado,
`index.html` ajustado pra apontar pros dois, e os `assets/` copiados.
Quem visitar o site em produção só recebe o conteúdo de `dist/` — os
arquivos originais em `js/` e `css/` nunca são publicados nem
aparecem na aba Sources do navegador.

Importante: isso só dificulta a leitura (ofuscação), não impede
100% — qualquer JS/CSS enviado ao navegador pode ser inspecionado por
quem realmente quiser. Não é possível "esconder" código que o próprio
navegador precisa baixar pra rodar a página.

## Publicar

O projeto já vem com `vercel.json` configurado (`buildCommand: npm
run build`, `outputDirectory: dist`) — na Vercel, basta importar o
repositório e o deploy já publica só a versão minificada de `dist/`.
A função serverless em `api/log-visit.js` continua funcionando normal
(a Vercel detecta `/api` na raiz do projeto independente do
`outputDirectory`).

Pra outras hospedagens estáticas (Netlify, Cloudflare Pages, GitHub
Pages), rode `npm run build` e suba o conteúdo da pasta `dist/`
(não a raiz do projeto).

## Log de acessos (quem visita o site)

O site manda um "beacon" a cada carregamento de página pra
`api/log-visit.js` (função serverless da Vercel), que repassa os
dados pro Discord via webhook. Informações coletadas: IP, país/
região/cidade aproximados (geo-IP da Vercel), user-agent, referrer,
página acessada, idioma, timezone, resolução de tela, plataforma,
núcleos de CPU, RAM aproximada e tipo de conexão.

Pra ativar:

1. No Discord, crie um webhook: Configurações do canal > Integrações
   > Webhooks > Novo Webhook. Copie a URL.
2. No painel da Vercel: Project Settings > Environment Variables >
   adicione `DISCORD_WEBHOOK_URL` com a URL copiada. **Nunca** coloque
   essa URL direto no código/repositório.
3. Faça o deploy (ou redeploy, se a env var foi adicionada depois).

Sem a env var configurada, a função simplesmente não faz nada (não
quebra o site). Local (`npx serve .` ou abrindo o `index.html`
direto) também não faz nada, já que não existe função serverless
rodando — só funciona depois de hospedado na Vercel.

**Atenção (privacidade/LGPD):** isso coleta dados pessoais (IP,
localização aproximada) de quem visita o site. Se for um projeto
público, considere avisar isso em algum lugar (ex. rodapé/aviso de
privacidade).
