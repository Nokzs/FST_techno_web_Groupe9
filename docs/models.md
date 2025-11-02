# Modèles Mongoose

Cette documentation décrit les principaux schémas Mongoose utilisés dans le projet FST-Chat.

---

## Schéma Utilisateur (UserSchema)

### Structure
```javascript
{
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}
```

### Description
- **username** : Le pseudonyme unique de l'utilisateur.
- **email** : L'adresse email unique associée à l'utilisateur.
- **password** : Le mot de passe hashé de l'utilisateur.
- **createdAt** : Timestamp de la création du compte.
- **updatedAt** : Timestamp de la dernière mise à jour.

---

## Schéma Message (MessageSchema)

### Structure
```javascript
{
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
  createdAt: { type: Date, default: Date.now },
}
```

### Description
- **content** : Contenu textuel du message.
- **author** : Référence à l'utilisateur qui a écrit le message.
- **channel** : Référence au canal où le message a été publié.
- **createdAt** : Timestamp de la création du message.

---

## Schéma Canal (ChannelSchema)

### Structure
```javascript
{
  name: { type: String, required: true },
  server: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true },
  tags: [{ type: String }],
}
```

### Description
- **name** : Nom du canal.
- **server** : Référence au serveur associé.
- **tags** : Liste des tags pour le canal.

---

## Schéma Serveur (ServerSchema)

### Structure
```javascript
{
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
}
```

### Description
- **name** : Nom du serveur.
- **owner** : Référence au propriétaire du serveur.
- **tags** : Tags associés au serveur.
- **createdAt** : Timestamp de création du serveur.

---

Ces modèles servent de base pour la gestion des utilisateurs, des messages, des canaux et des serveurs dans l'application.

