<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Transmission Manager - Instructions Copilot

## Contexte du projet
Cette application Next.js gère les téléchargements BitTorrent via Transmission et organise les fichiers pour Plex Media Server.

## Architecture
- **Frontend** : Next.js 15 + TypeScript + Tailwind CSS
- **Backend** : API Routes Next.js + Prisma ORM
- **Base de données** : MySQL
- **Authentification** : NextAuth.js
- **Intégrations** : Transmission RPC API, TMDB API

## Conventions de code
- Utiliser TypeScript strict
- Composants React fonctionnels avec hooks
- Nommage en camelCase pour variables, PascalCase pour composants
- Classes CSS avec Tailwind uniquement
- Gestion d'erreurs avec try/catch et messages utilisateur appropriés

## Structure des données
- **Users** : Authentification et ownership des fichiers
- **Files** : Statuts DOWNLOADING/MOVING/FINISHED, métadonnées optionnelles
- **Categories** : films/series/autres avec logique spécifique
- **Reminders** : Liste de souhaits utilisateur

## APIs importantes
- Transmission RPC pour contrôle torrents
- TMDB pour métadonnées films/séries
- Déplacement automatique vers dossiers Plex selon catégorie

## Sécurité
- Toutes les API routes doivent vérifier l'authentification
- Validation des entrées utilisateur
- Pas d'exposition des chemins système côté client

## Performance
- Synchronisation Transmission limitée (toutes les 5 min)
- Pagination pour grandes listes
- Images optimisées Next.js
- Cache approprié pour métadonnées TMDB
