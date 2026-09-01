# 🏆 chek-sem-acucar

App mobile (HTML/CSS/JS) para marcar, dia a dia, quem ficou sem açúcar.  
Competição a partir de **02/09/2026**, com duração de 30 dias.  
Participantes: **Amanda, Lorena e Todaro**.

---

# ✨ Sobre o projeto

Desenvolvido por **Carlos Neto**, este aplicativo foi criado para acompanhar diariamente quem conseguiu ficar sem açúcar durante uma competição de 30 dias.

O projeto tem foco em:

- Simplicidade
- Usabilidade mobile
- Interface responsiva
- Sincronização em tempo real entre dispositivos

---

# ⚡ Funcionalidades

- ✅ Marcação diária de quem ficou sem açúcar
- 📱 Interface responsiva para celular
- 💾 Armazenamento local com `localStorage`
- 🔥 Sincronização em tempo real com Firebase Realtime Database
- 🔄 Atualização automática entre dispositivos conectados

---

# 📡 Sincronização em tempo real

Por padrão, o aplicativo continua funcionando **somente no aparelho** usando `localStorage`.

Para habilitar atualização em tempo real entre diferentes dispositivos:

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative o **Realtime Database**
3. Configure as permissões temporárias de leitura e escrita
4. Copie as configurações do Firebase para `firebase-config.js`
5. Faça o deploy do projeto

---

## 🔐 Regras mínimas do Firebase (modo teste)

```json
{
  "rules": {
    "chekSemAcucarV2": {
      ".read": true,
      ".write": true
    }
  }
}
