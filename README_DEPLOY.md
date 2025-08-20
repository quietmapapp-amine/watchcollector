# WatchCollector — Deploy DB & Functions

## 1) Charger les secrets **dans le shell** (ne pas committer)
Copie/édite `.env.functions.example`, puis exporte :
```bash
export SUPABASE_URL=https://bdkmcauinpwvzbmgxzfl.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJka21jYXVpbnB3dnpibWd4emZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTcwOTY3NSwiZXhwIjoyMDcxMjg1Njc1fQ.LxadDoNMpvMfw6kdYVP6MbFw_9gZUXMRbcU9ABVL-nQ
# optionnels
export ONESIGNAL_APP_ID=
export ONESIGNAL_API_KEY=
export RESEND_API_KEY=
export GOOGLE_VISION_API_KEY=
```

## 2) Auth CLI Supabase (si demandé)
```bash
export SUPABASE_ACCESS_TOKEN=<ton_token_supabase_dashboard>
```

## 3) Lancer l'automatisation (migrations + seed + secrets + deploy toutes les functions)
```bash
chmod +x scripts/supabase_deploy_all.sh
npm run deploy:all
```

## Liste des functions déployées

- **prices-snapshot** - Snapshots de prix automatiques
- **send-alerts** - Envoi d'alertes de prix
- **generate-pdf** - Génération de rapports PDF
- **ocr-invoice** - Reconnaissance de factures
- **ai-photo-match** - Reconnaissance de montres par IA
- **price-comparator** - Comparaison multi-sources
- **auction-calendar** - Calendrier des enchères
- **investment-sim** - Simulation d'investissement
- **collection-score** - Score de collection automatique
- **widget-highlight** - Mise en avant quotidienne

## Sécurité

**La clé SERVICE_ROLE n'est jamais écrite côté client.** Elle est injectée dans les Functions secrets via le script de déploiement.

## Commandes rapides

```bash
# Déploiement complet (DB + Functions + Secrets)
npm run deploy:all

# Déploiement des fonctions uniquement
npm run deploy:functions

# Application des migrations DB
npm run db:apply

# Push DB + Seed
npm run db:push && npm run db:seed
```

## Vérification

Après déploiement, vérifie dans le Dashboard Supabase :
- ✅ Tables créées (migrations appliquées)
- ✅ Edge Functions déployées
- ✅ Secrets configurés
- ✅ Base de données seedée
