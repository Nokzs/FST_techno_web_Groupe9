# Justification des choix techniques

Ce document explique les décisions techniques prises lors du développement de FST-Chat, en mettant en avant les technologies et patterns adoptés.

---

## Choix des technologies

### 1. **React**
- **Pourquoi ?**
  - React offre une bibliothèque flexible et performante pour créer des interfaces utilisateur modernes.
  - Sa gestion de l'état (via Context ou Redux) permet une bonne organisation des données globales.
  - La communauté active garantit un support constant et des ressources éducatives.

### 2. **NestJS**
- **Pourquoi ?**
  - Framework structuré pour développer des APIs côté serveur.
  - Support natif de TypeScript permettant de réduire les bugs.
  - Intégration facile avec WebSocket pour les fonctionnalités en temps réel.

### 3. **MongoDB (via Mongoose)**
- **Pourquoi ?**
  - Base de données NoSQL adaptée pour des relations flexibles comme celles des messages et des utilisateurs.
  - Mongoose simplifie l'interaction avec MongoDB à travers des schémas bien définis.

### 4. **TailwindCSS**
- **Pourquoi ?**
  - Design rapide grâce à des classes utilitaires.
  - Cohérence dans le design et réutilisation des styles.

### 5. **Cohere-AI**
- **Pourquoi ?**
  - Fournit des fonctionnalités d'intelligence artificielle avancées comme les suggestions de texte ou l'analyse de sentiment.
  - Intégration facile via une API REST.

### 6. **Supabase Storage**
- **Pourquoi ?**
  - Gestion simple des fichiers (images, vidéos, etc.)
  - Concurrence avec AWS S3 mais plus simple à mettre en œuvre pour un projet en évolution.

---

## Design des fonctionnalités

### 1. **Temps réel via WebSocket**
- **Pourquoi ?**
  - Nécessaire pour les échanges instantanés de messages.
  - Permet de réduire la latence perçue par les utilisateurs.

### 2. **JWT pour l'authentification**
- **Pourquoi ?**
  - Méthode sécurisée et standardisée pour gérer les sessions utilisateur.
  - Facile à utiliser à la fois dans le frontend et le backend.

### 3. **Gestion des serveurs et canaux**
- **Pourquoi ?**
  - Inspiré de Discord, ce système offre une hiérarchie claire pour organiser les discussions.
  - Les utilisateurs peuvent créer et rejoindre des serveurs basés sur leurs centres d'intérêt.

---

## Patterns de conception

### 1. **MVC (Model-View-Controller)**
- **Pourquoi ?**
  - Structure claire et séparée entre les données (Model), la logique de l'application (Controller) et l'interface utilisateur (View).

### 2. **Hooks personnalisés dans React**
- **Pourquoi ?**
  - Réutilisation de la logique entre différents composants.
  - Simplifie le code et améliore la maintenabilité.

### 3. **Injection de dépendances dans NestJS**
- **Pourquoi ?**
  - Facilite les tests et la modularité.
  - Les services peuvent être partagés et réutilisés facilement.

---

## Évolutions futures

- **Migration vers TypeScript strict** : Réduire encore plus le risque de bugs.
- **Support de bases de données SQL** : Ajouter une option pour les entreprises qui préfèrent SQL.
- **Amélioration de l'IA** : Intégrer des modèles de machine learning personnalisés.

Ces choix garantissent une base solide pour le développement et la maintenance de FST-Chat.

