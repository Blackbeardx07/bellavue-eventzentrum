# Firestore Rules überprüfen

## Schritt 1: Firebase Login

Führe im Terminal aus:
```bash
firebase login
```

Dies öffnet einen Browser, wo du dich mit deinem Google-Konto anmelden kannst.

## Schritt 2: Rules Syntax prüfen

```bash
firebase deploy --only firestore:rules --dry-run
```

Dies prüft die Syntax ohne zu deployen.

## Schritt 3: Rules deployen (falls nötig)

```bash
firebase deploy --only firestore:rules
```

## Schritt 4: Rules in Firebase Console verifizieren

1. Gehe zu: https://console.firebase.google.com/project/bellavue-eventzentrum/firestore/rules
2. Prüfe, ob folgende Rules vorhanden sind:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      allow read, write: if request.auth != null;
    }
    match /customers/{customerId} {
      allow read, write: if request.auth != null;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Alternative: Script ausführen

```bash
./deploy-firestore-rules.sh
```

