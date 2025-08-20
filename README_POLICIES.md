# Policy Checker & Auto‑Fix

## Scanner
```bash
npm run scan:policies
```

Affiche fichier:ligne pour chaque `CREATE POLICY IF NOT EXISTS`.

## Auto‑fix (dry‑run)
```bash
npm run fix:policies
```

Montre ce qui serait modifié, sans écrire.

## Auto‑fix (écriture)
```bash
npm run fix:policies:write
```

Crée un backup `*.bak` de chaque migration modifiée.

Remplace chaque `CREATE POLICY IF NOT EXISTS "name" ON table` par :

```sql
drop policy if exists "name" on table;
create policy "name" on table ...
```

## Heuristique sûre

Ne touche que les lignes où la policy et la table sont sur la même ligne que `CREATE POLICY IF NOT EXISTS`.

## Exemple d'utilisation

### 1. Vérifier les problèmes
```bash
npm run scan:policies
```

### 2. Voir ce qui serait corrigé
```bash
npm run fix:policies
```

### 3. Appliquer les corrections
```bash
npm run fix:policies:write
```

### 4. Vérifier que tout est corrigé
```bash
npm run scan:policies
```

## Pourquoi corriger ?

`CREATE POLICY IF NOT EXISTS` n'est pas supporté par PostgreSQL. Il faut utiliser :

1. `DROP POLICY IF EXISTS` pour supprimer l'ancienne politique
2. `CREATE POLICY` pour créer la nouvelle

## Fichiers de backup

Chaque fichier modifié est sauvegardé avec l'extension `.bak` avant modification.
