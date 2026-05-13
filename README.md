chek-sem-acucar

Aplicativo mobile desenvolvido por Carlos Neto utilizando HTML, CSS e JavaScript, criado para acompanhar diariamente quem conseguiu ficar sem açúcar durante uma competição de 30 dias iniciada em 21/04/2026.

O projeto foi desenvolvido com foco em simplicidade, responsividade e sincronização em tempo real entre dispositivos.

Funcionalidades
Controle diário da competição sem açúcar
Interface responsiva para celular
Armazenamento local com localStorage
Sincronização em tempo real utilizando Firebase Realtime Database
Atualização automática entre dispositivos conectados
Tecnologias utilizadas
HTML5
CSS3
JavaScript Vanilla
Firebase Realtime Database
Sincronização em tempo real

Por padrão, o aplicativo funciona localmente utilizando localStorage.

Para habilitar a sincronização em tempo real entre diferentes aparelhos:

Crie um projeto no Firebase Console
Ative o Realtime Database
Configure as permissões temporárias de leitura e escrita
Copie as configurações do Firebase para firebase-config.js
Faça o deploy do projeto
Exemplo de regras do Firebase (modo teste)

{
  "rules": {
    "chekSemAcucar": {
      ".read": true,
      ".write": true
    }
  }
}

Os dados são armazenados no formato:

chekSemAcucar/{dia}/{carlos|amanda|ana}

Mesmo utilizando Firebase, o sistema mantém backup local via localStorage.

Como executar localmente

Basta abrir o arquivo index.html no navegador ou publicar o projeto em qualquer hospedagem estática.

Projeto publicado

Acesse a versão online:

🔗 chek-sem-acucar

Utilize o endereço completo com /chek-sem-acucar/ no final.

Autor

Desenvolvido por Carlos Neto

GitHub: @kadunet0
LinkedIn: Carlos Neto
