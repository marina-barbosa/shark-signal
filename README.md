# SharkSignal

Dive deep into the world of real-time communication! 🦈💬

SharkSignal is a simple yet powerful chat application built for learning and practice. Developed with Angular 19 and .NET 8, it allows users to create accounts, add friends, and chat in real time.

🚀 Tech Stack:

✔ Frontend: Angular 19

✔ Backend: .NET 8

✔ Real-time communication: SignalR

Stay connected, chat seamlessly, and explore the depths of instant messaging! 🌊⚡


# Arquivo ChatService - Documentação

### `ChatService - shark-signal/client/src/app/services/chat.service.ts`

A função `startConnection` é responsável por iniciar uma conexão com um servidor SignalR para gerenciar comunicação em tempo real entre usuários do chat. Ela estabelece e mantém a conexão, garantindo a reconexão automática em caso de falha e atualizando a lista de usuários online.
Essa função garante que os usuários possam se comunicar em tempo real e ter visibilidade sobre quem está online na aplicação.

## Como funciona
1. **Cria uma conexão SignalR** utilizando `HubConnectionBuilder`.
2. **Define a URL do hub** e adiciona o `senderId` (se fornecido) como query string.
3. **Adiciona um token de autenticação** através do `accessTokenFactory`.
4. **Habilita a reconexão automática** para manter a estabilidade da conexão.
5. **Inicia a conexão** com o servidor e exibe logs informando o status.
6. **Ouve eventos de usuários online**, filtrando o usuário logado da lista antes de atualizar `onlineUsers`.







# Arquivo ChatHub - Documentação




### `ChatHub - shark-signal/api/Hubs/ChatHub.cs`


O **ChatHub** é um hub do **SignalR**, uma biblioteca do ASP.NET Core que facilita a comunicação em tempo real entre o servidor e os clientes (como navegadores ou aplicativos). Ele gerencia conexões de usuários, envio de mensagens, notificações e muito mais. 


- `UserManager<AppUser>`: Gerencia usuários, como buscar informações do usuário.
- `AppDbContext`: Contexto do banco de dados para interagir com as tabelas.

---

### `ConcurrentDictionary`


Um dicionário **thread-safe** (seguro para uso em múltiplas threads) que armazena os usuários online.


- Mantém o controle de quais usuários estão conectados ao hub e suas informações, como `ConnectionId`, `UserName`, etc.

---


### `Task OnConnectedAsync()`


Gerencia a conexão de um usuário, atualiza a lista de usuários online e carrega mensagens.

#### Funcionalidades:

- Obtém o nome do usuário e o `ConnectionId` (identificador único da conexão).
- Verifica se o usuário já está na lista de usuários online. Se estiver, atualiza o `ConnectionId`. Se não, adiciona o usuário ao `onlineUsers`.
- Notifica todos os clientes sobre o novo usuário online.
- Carrega as mensagens se um `receiverId` for fornecido.
- Envia a lista atualizada de usuários online para todos os clientes.

---

### `Task LoadMessages(string receiverId, int pageNumber = 1)`


Carrega as mensagens trocadas entre o usuário atual e outro usuário (`receiverId`).

#### Funcionalidades:

- Busca as mensagens do banco de dados, ordenando-as por data e paginando os resultados.
- Marca as mensagens como lidas se o usuário atual for o destinatário.
- Envia a lista de mensagens para o cliente.

---

### `Task SendMessage(MessageRequestDto message)`


Envia uma mensagem de um usuário para outro.

#### Funcionalidades:

- Cria uma nova mensagem no banco de dados com remetente, destinatário, conteúdo e data.
- Salva a mensagem no banco de dados.
- Notifica o destinatário sobre a nova mensagem.

---

### `Task NotifyTyping(string receiverUserName)`


Notifica o destinatário que o remetente está digitando uma mensagem.

#### Funcionalidades:

- Obtém o `ConnectionId` do destinatário.
- Envia uma notificação para o destinatário informando que o remetente está digitando.

---

### `Task OnDisconnectedAsync(Exception? exception)`


Gerencia a desconexão de um usuário e atualiza a lista de usuários online.

#### Funcionalidades:

- Remove o usuário da lista de usuários online.
- Notifica todos os clientes sobre a lista atualizada de usuários online.

---

### `Task<IEnumerable<OnlineUserDto>> GetAllUsers()`


Retorna a lista de todos os usuários, incluindo informações sobre se estão online e quantas mensagens não lidas eles têm.

#### Funcionalidades:

- Busca todos os usuários do banco de dados.
- Verifica quais usuários estão online.
- Conta as mensagens não lidas para cada usuário.
- Retorna a lista de usuários ordenada por status de conexão (online primeiro).

---

### Como as Funcionalidades Trabalham Juntas

Essas funções trabalham em conjunto para fornecer uma experiência de chat em tempo real, onde os usuários podem:

- Conectar-se ao hub e ser notificados sobre outros usuários online.
- Enviar e receber mensagens em tempo real.
- Ver quem está online e quantas mensagens não lidas eles têm.
- Receber notificações quando outro usuário está digitando.

---

### Exemplo de Uso

1. Um usuário se conecta ao hub (`OnConnectedAsync` é chamado).
2. O usuário envia uma mensagem (`SendMessage` é chamado).
3. O destinatário recebe a mensagem e é notificado.
4. Se o destinatário estiver digitando, o remetente é notificado (`NotifyTyping`).
5. Quando um usuário se desconecta, a lista de usuários online é atualizada (`OnDisconnectedAsync`).

---

Essa documentação cobre as principais funcionalidades do **ChatHub**. Para mais detalhes, consulte o código-fonte ou a documentação oficial do **SignalR**.

