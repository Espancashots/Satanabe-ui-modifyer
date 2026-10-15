# Atualizando o editor no GitHub pelo iPhone

1. Abra o ZIP do editor e descompacte no Arquivos.
2. Envie os arquivos descompactados ao repositório do site `satanabe-ui-studio`. Mantenha `api/` e `assets/` como pastas. Não envie a pasta do código-fonte iOS do External ao repositório do site.
3. Faça o commit. A Vercel conectada deve gerar um novo deployment automaticamente.
4. Abra o URL do site no Safari e recarregue. Se houver cache antigo, feche/reabra o site adicionado à tela inicial.
5. No editor, abra a base **External 2.0.7**. Se já tinha um projeto salvo, exporte seu JSON antes de substituir.
6. Personalize Rankeada, Apostado, Skins, Perfil e os estilos visuais. Os patches listados na prévia são exemplos, não dados reais da API.
7. Exporte `SatanabeUITheme.json` e substitua o correspondente na raiz `ThreeOneOSFive/` do repositório do aplicativo iOS.
8. Execute o workflow do repositório do External para criar uma IPA sem assinatura. Para instalar, ela precisa ser assinada no seu ambiente.

OBS: A edição manual independe da IA; seu token Groq deve ficar apenas na Vercel.
