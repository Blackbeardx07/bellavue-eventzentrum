# Firebase User Setup - Admin und Mitarbeiter anlegen

## Wichtiger Schritt: User in Firebase Authentication anlegen

Die App verwendet jetzt Firebase Authentication mit Email/Password. Die User müssen **vor dem ersten Login** in Firebase angelegt werden.

## Schritt 1: Email/Password Authentication aktivieren

1. Gehe zu: https://console.firebase.google.com/project/bellavue-eventzentrum/authentication/providers
2. Klicke auf **"E-Mail/Passwort"** (Email/Password)
3. Aktiviere **"E-Mail/Passwort aktivieren"** (Enable Email/Password)
4. Aktiviere auch **"E-Mail-Link (Passwortlose Anmeldung)"** NICHT - das brauchen wir nicht
5. Klicke auf **"Speichern"**

## Schritt 2: User in Firebase Console anlegen

### Admin User anlegen:

1. Gehe zu: https://console.firebase.google.com/project/bellavue-eventzentrum/authentication/users
2. Klicke auf **"Benutzer hinzufügen"** (Add user)
3. **E-Mail-Adresse:** `admin@bellavue-eventzentrum.de`
4. **Passwort:** `BellavueNokta2025#`
5. Klicke auf **"Benutzer hinzufügen"**

### Mitarbeiter User anlegen:

1. Klicke erneut auf **"Benutzer hinzufügen"** (Add user)
2. **E-Mail-Adresse:** `mitarbeiter@bellavue-eventzentrum.de`
3. **Passwort:** `BellavueMitarbeiter2025#`
4. Klicke auf **"Benutzer hinzufügen"**

## Schritt 3: User-Dokumente in Firestore erstellen

Nach dem Anlegen der User in Authentication müssen die User-Dokumente in Firestore erstellt werden.

**Option A: Automatisch beim ersten Login**
- Die App erstellt die User-Dokumente automatisch beim ersten Login
- Die Rolle wird basierend auf dem Login-Credentials gesetzt

**Option B: Manuell in Firestore erstellen**

1. Gehe zu: https://console.firebase.google.com/project/bellavue-eventzentrum/firestore/data
2. Klicke auf **"Sammlung starten"** (Start collection)
3. **Collection ID:** `users`
4. **Document ID:** Die UID des Admin-Users (aus Authentication kopieren)
5. Füge folgende Felder hinzu:
   - `email` (string): `admin@bellavue-eventzentrum.de`
   - `role` (string): `admin`
   - `createdAt` (string): Aktuelles Datum
6. Wiederhole für Mitarbeiter-User:
   - **Document ID:** Die UID des Mitarbeiter-Users
   - `email` (string): `mitarbeiter@bellavue-eventzentrum.de`
   - `role` (string): `user`
   - `createdAt` (string): Aktuelles Datum

## Schritt 4: Security Rules in Firebase Console einfügen

1. Gehe zu: https://console.firebase.google.com/project/bellavue-eventzentrum/firestore/rules
2. Kopiere den Inhalt aus `firestore.rules` (die neue Version mit Rollenprüfung)
3. Füge die Rules ein
4. Klicke auf **"Veröffentlichen"**

## Schritt 5: Login testen

1. Öffne die App
2. Admin-Login:
   - Benutzername: `admin`
   - Passwort: `BellavueNokta2025#`
3. Mitarbeiter-Login:
   - Benutzername: `mitarbeiter`
   - Passwort: `BellavueMitarbeiter2025#`

## Sicherheit

- **Nur eingeloggte Benutzer** können auf die App zugreifen
- **Admin** kann Events und Customers lesen UND schreiben
- **Mitarbeiter** kann Events und Customers nur LESEN
- **Keine Authentifizierung** = Kein Zugriff auf die App

## Wichtig

- Die Email-Adressen müssen exakt so sein: `admin@bellavue-eventzentrum.de` und `mitarbeiter@bellavue-eventzentrum.de`
- Die Passwörter müssen exakt sein (siehe oben)
- Die User müssen in Firebase Authentication UND Firestore existieren

