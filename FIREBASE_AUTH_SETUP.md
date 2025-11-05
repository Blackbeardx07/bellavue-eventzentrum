# Firebase Authentifizierung Setup

## Problem
"Missing or insufficient permissions" Fehler beim Speichern von Events

## Lösung: Anonyme Authentifizierung aktivieren

Die anonyme Authentifizierung muss in Firebase Console aktiviert sein.

### Schritt 1: Anonyme Authentifizierung aktivieren

1. Gehe zu: https://console.firebase.google.com/project/bellavue-eventzentrum/authentication/providers
2. Klicke auf "Anonym" (Anonymous)
3. Aktiviere "Anonyme Authentifizierung aktivieren" (Enable Anonymous Authentication)
4. Klicke auf "Speichern" (Save)

### Schritt 2: Firestore Security Rules prüfen

1. Gehe zu: https://console.firebase.google.com/project/bellavue-eventzentrum/firestore/rules
2. Stelle sicher, dass folgende Rules vorhanden sind:

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

3. Klicke auf "Veröffentlichen" (Publish), falls die Rules noch nicht veröffentlicht wurden

### Schritt 3: App testen

1. Öffne die App in einem Browser
2. Öffne die Browser-Konsole (F12)
3. Prüfe, ob folgende Meldungen erscheinen:
   - "Setting up Firebase auth and listeners..."
   - "Anonymous authentication successful: [UID]"
   - "User authenticated: [UID]"

4. Versuche ein Event zu erstellen
5. Wenn der Fehler weiterhin auftritt, prüfe die Konsole auf detaillierte Fehlermeldungen

## Wichtig

- Die anonyme Authentifizierung muss aktiviert sein, bevor die App funktioniert
- Die Security Rules müssen veröffentlicht sein (nicht nur gespeichert)
- Nach Änderungen in Firebase Console kann es einige Sekunden dauern, bis sie wirksam werden

