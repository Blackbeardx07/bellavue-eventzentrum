# Eventzentrum Verwaltungs-App

Eine interne Verwaltungs-App für Eventzentren, entwickelt mit React und Material-UI.

## Funktionen

### 1. Kalenderansicht
- Monats- und Wochenübersicht aller Events
- Farbliche Statuskodierung (Gelb = geplant, Grün = bestätigt, Rot = abgesagt)
- Neue Events durch Klick auf ein Datum erstellen
- Such- und Filterleiste für Kunden, Räume, Status und Zeitraum

### 2. Event-Detailansicht
- Titel, Uhrzeit, Raum und zugeordneter Kunde
- Beschreibungsfeld für Abläufe und Besonderheiten
- Dateiablage für Verträge, Ablaufpläne und Checklisten
- Zuweisung von verantwortlichen Mitarbeitern
- Statusänderung und Kommentarfunktion

### 3. Kundendatenbank
- Kundenliste mit Such- und Filterfunktionen
- Detailansicht mit Kontaktdaten
- Event-Historie
- Verträge und Sondervereinbarungen
- Tagging-System (VIP, Stammkunde, etc.)

## Technologien

- React 18
- TypeScript
- Material-UI
- React Router
- date-fns
- Vite

## Installation

1. Repository klonen:
```bash
git clone [repository-url]
```

2. Abhängigkeiten installieren:
```bash
npm install
```

3. Entwicklungsserver starten:
```bash
npm run dev
```

## Entwicklung

Die App ist in folgende Hauptkomponenten aufgeteilt:

- `src/pages/`: Hauptseiten (Kalender, Event-Details, Kundenliste, Kunden-Details)
- `src/components/`: Wiederverwendbare UI-Komponenten
- `src/layouts/`: Layout-Komponenten
- `src/types/`: TypeScript-Typdefinitionen
- `src/theme.ts`: Material-UI Theme-Konfiguration

## TODO

- [ ] Backend-Integration
- [ ] Authentifizierung
- [ ] Datei-Upload-Funktionalität
- [ ] E-Mail-Benachrichtigungen
- [ ] Export-Funktionen
- [ ] Berichte und Statistiken
