# Firestore Security Rules Setup

## Problem
"Missing or insufficient permissions" Fehler beim Speichern von Events

## Lösung
Die Firestore Security Rules müssen in Firebase Console hochgeladen werden.

## Option 1: Über Firebase Console (Empfohlen)

1. Gehe zu: https://console.firebase.google.com/project/bellavue-eventzentrum/firestore/rules
2. Kopiere den Inhalt aus `firestore.rules`
3. Füge die Rules in die Firebase Console ein
4. Klicke auf "Veröffentlichen" (Publish)

## Option 2: Über Firebase CLI

```bash
# Firebase CLI installieren (falls nicht vorhanden)
npm install -g firebase-tools

# Anmelden
firebase login

# Rules deployen
firebase deploy --only firestore:rules
```

## Rules Inhalt

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Events Collection - Erlaube anonymen Benutzern alles
    match /events/{eventId} {
      allow read, write: if request.auth != null;
    }
    
    // Customers Collection - Erlaube anonymen Benutzern alles
    match /customers/{customerId} {
      allow read, write: if request.auth != null;
    }
    
    // Alle anderen Collections blockieren
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Wichtig
- `request.auth != null` bedeutet: Jeder authentifizierte Benutzer (auch anonym) kann lesen/schreiben
- Die anonyme Authentifizierung wird bereits in `App.tsx` durchgeführt
- Nach dem Deployen der Rules sollte der Fehler behoben sein

