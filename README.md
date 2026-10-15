# Satanabe UI Studio

Editor visual touchscreen em português para desenhar e personalizar interfaces destinadas ao **Satanabe External iOS**, baseado na estrutura SwiftUI do 3105.

**Não há dependências npm.** O site é servido diretamente com HTML, CSS e JavaScript; `/api/assist` é uma função serverless opcional da Vercel para sugestões de IA Groq.

## Funcionalidades

- Seleção, arraste e redimensionamento de componentes pelo toque.
- Camadas, telas, duplicação, visibilidade, propriedades visuais, temas, galeria e prévia.
- Salvamento local, importação/exportação JSON, exportação SwiftUI e ZIP com recursos.
- Importação manual do `DesignSystem.swift` do 3105 para alterar algumas constantes de tema.
- IA opcional com confirmação antes de aplicar alterações; segredos ficam no servidor.
- Atalho de instalação no iPhone via Safari (PWA).

## Estrutura

```
index.html             interface
app.js                 editor visual e exportação
style.css              estilos responsivos
api/assist.js          endpoint Groq (opcional)
assets/                ícones do site
manifest.webmanifest   PWA
sw.js                  cache offline dos arquivos estáticos
vercel.json            configuração Vercel
README_FIRST.md        guia curto
PUBLICAR_NO_IPHONE.md  passo a passo para o iPhone
```

## Deploy

1. Envie todos esses arquivos **na raiz** de um repositório GitHub; não envie o ZIP sem extrair.
2. Importe o repositório no site da Vercel, com Framework **Other** e Root Directory `./`.
3. Faça Deploy e abra a URL fornecida pela Vercel.
4. Para ativar IA, configure `GROQ_API_KEY` e `STUDIO_AI_ACCESS_CODE` como *Environment Variables* na Vercel e faça Redeploy.

Veja `PUBLICAR_NO_IPHONE.md` para orientações detalhadas.

## Como exportar para iOS

O editor salva um projeto `.studio.json` editável e gera uma interface `SatanabeGeneratedUI.swift`. Ela precisa ser adicionada ao código-fonte Xcode do Satanabe External e ter as ações de botões e switches vinculadas ao código original. O editor não injeta UI em um app compilado nem cria IPA; a versão final requer compilação e assinatura iOS.

## Privacidade e segurança

- Edição manual e galeria usam armazenamento local no dispositivo; a publicação não inclui suas imagens pessoais.
- A IA envia uma instrução e propriedades do elemento selecionado à API do projeto e à Groq somente quando você pede sugestão.
- Não armazene sua chave Groq no GitHub. `STUDIO_AI_ACCESS_CODE` protege a rota de IA, mas não impede o acesso público ao site.
- A URL Vercel pode ser pública mesmo que o repositório GitHub seja privado. Configure proteção adicional se necessário.
- O cache offline melhora disponibilidade, mas não substitui o arquivo de backup JSON.

## Desenvolvimento local

```bash
python3 -m http.server 8080
```

Abra `http://localhost:8080`. A API Groq funciona somente em servidor com as variáveis configuradas.
