# Alternative Lösung: Security Rules ohne Authentifizierung

## Problem
Die anonyme Authentifizierung kann nicht gefunden/aktiviert werden.

## Lösung
Wir ändern die Security Rules so, dass sie auch ohne Authentifizierung funktionieren.

**⚠️ WICHTIG:** Diese Lösung ist weniger sicher, aber für interne Apps akzeptabel.

## Schritt 1: Neue Security Rules in Firebase Console einfügen

1. Gehe zu: https://console.firebase.google.com/project/bellavue-eventzentrum/firestore/rules
2. Ersetze die aktuellen Rules mit folgendem Code:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Events Collection - Erlaube Lese- und Schreibzugriff
    match /events/{eventId} {
      allow read, write: if true;
    }
    
    // Customers Collection - Erlaube Lese- und Schreibzugriff
    match /customers/{customerId} {
      allow read, write: if true;
    }
    
    // Alle anderen Collections blockieren
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Klicke auf **"Veröffentlichen"** (Publish)

## Schritt 2: App testen

Nach dem Veröffentlichen sollte die App ohne Fehler Events speichern können.

## Alternative: Anonyme Authentifizierung später aktivieren

Falls du die anonyme Authentifizierung später aktivieren möchtest:

1. In der Firebase Console: Authentication → Sign-in method (oder auf Deutsch: Anmeldeverfahren)
2. Scrolle nach unten zu den weniger verwendeten Anbietern
3. Suche nach "Anonymous" oder "Anonym"
4. Klicke darauf und aktiviere es

Dann können wir die Rules wieder auf `if request.auth != null` ändern.

