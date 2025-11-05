# Entwickler-User in Firestore erstellen

## User-Dokument für Entwickler erstellen

1. Gehe zu: https://console.firebase.google.com/project/bellavue-eventzentrum/firestore/data

2. Klicke auf **"Sammlung starten"** (Start collection) oder wähle die bestehende `users` Collection

3. Erstelle ein neues Dokument:
   - **Collection ID:** `users` (falls noch nicht vorhanden)
   - **Document ID:** `kKLW0lmgwjRPZqRroezsMMSxYFF2` (die UID des Entwicklers)

4. Füge folgende Felder hinzu:
   - `email` (Typ: string, Wert: `volkanyildiz@hotmail.de`)
   - `role` (Typ: string, Wert: `admin`) - Als Entwickler solltest du Admin-Rechte haben
   - `createdAt` (Typ: string, Wert: `2025-01-29` oder aktuelles Datum)

5. Klicke auf **"Speichern"**

## In der App anmelden

Nach dem Erstellen des User-Dokuments kannst du dich in der App anmelden:

- **Benutzername:** `volkanyildiz@hotmail.de` (deine Email-Adresse)
- **Passwort:** Das Passwort, das du beim Erstellen des Users in Firebase Authentication festgelegt hast

## Wichtig

- Die Document ID MUSS die UID sein: `kKLW0lmgwjRPZqRroezsMMSxYFF2`
- Die Rolle sollte `admin` sein, damit du alle Funktionen nutzen kannst
- Falls du das Passwort vergessen hast, kannst du es in Firebase Authentication zurücksetzen

