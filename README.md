# Portfólio

Site estático (HTML/CSS/JS puro, sem build) inspirado no layout de
guihzzy.pw: hero animado, card de perfil com status do Discord em
tempo real, barra de estatísticas, seção de projetos, seção sobre e
um player de música flutuante estilo Spotify.

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

## Rodar localmente

Não precisa de build. Basta abrir `index.html` no navegador, ou
servir a pasta com qualquer servidor estático, por exemplo:

```
npx serve .
```

## Publicar

Funciona em qualquer hospedagem de site estático: Vercel, Netlify,
GitHub Pages, Cloudflare Pages — basta subir a pasta inteira.

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
