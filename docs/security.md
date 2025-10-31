# Sécurité dans FST-Chat

Ce document détaille les mesures de sécurité mises en œuvre dans le projet FST-Chat pour protéger les données des utilisateurs et garantir une utilisation sécurisée.

---

## Authentification

### JWT (JSON Web Tokens)
- **Utilisation** :
  - Les tokens JWT sont utilisés pour authentifier les utilisateurs après leur connexion.
  - Le token est signé à l'aide d'une clé secrète (`JWT_SECRET`) pour éviter les falsifications.
- **Expiration** :
  - Les tokens ont une durée de vie limitée pour réduire les risques.
  - Une stratégie de rafraîchissement peut être implémentée pour renouveler les tokens expirés.

---

## Validation des données

### Backend
- Toutes les entrées utilisateur sont validées à l'aide de decorators dans NestJS.
- Les schémas Mongoose définissent des contraintes sur les données stockées dans la base.
- Les entrées non conformes sont rejetées avec des erreurs explicites.

### Frontend
- Une validation côté client est mise en œuvre pour améliorer l'expérience utilisateur.
- Cependant, le backend reste le point de contrôle principal.

---

## Sécurisation des API

### Protection contre les attaques courantes

#### 1. **Injection SQL/NoSQL**
- Utilisation de Mongoose pour prévenir les injections NoSQL.
- Les entrées utilisateur sont toujours désinfectées avant d'être utilisées dans des requêtes.

#### 2. **Cross-Site Scripting (XSS)**
- Les données affichées dans le frontend sont échappées pour éviter l'exécution de scripts injectés.

#### 3. **Cross-Site Request Forgery (CSRF)**
- Les API critiques nécessitent des tokens CSRF pour les requêtes sensibles.

#### 4. **Brute Force et attaques par dictionnaire**
- Limitation du nombre de tentatives de connexion avec des outils comme `express-rate-limit`.
- Utilisation de bcrypt pour le hachage des mots de passe.

### Communication sécurisée
- Toutes les communications entre le frontend, le backend et la base de données sont chiffrées via HTTPS.

---

## Gestion des permissions

### Guards dans NestJS
- Les guards sont utilisés pour restreindre l'accès à certaines routes en fonction des rôles des utilisateurs (admin, utilisateur standard, etc.).

### Exemples de guards
- **AdminGuard** : Permet uniquement aux administrateurs d'accéder à certaines fonctionnalités.
- **AuthGuard** : Vérifie la présence et la validité du JWT.

---

## Sécurité des fichiers

### Supabase Storage
- Les fichiers (images, vidéos) sont stockés de manière sécurisée avec des permissions spécifiques.
- Les URL des fichiers sont temporisées pour éviter tout accès non autorisé.

---

## Surveillance et journalisation

### PM2 et logs
- PM2 est utilisé pour surveiller les applications en production et capturer les logs.
- Les erreurs critiques sont sauvegardées pour une analyse future.

### Alertes
- Des outils comme Sentry peuvent être intégrés pour suivre les erreurs en temps réel.

---

Ces mesures garantissent que les données des utilisateurs et les opérations de l'application restent sécurisées.

