# Edge Functions en quarantaine

Ce répertoire contient des Edge Functions **désactivées** pendant la Phase 0
de la refonte TopRéparateurs.fr.

## Pourquoi ici ?

Ces fonctions touchent au flux de paiement/abonnement et sont conservées pour
être **refondues proprement en Phase 3** (Stripe Billing abonnements
réparateurs), après correction des vulnérabilités de sécurité identifiées lors
de l'audit mars 2026 (3/10) :

| Fonction | Problème identifié | Phase de remédiation |
|---|---|---|
| `create-subscription` | **AUCUNE vérification JWT** — n'importe qui peut créer une souscription pour n'importe quel réparateur (D3) | Phase 3 |
| `create-payment-intent` | CORS wildcard `*` sur endpoint de paiement (D4) | Phase 3 |
| `stripe-webhooks` | Vérification minimale de la signature — n'utilise pas `stripe.webhooks.constructEvent()` (D6) | Phase 3 |

## Ne PAS déployer

- `supabase functions deploy` ne doit **pas** être lancé depuis ce répertoire
- Le répertoire `_disabled/` est ignoré par la convention Supabase (noms
  commençant par `_`)
- Vérifier avec `supabase functions list` après le prochain deploy qu'elles
  n'apparaissent plus côté projet

## Réactivation Phase 3

Avant réactivation, impératif :
1. Ajouter `auth.getUser()` + vérification rôle réparateur dans
   `create-subscription`
2. Restreindre le CORS aux domaines `topreparateurs.fr` uniquement
3. Utiliser `stripe.webhooks.constructEvent(body, sig, secret)` pour vérifier
   les webhooks Stripe
4. Couvrir chaque fonction avec un test d'intégration (JWT valide/invalide,
   signature Stripe valide/invalide)
