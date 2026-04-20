# Chek — 1 mês sem açúcar

App mobile (HTML/CSS/JS) para marcar, dia a dia, quem ficou sem açúcar. Competição a partir de **21/04/2026**, 30 dias.

## Sincronização em tempo real

Por padrão o app continua funcionando **só no aparelho** (`localStorage`).

Para **atualizar para todo mundo na hora** quando alguém marca um dia:

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Ative **Realtime Database** (criar banco) e, em modo de desenvolvimento, use regras que permitam leitura/escrita no nó `chekSemAcucar` (exemplo abaixo).
3. Em **Project settings** → **Your apps** → ícone Web, copie o objeto de configuração.
4. Copie `firebase-config.example.js` para `firebase-config.js` e cole **apiKey**, **databaseURL**, **authDomain**, **projectId**, etc.
5. Faça deploy (GitHub Pages ou outro). Abra o site em dois celulares: ao marcar em um, o outro atualiza sozinho.

**Regras mínimas (apenas para teste; depois restrinja por domínio ou auth):**

```json
{
  "rules": {
    "chekSemAcucar": {
      ".read": true,
      ".write": true
    }
  }
}
```

Os dados em tempo real ficam em `chekSemAcucar/{dia}/{carlos|amanda|ana}`. O app ainda espelha no `localStorage` como backup quando o Firebase está ativo.

## Como usar (local)

Abra `index.html` no navegador do celular ou publique em qualquer hospedagem estática.

## Site publicado (GitHub Pages)

**https://kadunet0.github.io/chek-sem-acucar/**

Use exatamente esse endereço (com `/chek-sem-acucar/` no final). Só `https://kadunet0.github.io/` mostra 404 — é normal.

Se não abrir de primeira: espere 1–2 minutos após um push, tente aba anônima ou atualize forçando (Ctrl+F5).
