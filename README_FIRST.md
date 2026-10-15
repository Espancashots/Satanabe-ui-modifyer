# SATANABE UI STUDIO · Base External 2.0.7

Este ZIP é o **site editor** para o repositório `satanabe-ui-studio` no GitHub e publicação na Vercel.

## Depois de atualizar o site

1. Abra seu endereço `.vercel.app` no Safari.
2. Se ainda aparecer o projeto antigo salvo no iPhone, toque em **↺ Base 2.0.7** (isso substitui o projeto aberto; faça backup em JSON antes se necessário).
3. Escolha **Rankeada**, **Apostado**, **Skins** ou **Perfil**. No External real, os patches dessas abas são carregados da API/Admin; no editor são apenas exemplos de layout.
4. Edite as propriedades pelo toque. O painel Aparência permite controlar também medidas reais dos componentes SwiftUI.
5. Em **Exportar > Tema External 2.0.7**, baixe `SatanabeUITheme.json`.
6. Use o ZIP separado `Satanabe-External-2.0.7-UI-Studio-Pronto.zip`, que contém o **código-fonte do aplicativo** preparado para ler o tema.
7. Substitua `ThreeOneOSFive/SatanabeUITheme.json` no projeto iOS e gere a IPA usando Xcode ou o workflow de build do repositório do External (a IPA gerada é unsigned).

## O que modifica de verdade no External

Cores, título, largura da barra lateral, altura e arredondamento de abas, fontes, cantos, bordas e espaçamento dos cartões, além da cor de fundo e texto de categorias, individualmente onde disponível.

## Limites

A ferramenta NÃO atualiza uma IPA já instalada e não transfere automaticamente coordenadas livres, elementos novos e imagens do canvas ao SwiftUI original. A prévia do canvas é uma simulação dos componentes. O app real mantém a navegação, keys, API, nomes e estados de patches originais. A aba do código-fonte chamava-se “Skin”; a apresentação visual foi ajustada para “Skins”, mas o identificador de categoria continua `skin`.

A IA Groq é opcional, requer configuração segura da API na Vercel e não é necessária para edição manual.
