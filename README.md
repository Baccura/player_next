# Transmission Manager

Application Next.js pour gérer les téléchargements Transmission avec intégration Plex.

## Fonctionnalités

- 📁 **Gestion des fichiers Transmission** : Visualiser, ajouter et gérer les téléchargements
- 🔄 **Synchronisation automatique** : Mise à jour du statut des fichiers toutes les 5 minutes
- 📂 **Catégorisation** : Organisation par films, séries et autres
- 🎯 **Intégration Plex** : Déplacement automatique vers les dossiers Plex
- 📝 **Reminders** : Liste de souhaits pour futurs téléchargements
- 🔐 **Authentification** : Connexion sécurisée par utilisateur

## Stack Technique

- **Frontend** : Next.js 15, React 18, TypeScript
- **Styling** : Tailwind CSS
- **Base de données** : MySQL avec Prisma ORM
- **Authentification** : NextAuth.js
- **API** : Transmission RPC, TMDB (images)

## Installation

### Prérequis

- Node.js 18+
- MySQL 8.0+
- Transmission daemon avec RPC activé

### Configuration

1. **Cloner le projet**
```bash
git clone <repository-url>
cd transmission-manager
npm install
```

2. **Configuration de la base de données**
```bash
# Copier le fichier d'environnement
cp .env.local.example .env.local

# Éditer .env.local avec vos paramètres
DATABASE_URL="mysql://username:password@localhost:3306/transmission_manager"
```

3. **Variables d'environnement (.env.local)**
```env
# Base de données MySQL
DATABASE_URL="mysql://username:password@localhost:3306/transmission_manager"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Transmission RPC
TRANSMISSION_HOST="localhost"
TRANSMISSION_PORT="9091"
TRANSMISSION_USERNAME=""
TRANSMISSION_PASSWORD=""

# Plex
PLEX_MOVIES_PATH="/path/to/plex/movies"
PLEX_SERIES_PATH="/path/to/plex/series"
PLEX_OTHER_PATH="/path/to/plex/other"

# TMDB API (optionnel, pour les images)
TMDB_API_KEY="your-tmdb-api-key"
```

4. **Initialiser la base de données**
```bash
npx prisma db push
npx prisma db seed
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Utilisation

### 1. Connexion
- Créer un compte utilisateur dans la base de données
- Se connecter via l'interface web

### 2. Ajouter des fichiers
- Utiliser le bouton "Ajouter un fichier"
- Entrer le titre et choisir la catégorie
- Optionnel : ajouter un lien magnet pour téléchargement automatique

### 3. Suivi des téléchargements
- **En cours** : Fichiers en cours de téléchargement
- **En attente** : Fichiers en cours de déplacement vers Plex
- **Terminés** : Fichiers prêts dans Plex

### 4. Synchronisation automatique
- Tâche automatique toutes les 5 minutes
- Mise à jour du statut depuis Transmission
- Déplacement automatique vers Plex quand terminé

## Architecture

### Base de données (MySQL)
```sql
Users (id, email, name, password)
Categories (id, name, description)
Files (id, title, status, size, progress, paths, metadata, user_id, category_id)
Reminders (id, title, description, completed, user_id, category_id)
```

### API Routes
- `/api/auth/[...nextauth]` - Authentification
- `/api/files` - CRUD des fichiers
- `/api/reminders` - CRUD des reminders
- `/api/transmission/sync` - Synchronisation Transmission

### Composants principaux
- `Dashboard` - Page d'accueil avec statistiques
- `FileCard` - Affichage d'un fichier
- `AddFileModal` - Formulaire d'ajout
- `SignInPage` - Page de connexion

## Déploiement sur Ubuntu/Apache

### 1. Prérequis serveur
```bash
# Installation Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installation MySQL
sudo apt install mysql-server

# Installation Apache
sudo apt install apache2
```

### 2. Configuration Apache
```apache
# /etc/apache2/sites-available/transmission-manager.conf
<VirtualHost *:80>
    ServerName your-domain.com
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

### 3. Déploiement
```bash
# Build de production
npm run build

# Lancement avec PM2
npm install -g pm2
pm2 start npm --name "transmission-manager" -- start
pm2 startup
pm2 save
```

### 4. Tâche cron pour synchronisation
```bash
# Ajouter dans crontab -e
*/5 * * * * curl -X POST http://localhost:3000/api/transmission/sync
```

## API Transmission

### Configuration requise
```json
{
  "rpc-enabled": true,
  "rpc-port": 9091,
  "rpc-whitelist-enabled": false,
  "rpc-authentication-required": false
}
```

### Endpoints utilisés
- `torrent-get` - Récupération des torrents
- `torrent-add` - Ajout d'un torrent
- `torrent-start/stop` - Contrôle des torrents

## Sécurité

- Authentification par sessions JWT
- Validation des entrées utilisateur
- Protection CSRF avec NextAuth.js
- Accès base de données via ORM Prisma

## Maintenance

### Logs
```bash
# Logs application
pm2 logs transmission-manager

# Logs base de données
sudo tail -f /var/log/mysql/error.log
```

### Backup base de données
```bash
mysqldump -u username -p transmission_manager > backup.sql
```

## Licence

Projet personnel - Tous droits réservés
