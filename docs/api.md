# Documentation API

Cette documentation décrit les endpoints principaux disponibles dans l'application FST-Chat.

## Base URL

```
https://api.fst-chat.com
```

## Endpoints

### Authentification

#### POST /auth/login
- **Description** : Authentifie un utilisateur et retourne un token JWT.
- **Body** :
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Réponse** :
  ```json
  {
    "token": "jwt-token"
  }
  ```
- **Erreurs** :
  - 401 Unauthorized : Identifiants invalides.

#### POST /auth/register
- **Description** : Inscrit un nouvel utilisateur.
- **Body** :
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "pseudo": "user123"
  }
  ```
- **Réponse** :
  ```json
  {
    user,
    "message": "User registered successfully."
  }
  ```
- **Erreurs** :
  - 400 Bad Request : Données invalides.

### Messages

#### GET /messages/:channelId
- **Description** : Récupère les messages d'un canal spécifique.
- **Paramètres** :
  - `channelId` (path) : ID du canal.
- **Réponse** :
  ```json
  [
    {
      "id": "message1",
      "content": "Hello World",
      "author": "user123",
      "timestamp": "2023-01-01T12:00:00Z"
    }
  ]
  ```
- **Erreurs** :
  - 404 Not Found : Canal non trouvé.

#### POST /messages
- **Description** : Envoie un nouveau message.
- **Body** :
  ```json
  {
    "channelId": "channel123",
    "content": "Hello World"
  }
  ```
- **Réponse** :
  ```json
  {
    "id": "message1",
    "content": "Hello World",
    "author": "user123",
    "timestamp": "2023-01-01T12:00:00Z"
  }
  ```
- **Erreurs** :
  - 400 Bad Request : Données invalides.

### Serveurs

#### GET /servers
- **Description** : Liste tous les serveurs.
- **Réponse** :
  ```json
  [
    {
      "id": "server1",
      "name": "Gaming Server",
      "tags": ["gaming", "fun"]
    }
  ]
  ```

#### POST /servers
- **Description** : Crée un nouveau serveur.
- **Body** :
  ```json
  {
    "name": "New Server",
    "tags": ["education", "tech"]
  }
  ```
- **Réponse** :
  ```json
  {
    "id": "server123",
    "name": "New Server",
    "tags": ["education", "tech"]
  }
  ```

---

Cette documentation est sujette à modifications en fonction des évolutions du projet.

