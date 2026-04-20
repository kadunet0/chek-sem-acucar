/**
 * Copie este arquivo para `firebase-config.js` e preencha com os dados do seu projeto.
 * No Console Firebase: crie um projeto → Realtime Database → criar banco → regras (teste).
 * Project settings → Your apps → Web → copiar o objeto firebaseConfig.
 *
 * Regras mínimas para este app (ajuste depois para produção):
 * {
 *   "rules": {
 *     "chekSemAcucar": {
 *       ".read": true,
 *       ".write": true
 *     }
 *   }
 * }
 */
window.__CHEK_FIREBASE__ = {
  apiKey: "SUA_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  databaseURL: "https://seu-projeto-default-rtdb.firebaseio.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxx",
};
