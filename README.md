# SATANABE UI STUDIO — External 2.0.7

Editor de UI touchscreen para Safari, com prévia de Rankeada, Apostado, Skins e Perfil, camadas, galeria local, propriedades visuais, desfazer/refazer, temas, exportação JSON/SwiftUI, integração visual nativa via tema JSON e IA Groq opcional.

**Publicação:** envie o conteúdo deste diretório (não o ZIP fechado) à raiz de seu repositório GitHub. Conecte à Vercel; Framework **Other**, diretório raiz `./` e sem build command. A Vercel lê `vercel.json` e `/api/assist.js`.

**Operação:** importe/edite seu projeto visual. No menu Exportar selecione **Tema External 2.0.7**, baixe `SatanabeUITheme.json` e substitua o arquivo homônimo no código-fonte do External adaptado. O Xcode compila as alterações visuais no app. A prévia mostra patches fictícios e não requisita seus arquivos do Admin.

**Limites:** propriedades do layout livre que não estejam mapeadas no tema permanecem apenas na prévia. O código-fonte iOS preparado está em pacote separado. Não há modificação da IPA instalada. Não há conexão automática entre os dois repositórios. Não coloque a `GROQ_API_KEY` no GitHub; use variáveis de ambiente da Vercel e configure `STUDIO_AI_ACCESS_CODE` antes de ativar a IA.
