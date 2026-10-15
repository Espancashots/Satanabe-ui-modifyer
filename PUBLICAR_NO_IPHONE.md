# Publicar Satanabe UI Studio só pelo iPhone

## Parte 1 — GitHub

1. Baixe `Satanabe-UI-Studio-GitHub-Vercel.zip` no ChatGPT.
2. Abra **Arquivos → Downloads** e toque no ZIP para extrair.
3. Entre em https://github.com/new no Safari e crie o repositório `satanabe-ui-studio` (prefira **Private**). Não selecione README automático — o projeto já contém um.
4. Dentro do repositório, use **Add file → Upload files**. Envie o conteúdo da pasta extraída, mantendo os nomes e caminhos.
5. Confira que o `index.html` aparece na raiz do GitHub. Confira também os arquivos `api/assist.js` e `assets/icon.svg` nas suas pastas. Sem isso a IA e os ícones não funcionarão corretamente.

**Limitação do GitHub no iPhone:** o seletor de arquivos do iOS pode não permitir enviar uma pasta inteira pelo formulário web. Se acontecer, abra o GitHub no modo desktop ou use GitHub Codespaces; não envie o ZIP fechado esperando que o GitHub o descompacte automaticamente.

## Parte 2 — Vercel

1. Abra https://vercel.com/new no Safari e faça login com o GitHub.
2. Selecione **Import Git Repository** e escolha `satanabe-ui-studio`. Autorize o repositório se necessário.
3. Em Configure Project, mantenha **Framework Preset: Other**, **Root Directory: `./`** e configurações padrão de build (nenhum comando de build).
4. Toque em **Deploy** e abra a URL de produção indicada após a publicação.
5. No Safari, use Compartilhar → **Adicionar à Tela de Início**.

## Parte 3 — IA opcional

1. Crie sua chave na sua conta Groq. Nunca publique a chave em um arquivo.
2. No projeto Vercel vá a **Settings → Environment Variables**.
3. Adicione `GROQ_API_KEY` com a chave e `STUDIO_AI_ACCESS_CODE` com um código longo e privado.
4. Opcionalmente adicione `GROQ_MODEL` se precisar escolher outro modelo suportado.
5. Faça **Redeploy** da implantação, abra o editor, selecione um componente e use a aba **IA**. Digite o código de acesso (não a chave) e peça uma sugestão.

## Atualizações

Toda vez que alterar os arquivos no GitHub, uma Vercel conectada pode publicar a mudança automaticamente. Os projetos editados ficam localmente no navegador: use **Exportar → Projeto .json** periodicamente para não perdê-los.

## Limitações

Este editor **não edita diretamente a IPA**, não abre a UI interna já compilada e não altera sozinho as funções do External. Ele exporta SwiftUI para ser integrado ao projeto de aplicativo. A URL pode ficar acessível publicamente mesmo com repositório privado. Planos gratuitos e limites de uso dependem dos provedores; a Vercel Hobby é voltada a uso pessoal não comercial.


## IMPORTANTE — HTML dentro do aplicativo Arquivos do iPhone

O Quick Look / visualizador de anexos pode **bloquear o JavaScript**. Nesse caso, o editor parece vazio (sem textos, botões e camadas) e o telefone ocupa a tela inteira. **Não é um teste confiável do site**. Para testar as funções reais: publique a pasta na Vercel e abra o endereço `https://...vercel.app` no Safari.

O site v1.1 ajusta o tamanho da maquete de iPhone usando o tamanho disponível do canvas e recalcula após mudanças de orientação e barras de navegação. Use o botão **⤢** para voltar ao enquadramento depois de ampliar.
