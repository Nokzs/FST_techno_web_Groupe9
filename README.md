# FST-Chat

Plateforme de messagerie temps réel développée à la FST . L’application combine un backend NestJS et un frontend React afin d’offrir une expérience de chat moderne : salons thématiques, rôles, partage de fichiers compressés, notifications en direct et assistance IA multilingue.

##  Objectif du projet
- Proposer un espace d’échange collaboratif .
- Centraliser les discussions par serveurs et salons.
- Exploiter l’IA (Cohere) pour résumer et répondre aux questions issues des conversations.

##  Fonctionnalités

### Fonctionnalités déjà disponibles
- **Authentification JWT** : inscription, connexion, déconnexion, rafraîchissement du profil courant (`auth.controller.ts`), cookies httpOnly, hashing Bcrypt avec suivi de dernière connexion.
- **Gestion avancée du profil** : édition du pseudo, de la bio, de la langue de référence, changement de mot de passe, mise à jour de l’avatar via Supabase (upload signé côté backend, décompression côté frontend).
- **Gestion des serveurs** : 
    - Création, invitation par code, ouverture/fermeture au public, recherche paginée par noms et tags, adhésion aux serveurs publics (`server.controller.ts`), affectation des rôles via `RolesService`.
    -  A la création on configure le role des futures membres par défaut parmis deux : `Reader` , `Writter`.

- **Salons et notifications** : création/suppression en fonction des roles, récupération contextualisée des notifications non lues, badge de notifications en temps réel côté client, buckets Supabase dédiés par salon.
- **temps réel** :
  - Socket.io pour l’envoi instantané, la pagination incrémentale (HTTP + synchronisation à la reconnexion), les réactions, la suppression et l’épinglage.
  - Vue en temps réel des membres connectés : affichage instantané des utilisateurs qui rejoignent ou quittent le serveur.
  - Indicateur de présence : chaque membre possède un statut (en ligne / hors ligne) mis à jour dynamiquement grâce à Socket.io.
  - Gestion des réponses, indicateur « en train d’écrire », lecture optimiste, synchronisation des fichiers via `updateMessageFiles`.
  - Compression Gzip des pièces jointes, flux audio (MediaRecorder), récupération différée des URLs publiques.
- **Assistant IA conversationnel** :
  - Parsing des commandes `/question` et `/summarize`, réponse contextualisée sur l’historique du salon, cache sémantique par canal, traduction automatique selon la langue détectée ou préférée.
  - Génération d’embeddings pour les messages afin d’optimiser la recherche de contexte et les réponses.
  - Résumés structurés avec séparation des thèmes.
- **Internationalisation & accessibilité** : interface FR/EN (i18next + locize), interrupteur de langue, prise en charge du dark mode (préférence système + persistence), animations Framer Motion.
- **Documentation vivante** : Swagger auto-généré à l’URL `/api` et dossier `docs/` détaillant architecture, modèles de données, sécurité et procédure de déploiement.
- **Roles hiérarchisés** : 
     - Creator : Créateur du serveur — peut supprimer le serveur, modifier les rôles par défaut, désigner des administrateurs, et rendre le serveur public ou privé      (droits administrateur complets).
     - Admin   : Peut créer ou supprimer des channels, modifier les rôles des membres du serveur (Member / Reader), et épingler des messages dans un channel.
     - Member  : Peut envoyer des messages, fichiers ou audios, et rejoindre des channels. 
     - Reader  : Peut uniquement lire les conversations et rejoindre des channels.



##  Pile technologique
- **Frontend** : React 19, React Router 7, Vite, TypeScript, Tailwind CSS 4, Framer Motion, i18next, socket.io-client, react-hot-toast, Vitest.
- **Backend** : NestJS 11, Mongoose/MongoDB, socket.io, Cache Manager, JWT, Supabase Storage SDK, Cohere AI SDK, Swagger/OpenAPI.
- **Outils & infrastructure** : Supabase (stockage public et URLs signées), Cohere (LLM & embeddings), Husky, ESLint/Prettier, Jest/Vitest.

