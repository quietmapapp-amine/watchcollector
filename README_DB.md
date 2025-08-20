# Database Automation (Supabase)

## Prérequis
- Supabase CLI installé  
- Un **Access Token** Supabase disponible :
  ```bash
  export SUPABASE_ACCESS_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
  ```

Le projet est `bdkmcauinpwvzbmgxzfl` (WatchCollector).

## 1. Appliquer migrations + seeds
```bash
npm run db:apply
```

Ce script :
- Vérifie le CLI et les chemins
- `supabase link --project-ref bdkmcauinpwvzbmgxzfl` si nécessaire
- `supabase db push` (applique supabase/migrations)
- `supabase db seed --file supabase/seed/seed_badges_and_tags.sql`

## 2. Commandes séparées
```bash
npm run db:push   # uniquement migrations
npm run db:seed   # relancer le seed badges/tags
```

## Dépannage

**Token manquant :** `export SUPABASE_ACCESS_TOKEN=...`

**CLI manquant :** `brew install supabase/tap/supabase`

**Projet non lié :** le script lance `supabase link` automatiquement.

⚠️ **Ne jamais exposer la clé SERVICE_ROLE côté client.** Elle reste côté Edge Functions (secrets).

## Permissions (note to user)
- After file creation, you may need to grant executable permission once:
  ```bash
  chmod +x scripts/db_apply.sh
  ```
