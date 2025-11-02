# Déploiement de FST-Chat

Ce guide décrit les étapes pour déployer l'application FST-Chat en production.

---

## Prérequis

- **Node.js** version >=16.x
- **MongoDB** : Base de données accessible (local ou cloud).
- **Docker** (optionnel) : Pour créer des conteneurs.
- **Plateforme de déploiement** : Render, Vercel, ou une VM.
- **Clés d'environnement** :
  - `MONGO_URI` : URL de connexion à la base de données MongoDB.
  - `JWT_SECRET` : Clé secrète pour signer les tokens JWT.
  - `SUPABASE_URL` et `SUPABASE_KEY` : Clés pour le stockage Supabase.

---

## Étapes de déploiement

### 1. **Installation Backend**

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/votre-repo/fst-chat.git
   cd fst-chat/fst-chat-back
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez les variables d'environnement :
   - Renommez `.env.example` en `.env`.
   - Remplissez les clés nécessaires (`MONGO_URI`, `JWT_SECRET`, etc.).

4. Démarrez le serveur :
   ```bash
   npm run start:prod
   ```

### 2. **Installation Frontend**

1. Accédez au dossier frontend :
   ```bash
   cd ../fst-chat-front
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez les variables d'environnement :
   - Renommez `.env.example` en `.env`.
   - Ajoutez la clé `VITE_API_URL` avec l'URL de votre serveur backend.

4. Construisez l'application :
   ```bash
   npm run build
   ```

5. Démarrez l'application :
   ```bash
   npm run preview
   ```

---

### 3. **Utilisation de Docker (optionnel)**

1. Construisez l'image Docker :
   ```bash
   docker build -t fst-chat .
   ```

2. Démarrez le conteneur :
   ```bash
   docker run -d -p 3000:3000 --name fst-chat-container fst-chat
   ```

---

### 4. **Déploiement sur une plateforme**

#### Render (backend et base de données)

1. Connectez votre dépôt Git à Render.
2. Configurez un nouveau service pour le backend.
3. Ajoutez les variables d'environnement nécessaires dans les paramètres du service.
4. Déployez !

#### Vercel (frontend)

1. Connectez votre dépôt Git à Vercel.
2. Ajoutez la variable `VITE_API_URL` dans les paramètres Vercel.
3. Lancez le déploiement.

---

### Notes supplémentaires

- **Logs** : Configurez un service comme PM2 pour gérer les logs.
- **Certificat SSL** : Utilisez Let's Encrypt ou une autre solution pour sécuriser votre domaine.

Ce guide garantit un déploiement fluide de l'application FST-Chat.

