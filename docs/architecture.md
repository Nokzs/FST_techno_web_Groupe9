# Architecture de FST-Chat

FST-Chat est construit en utilisant une architecture découplée et moderne. Voici une vue d'ensemble des principaux composants et de leurs interactions :

## Vue d'ensemble

L'application est composée de trois couches principales :

### 1. **Frontend (React)**
- **Rôle** : Fournir une interface utilisateur interactive et réactive.
- **Technologies** : React, TailwindCSS.
- **Responsabilités** :
  - Gestion des états locaux et globaux.
  - Appels aux APIs du backend.
  - Affichage des messages en temps réel via WebSocket.

### 2. **Backend (NestJS)**
- **Rôle** : Fournir des API sécurisées et gérer les communications en temps réel.
- **Technologies** : NestJS, WebSocket.
- **Responsabilités** :
  - Authentification et gestion des utilisateurs (JWT).
  - Gestion des messages et des serveurs.
  - Intégration de l'IA via Cohere-AI.

### 3. **Base de données (MongoDB)**
- **Rôle** : Stocker les données de manière fiable et évolutive.
- **Technologies** : MongoDB, Mongoose.
- **Responsabilités** :
  - Stockage des utilisateurs, messages, et métadonnées des serveurs.
  - Requêtes optimisées pour les performances.

## Communication entre les composants

1. **Frontend ↔ Backend** :
    - Protocole : HTTP/HTTPS pour les API REST, WebSocket pour les communications en temps réel.
    - Données échangées : JSON.
    - Authentification : JWT (JSON Web Tokens).

2. **Backend ↔ Base de données** :
    - Protocole : MongoDB Driver.
    - Données échangées : BSON (binary JSON).
    - ORM : Mongoose pour la gestion des schémas.

## Temps réel avec WebSocket

Le backend utilise WebSocket pour permettre des communications bidirectionnelles en temps réel avec les clients. Cela est essentiel pour :
- La livraison instantanée des messages.
- Les notifications de nouveaux messages ou de modifications.
- La gestion des événements dans les serveurs et les canaux.

