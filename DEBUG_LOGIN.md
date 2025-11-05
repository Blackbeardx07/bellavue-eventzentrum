# Login-Problem beheben

## Schritt 1: UID in Firebase Authentication prüfen

1. Gehe zu: https://console.firebase.google.com/project/bellavue-eventzentrum/authentication/users
2. Finde den User `Info@bellavue-event.de`
3. **Kopiere die UID** (steht in der Spalte "Nutzer-UID")
4. Die UID sollte sein: `Z7YGnjmgXFUyvxnMHVPREqBGjHJ3`

## Schritt 2: Document ID in Firestore prüfen

1. Gehe zu: https://console.firebase.google.com/project/bellavue-eventzentrum/firestore/data
2. Öffne die `users` Collection
3. Prüfe, ob ein Dokument mit der ID `Z7YGnjmgXFUyvxnMHVPREqBGjHJ3` existiert
4. Falls nicht: Erstelle es mit:
   - Document ID: `Z7YGnjmgXFUyvxnMHVPREqBGjHJ3` (die UID aus Schritt 1)
   - Felder:
     - `email`: `Info@bellavue-event.de` (genau wie in Firebase Authentication)
     - `role`: `admin`
     - `createdAt`: `2025-11-05`

## Schritt 3: Browser-Konsole prüfen

1. Öffne die App
2. Drücke F12 (Browser-Konsole öffnen)
3. Gehe zum Tab "Console"
4. Versuche dich anzumelden
5. Prüfe die Fehlermeldungen in der Konsole
6. Kopiere die Fehlermeldungen und sende sie mir

## Schritt 4: Passwort zurücksetzen (falls nötig)

Falls das Passwort falsch ist:
1. Gehe zu: https://console.firebase.google.com/project/bellavue-eventzentrum/authentication/users
2. Klicke auf den User `Info@bellavue-event.de`
3. Klicke auf "Passwort zurücksetzen" oder "Passwort ändern"
4. Setze ein neues Passwort

## Wichtig:

- Die Document ID in Firestore MUSS exakt die UID aus Firebase Authentication sein
- Die Email in Firestore sollte exakt mit der Email in Firebase Authentication übereinstimmen
- Groß-/Kleinschreibung bei Email kann wichtig sein

