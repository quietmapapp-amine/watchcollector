# Test des Edge Functions

## Fonctions créées

1. **price-comparator** - Comparaison de prix multi-sources
2. **auction-calendar** - Calendrier des enchères
3. **investment-sim** - Simulation d'investissement
4. **collection-score** - Score de collection
5. **widget-highlight** - Mise en avant quotidienne

## Tests à effectuer

### 1. Test de la migration de base de données
```bash
npm run db:apply
```

### 2. Test des Edge Functions
```bash
# Déployer toutes les fonctions
npm run db:apply:full

# Ou déployer individuellement
supabase functions deploy price-comparator
supabase functions deploy auction-calendar
supabase functions deploy investment-sim
supabase functions deploy collection-score
supabase functions deploy widget-highlight
```

### 3. Test des écrans
- ComparePricesScreen
- AuctionsScreen  
- InvestmentSimScreen

## Vérifications

- Tables créées dans Supabase Dashboard
- Edge Functions déployées et accessibles
- Écrans s'affichent correctement
- Fonctionnalités de base opérationnelles
