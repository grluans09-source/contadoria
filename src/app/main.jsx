/* Ponto de entrada do build (ver package.json → "build"). Só reexporta
   App: quem monta o React é o próprio dist/index.html, porque é lá que
   mora o tratamento de erro de boot e a remoção da tela de carregamento
   — mesmo padrão de C:\Users\LUAN S\OneDrive\Documentos\sistema
   financeio, dist/index.html (12/ago/2026). */
export { default } from "./App.jsx";
