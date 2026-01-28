# Protection Token Unique - Implémentation

## 🎯 Objectif

Empêcher les utilisateurs de "tricher" en se réinscrivant pour reset leur token unique et leur compteur de scarcity.

## ✅ Solution Implémentée

### **Comportement actuel :**

1. **Nouvel utilisateur (première inscription) :**
   - Token unique généré : `sv_1738123456_abc`
   - Champ `first_optin_date` créé : `2024-01-27T10:00:00Z`
   - Token et date sauvegardés dans MailerLite
   - Token retourné au frontend et sauvegardé dans localStorage

2. **Utilisateur existant (réinscription) :**
   - Frontend génère un nouveau token temporaire
   - Backend vérifie si l'email existe dans MailerLite
   - ✅ **Token ORIGINAL récupéré et réutilisé** (pas de nouveau token)
   - ✅ **Date `first_optin_date` ORIGINALE conservée**
   - Token original retourné au frontend
   - Frontend remplace le token temporaire par le token original dans localStorage

## 📋 Fichiers Modifiés

### 1. **Backend : `netlify/functions/subscribe.js`**

**Ajouts :**
- Fonction `getSubscriberByEmail(email, apiKey)` pour vérifier si un subscriber existe
- Logique dans Step 1 pour :
  - Vérifier l'existence du subscriber
  - Récupérer le token original s'il existe
  - Récupérer la date `first_optin_date` originale
  - Utiliser ces valeurs au lieu de créer de nouvelles

**Champs MailerLite gérés :**
- `unique_token_sv` : Token unique (conservé si existant)
- `first_optin_date` : Date de première inscription (conservée si existante)
- `name` : Prénom (peut être mis à jour)
- `step` : Étape du funnel (remis à '1' lors de réinscription)
- `avatar` / `tag` : Profil utilisateur (Step 2)
- `phone` : Téléphone (Step 3)
- `utm_source` / `utm_content` : Paramètres de tracking

### 2. **Frontend : `src/scripts/index.js`**

**Modifications dans `handleStep1()` :**
- Génération d'un token temporaire au lieu de le sauvegarder immédiatement
- Attente de la réponse du backend
- Utilisation du token retourné par le backend (original ou nouveau)
- Sauvegarde du token final dans localStorage
- Log du statut : nouvel utilisateur vs utilisateur existant

## 🔒 Garanties de Sécurité

### ✅ **Token original conservé**
Un utilisateur qui se réinscrit garde son token original avec le timestamp de sa première inscription.

### ✅ **Date d'inscription originale conservée**
Le champ `first_optin_date` n'est jamais écrasé après la première inscription.

### ✅ **Impossible de tricher**
Un utilisateur ne peut pas "reset" son compteur de scarcity en se réinscrivant.

### ✅ **Scarcity basée sur la vraie date**
Utilisez `first_optin_date` pour vos compteurs de scarcity dans les emails MailerLite.

## 📊 Scénarios de Test

### Scénario 1 : Nouvelle inscription

**Input :**
```javascript
email: "john@example.com" (nouveau)
name: "John"
```

**Backend :**
- Vérification : Email n'existe pas
- Token généré : `sv_1738123456_abc`
- `first_optin_date` créé : `2024-01-27T10:00:00Z`

**MailerLite :**
```json
{
  "email": "john@example.com",
  "fields": {
    "unique_token_sv": "sv_1738123456_abc",
    "first_optin_date": "2024-01-27T10:00:00Z",
    "name": "John",
    "step": "1"
  }
}
```

**Frontend :**
- Token sauvegardé dans localStorage : `sv_1738123456_abc`
- Log : "Nouvel email - Nouveau token créé"

---

### Scénario 2 : Réinscription (7 jours plus tard)

**Input :**
```javascript
email: "john@example.com" (existe déjà depuis le 20/01)
name: "John Doe" (prénom changé)
```

**Backend :**
- Vérification : Email existe ✅
- Token original récupéré : `sv_1737345600_old`
- Date originale récupérée : `2024-01-20T10:00:00Z`
- Token temporaire du frontend IGNORÉ

**MailerLite :**
```json
{
  "email": "john@example.com",
  "fields": {
    "unique_token_sv": "sv_1737345600_old",  // ✅ ORIGINAL conservé
    "first_optin_date": "2024-01-20T10:00:00Z",  // ✅ ORIGINAL conservé
    "name": "John Doe",  // Mis à jour
    "step": "1"  // Remis à 1
  }
}
```

**Frontend :**
- Token original sauvegardé dans localStorage : `sv_1737345600_old`
- Log : "Email existant - Token original conservé"

## 📧 Utilisation dans les Emails MailerLite

Pour afficher la scarcity basée sur la vraie date d'inscription :

```liquid
<!-- Nombre de jours depuis l'inscription -->
{{ subscriber.fields.first_optin_date | date_diff: 'now', 'days' }}

<!-- Exemple : "Il vous reste X jours" -->
{% assign days_since_optin = subscriber.fields.first_optin_date | date_diff: 'now', 'days' %}
{% assign days_remaining = 7 | minus: days_since_optin %}

Il vous reste {{ days_remaining }} jours pour profiter de l'offre !
```

## 🧪 Comment Tester

### Test 1 : Nouvelle inscription
1. Aller sur `/inscription`
2. S'inscrire avec un nouvel email
3. Console : Vérifier que le token est créé
4. MailerLite : Vérifier que `unique_token_sv` et `first_optin_date` existent

### Test 2 : Réinscription
1. Utiliser le même email que Test 1
2. Se réinscrire (même flow)
3. Console : Vérifier "Email existant - Token original conservé"
4. MailerLite : Vérifier que le token et la date n'ont PAS changé
5. localStorage : Vérifier que le token original est sauvegardé

### Test 3 : Cross-device
1. S'inscrire sur Desktop
2. Cliquer sur un lien email depuis Mobile (avec `?token=xxx`)
3. Token original doit être sauvegardé sur Mobile aussi
4. Vérifier que la date `first_optin_date` reste inchangée

## 📝 Notes Techniques

### API MailerLite utilisée

**GET Subscriber :**
```
GET /api/subscribers/{email}
Authorization: Bearer {API_KEY}
```

**POST/Update Subscriber (Upsert) :**
```
POST /api/subscribers
Authorization: Bearer {API_KEY}
Content-Type: application/json

{
  "email": "user@example.com",
  "fields": { ... }
}
```

### Logs Backend

Le backend log les informations suivantes :
- `Processing step X for email: ...`
- `Subscriber already exists for X, preserving original token`
- `Using original token: sv_xxx` ou `No original token found, using new token`
- `Preserving original first_optin_date: ...`
- `New subscriber for X, using new token`

### Logs Frontend

Le frontend log :
- `[Step 1] Token unique généré (temporaire): sv_xxx`
- `[Step 1] Email existant - Token original conservé: sv_xxx`
- `[Step 1] Nouvel email - Nouveau token créé: sv_xxx`

## ✨ Résultat Final

- ✅ Token original **TOUJOURS conservé** lors de réinscriptions
- ✅ Date `first_optin_date` **JAMAIS écrasée**
- ✅ Scarcity **basée sur la vraie date d'inscription**
- ✅ **Impossible de tricher** en se réinscrivant
- ✅ **Cross-device** : Token fonctionne sur tous les appareils via emails
- ✅ **Backward compatible** : Les anciens subscribers sans `first_optin_date` en reçoivent un à leur prochaine interaction

---

**Date d'implémentation :** 27 janvier 2026
**Version :** 1.0
