# FST-Chat

FST-Chat est une application de messagerie moderne qui s'inspire des interfaces et fonctionnalités de Discord et WhatsApp.

## Fonctionnalités principales

- **Temps réel avec WebSocket** : Échangez des messages instantanément.
- **Envoi et réception de messages** : Supporte le texte, les images et autres fichiers.
- **Gestion des messages** : Épinglement, réponse, réaction et suppression des messages.
- **Gestion des serveurs** : Créez, recherchez et rejoignez des serveurs par tags.

## Technologies utilisées

- **Frontend** : React + TailwindCSS
- **Backend** : NestJS + WebSocket
- **Base de données** : MongoDB (via Mongoose)
- **Librairies clés** : JWT (authentification), cohere-ai (IA), supabase storage (gestion des fichiers)

## Installation et exécution

### Prérequis

- Node.js (>=16.x)
- MongoDB (local ou cloud)

### Instructions backend

```bash
cd fst-chat-back
npm install
npm run start:dev
```

### Instructions frontend

```bash
cd fst-chat-front
npm install
npm run dev
```

## Configuration

### Variables d'environnement

#### Backend

- `MONGO_URI` : URL de connexion à la base de données MongoDB
- `JWT_SECRET` : Clé secrète pour signer les tokens JWT
- `SUPABASE_URL` : URL de l'espace Supabase
- `SUPABASE_KEY` : Clé API pour Supabase

#### Frontend

- `VITE_API_URL` : URL de l'API du backend

## Structure du projet

### Frontend

- **api/** : Appels API au serveur
- **cache/** : Gestion locale des caches
- **component/** : Composants React
  - **contextProvider/** : Fournisseurs de contexte
  - **routes/** : Routes principales
- **context/** : Contextes globaux de l'applicatio n
- **hooks/** : Hooks personnalisés
- **i18n/** : Configuration de la traduction
- **loaders/** : Préchargement des données des routes
- **middleware/** : Middleware pour la gestion des requêtes

### Backend

- **auth/** : Module d'authentification (JWT)
- **cache/** : Module de gestion du cache
- **channel/** : Gestion des rooms de discussion
- **config/** : Fichiers de configuration
- **guards/** : Gestion des permissions
- **IA/** : Module d'intelligence artificielle
- **message/** : Gestion des messages
- **server/** : Gestion des serveurs
- **storage/** : Gestion des fichiers avec Supabase
- **token/** : Gestion des tokens JWT
- **user/** : Gestion des utilisateurs

## Exemples d'utilisation

Ajoutez des captures d'écran ou des vidéos montrant les principales fonctionnalités ici.

## Contributeurs

- [Votre nom] - Développeur principal

## Licence

Ce projet est sous licence MIT.

## Évolutions futures

- Amélioration des performances des WebSockets
- Ajout de nouvelles fonctionnalités de modération des serveurs
- Intégration de nouvelles options de stockage pour les fichiers
- Optimisation de l'expérience utilisateur sur mobile

