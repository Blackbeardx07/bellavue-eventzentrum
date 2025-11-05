# Anonyme Authentifizierung aktivieren - Schritt für Schritt

## Navigation in Firebase Console

1. Du bist bereits auf der Authentication-Übersichtsseite
2. Klicke in der linken Seitenleiste auf **"Anmeldeverfahren"** oder **"Anbieter"** (Sign-in methods/Providers)
3. Oder gehe direkt zu: https://console.firebase.google.com/project/bellavue-eventzentrum/authentication/providers

## Anonyme Authentifizierung aktivieren

1. Suche in der Liste nach **"Anonym"** (Anonymous)
2. Klicke auf **"Anonym"**
3. Du siehst einen Schalter/Checkbox: **"Anonyme Authentifizierung aktivieren"** (Enable Anonymous Authentication)
4. **Aktiviere** den Schalter
5. Klicke auf **"Speichern"** (Save) oder **"Aktivieren"** (Enable)

## Verifizierung

Nach der Aktivierung sollte "Anonym" in der Liste der Anmeldeverfahren als aktiviert angezeigt werden.

## Wichtig

- Die anonyme Authentifizierung muss aktiviert sein, bevor die App Events speichern kann
- Nach der Aktivierung kann es einige Sekunden dauern, bis die Änderung wirksam wird
- Die App sollte dann automatisch anonyme Benutzer authentifizieren