##  Structure du dépôt
```
.
├── fst-chat/                 # Frontend React (src/, public/locales, Vite configs…)
│   ├── src/api/              # Clients REST & WebSocket (messages, serveurs, stockage…)
│   ├── src/component/        # Pages, interfaces UI, ChatBot, formulaires d’authentification
│   ├── src/context/          # Contexts React globaux (authentification, thème sombre, etc.)
│   ├── src/hooks/            # Logique partagée (useMessages, dark mode…)
│   ├── src/i18n/             # Gestion multilingue (traductions, locales)
│   ├── src/loaders/          # Pré-chargement React Router (messages, profil…)
│   ├── src/middleware/       # Middlewares front-end (authentification, redirections)
│   ├── src/types/            # Types et interfaces TypeScript partagés
│   └── src/utils/            # Types et interfaces TypeScript partagés
│ 
├── fst-chat-back/            # Backend NestJS
│   ├── src/auth/, user/, token/         # Authentification et gestion utilisateurs
│   ├── src/server/, channel/, roles/    # Domaines serveurs/salons/rôles & websockets
│   ├── src/message/                     # API & gateway temps réel (fichiers, réactions…)
│   ├── src/guards/                      # Gardiens d’accès et stratégies de sécurité
│   ├── src/IA/                          # Intégration Cohere (QA, résumé, traduction)
│   └── src/storage/, cache/             # Abstraction Supabase & cache applicatif
├                  
└── package.json, .husky/…   # Scripts communs et hooks Git
```

##  Configuration & installation

### Prérequis
- Node.js ≥ 20 et npm.
- Instance MongoDB accessible (locale ou Atlas).
- Projet Supabase (URL + clé de service) avec storage activé.
- Clé API Cohere valide.


### Variables d’environnement backend (`fst-chat-back/.env`)
| Clé | Description |
| --- | --- |
| `PORT` | Port HTTP (défaut 3000). |
| `DB_URL` | URI MongoDB. |
| `JWT_SECRET` | Secret de signature JWT. |
| `JWT_EXPIRES_IN` | Durée de vie des tokens (ex : `7d`, `1h`). |
| `FRONTEND_URL` | Origine autorisée pour CORS & Socket.IO (ex : `http://localhost:5173`). |
| `SUPABASE_URL` / `SUPABASE_KEY` | Accès au storage Supabase. |
| `COHERE_API_KEY` | Clé API Cohere pour le chatbot. |

### Variables d’environnement frontend (`fst-chat/.env`)
- `VITE_API_URL=http://localhost:3000` (ou l’URL publique de l’API).



### Installation des dépendances
```bash


cd fst-chat-back
npm install
npm run dev

cd ../fst-chat
npm install
npm run dev
```


## 🎬 Démonstrations vidéo

###  [Authentification et connexion]

https://github.com/user-attachments/assets/4b7281b2-be3a-42da-a369-73bb7098d3e9



###  [Création d’un serveur]

https://github.com/user-attachments/assets/550f719b-75f5-4fd2-940b-f2bde70af5b6



###  [Fonctionnalités principales du chat]

https://github.com/user-attachments/assets/1a291875-b899-4dd2-acc9-e00df92024a5


###  [Reaction chat]
https://github.com/user-attachments/assets/8d87558c-4248-4a92-b5fe-7ca365f4fa03


###  [Gestion des membres]

https://github.com/user-attachments/assets/32ad33fd-9679-4b66-b4cf-7953818d4236


###  [Gestion du profil utilisateur]


https://github.com/user-attachments/assets/81a70bbb-95b9-4e39-8486-cb9901057026


###  [Gestion des rôles et permissions]


https://github.com/user-attachments/assets/c7de386c-683b-4c42-a7b5-0ae221235de0


###  [Interaction IA : question ]

https://github.com/user-attachments/assets/42f4433c-ea5f-4dab-a1c7-a1dc9d067eb7


###  [Interaction IA :  résumé]


https://github.com/user-attachments/assets/55bc2f14-2d9f-4576-8ebb-035a05fdff96


