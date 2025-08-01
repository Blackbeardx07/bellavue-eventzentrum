import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Box,
  Typography,
  Divider,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { Event, Customer } from '../types';

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: Omit<Event, 'id'>, customer: Omit<Customer, 'id'>) => void;
  initialDate?: Date;
}

const EventForm: React.FC<EventFormProps> = ({ open, onClose, onSubmit, initialDate }) => {
  const [formData, setFormData] = useState({
    // Allgemeine Informationen
    customerName: '',
    personCount: '',
    eventType: '',
    eventsaal1: false,
    eventsaal2: false,
    eventDate: initialDate || new Date(),
    weekday: '',
    
    // Leistungen
    rundeTische: false,
    eckigeTische: false,
    haehnchengeschnetzeltes: false,
    rindergulasch: false,
    reisGemuese: false,
    salat: false,
    halbesHaehnchen: false,
    vorspeisenBrot: false,
    obstteller: false,
    nachtisch: false,
    teeKaffee: false,
    softgetraenke: false,
    hochzeitstorte: false,
    kabernebeer: false,
    
    // Allgemeiner Service
    band: false,
    dj: false,
    kameraKranOhne: false,
    kameraKranMit: false,
    davulZurnaOhne: false,
    davulZurnaMit: false,
    saalDekoration: false,
    feuerwerkBodennebel: false,
    
    // Kostenübersicht
    mietzahlung: '',
    servicezahlung: '',
    gesamtzahlung: '',
    anzahlung: '',
    restzahlung: '',
    
    // Extras
    goldEingangsfeuerwerk: false,
    helikopterlandung: false,
    feuerwerkEingang: false,
    dekorVintage: false,
    dekorPlatin: false,
    obstKuchenbuffet: false,
    mezeBuffet: false,
    cigkoefte: false,
    vegetarischesBuffet: false,
    suppeHauptgang: false,
    cocktailEmpfang: false,
    
    // Unterschrift
    signature: ''
  });

  const handleSubmit = () => {
    // Event-Objekt
    const newEvent: Omit<Event, 'id'> = {
      title: `${formData.customerName} - ${formData.eventType}`,
      date: formData.eventDate.toISOString().split('T')[0],
      time: '16:00-24:00',
      room: `${formData.eventsaal1 ? 'Eventsaal 1' : ''}${formData.eventsaal1 && formData.eventsaal2 ? ', ' : ''}${formData.eventsaal2 ? 'Eventsaal 2' : ''}`,
      status: 'planned',
      customerId: '',
      customer: formData.customerName,
      description: `Veranstaltungsart: ${formData.eventType}\nAnzahl Personen: ${formData.personCount}\nWochentag: ${formData.weekday}`,
      files: [],
      assignedStaff: [],
      comments: [],
      guestCount: formData.personCount,
      kosten: formData.gesamtzahlung,
      specialRequirements: '',
      notes: '',
      eventTypes: [formData.eventType],
      preferences: {
        catering: true,
        decoration: formData.saalDekoration,
        music: formData.band || formData.dj,
        photography: formData.kameraKranOhne || formData.kameraKranMit
      }
    };

    // Customer-Objekt
    const newCustomer: Omit<Customer, 'id'> = {
      name: formData.customerName,
      email: '',
      phone: '',
      address: '',
      events: [],
      tags: [],
      notes: `Veranstaltungsart: ${formData.eventType}\nAnzahl Personen: ${formData.personCount}`,
      contactPerson: '',
      company: '',
      website: '',
      vatNumber: '',
      birthday: '',
      anniversary: '',
      budget: formData.gesamtzahlung,
      guestCount: formData.personCount,
      specialRequirements: '',
      preferences: {
        catering: true,
        decoration: formData.saalDekoration,
        music: formData.band || formData.dj,
        photography: formData.kameraKranOhne || formData.kameraKranMit
      }
    };

    onSubmit(newEvent, newCustomer);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      customerName: '',
      personCount: '',
      eventType: '',
      eventsaal1: false,
      eventsaal2: false,
      eventDate: initialDate || new Date(),
      weekday: '',
      rundeTische: false,
      eckigeTische: false,
      haehnchengeschnetzeltes: false,
      rindergulasch: false,
      reisGemuese: false,
      salat: false,
      halbesHaehnchen: false,
      vorspeisenBrot: false,
      obstteller: false,
      nachtisch: false,
      teeKaffee: false,
      softgetraenke: false,
      hochzeitstorte: false,
      kabernebeer: false,
      band: false,
      dj: false,
      kameraKranOhne: false,
      kameraKranMit: false,
      davulZurnaOhne: false,
      davulZurnaMit: false,
      saalDekoration: false,
      feuerwerkBodennebel: false,
      mietzahlung: '',
      servicezahlung: '',
      gesamtzahlung: '',
      anzahlung: '',
      restzahlung: '',
      goldEingangsfeuerwerk: false,
      helikopterlandung: false,
      feuerwerkEingang: false,
      dekorVintage: false,
      dekorPlatin: false,
      obstKuchenbuffet: false,
      mezeBuffet: false,
      cigkoefte: false,
      vegetarischesBuffet: false,
      suppeHauptgang: false,
      cocktailEmpfang: false,
      signature: ''
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Veranstaltungs-Service - Neues Event</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          
          {/* Allgemeine Informationen */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
            Allgemeine Informationen
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Name Kunde"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                required
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Anzahl Personen"
                type="number"
                value={formData.personCount}
                onChange={(e) => setFormData(prev => ({ ...prev, personCount: e.target.value }))}
                required
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Veranstaltungsart"
                value={formData.eventType}
                onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
                required
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Wochentag"
                value={formData.weekday}
                onChange={(e) => setFormData(prev => ({ ...prev, weekday: e.target.value }))}
              />
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Eventsaal (Checkbox-Auswahl):
            </Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.eventsaal1}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventsaal1: e.target.checked }))}
                  />
                }
                label="Eventsaal 1"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.eventsaal2}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventsaal2: e.target.checked }))}
                  />
                }
                label="Eventsaal 2"
              />
            </FormGroup>
          </Box>

          <Box sx={{ mb: 3 }}>
            <DatePicker
              label="Veranstaltungsdatum"
              value={formData.eventDate}
              onChange={(newValue) => setFormData(prev => ({ ...prev, eventDate: newValue || new Date() }))}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Leistungen */}
          <Typography variant="h6" gutterBottom>
            Leistungen (Mehrfachauswahl per Checkbox)
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 4, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.rundeTische}
                      onChange={(e) => setFormData(prev => ({ ...prev, rundeTische: e.target.checked }))}
                    />
                  }
                  label="Runde Tische"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.eckigeTische}
                      onChange={(e) => setFormData(prev => ({ ...prev, eckigeTische: e.target.checked }))}
                    />
                  }
                  label="Eckige Tische"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.haehnchengeschnetzeltes}
                      onChange={(e) => setFormData(prev => ({ ...prev, haehnchengeschnetzeltes: e.target.checked }))}
                    />
                  }
                  label="Hähnchengeschnetzeltes (Tischservice)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.rindergulasch}
                      onChange={(e) => setFormData(prev => ({ ...prev, rindergulasch: e.target.checked }))}
                    />
                  }
                  label="Rindergulasch (Tischservice)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.reisGemuese}
                      onChange={(e) => setFormData(prev => ({ ...prev, reisGemuese: e.target.checked }))}
                    />
                  }
                  label="Reis & Gemüse (Tischservice)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.salat}
                      onChange={(e) => setFormData(prev => ({ ...prev, salat: e.target.checked }))}
                    />
                  }
                  label="Salat entsprechend der Jahreszeit (Tischservice)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.halbesHaehnchen}
                      onChange={(e) => setFormData(prev => ({ ...prev, halbesHaehnchen: e.target.checked }))}
                    />
                  }
                  label="Halbes Hähnchen (Tischservice)"
                />
              </FormGroup>
            </Box>
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.vorspeisenBrot}
                      onChange={(e) => setFormData(prev => ({ ...prev, vorspeisenBrot: e.target.checked }))}
                    />
                  }
                  label="3 Sorten Vorspeisen und Brot (Meze) – Tischservice"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.obstteller}
                      onChange={(e) => setFormData(prev => ({ ...prev, obstteller: e.target.checked }))}
                    />
                  }
                  label="Obstteller (Tischservice)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.nachtisch}
                      onChange={(e) => setFormData(prev => ({ ...prev, nachtisch: e.target.checked }))}
                    />
                  }
                  label="Nachtisch (z. B. Baklava pro Tisch – 1 Teller)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.teeKaffee}
                      onChange={(e) => setFormData(prev => ({ ...prev, teeKaffee: e.target.checked }))}
                    />
                  }
                  label="Tee & Kaffeeservice"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.softgetraenke}
                      onChange={(e) => setFormData(prev => ({ ...prev, softgetraenke: e.target.checked }))}
                    />
                  }
                  label="Softgetränke & Mineralwasser (ohne Limit)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hochzeitstorte}
                      onChange={(e) => setFormData(prev => ({ ...prev, hochzeitstorte: e.target.checked }))}
                    />
                  }
                  label="Hochzeitstorte (4–5 Etagen, Pyramidenform)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.kabernebeer}
                      onChange={(e) => setFormData(prev => ({ ...prev, kabernebeer: e.target.checked }))}
                    />
                  }
                  label="Kabernebeer (Cerez) – Tischservice"
                />
              </FormGroup>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Allgemeiner Service */}
          <Typography variant="h6" gutterBottom>
            Allgemeiner Service
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 4, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.band}
                      onChange={(e) => setFormData(prev => ({ ...prev, band: e.target.checked }))}
                    />
                  }
                  label="Band"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.dj}
                      onChange={(e) => setFormData(prev => ({ ...prev, dj: e.target.checked }))}
                    />
                  }
                  label="DJ"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.kameraKranOhne}
                      onChange={(e) => setFormData(prev => ({ ...prev, kameraKranOhne: e.target.checked }))}
                    />
                  }
                  label="1× Kamera-Kran HD (ohne Brautabholung)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.kameraKranMit}
                      onChange={(e) => setFormData(prev => ({ ...prev, kameraKranMit: e.target.checked }))}
                    />
                  }
                  label="1× Kamera-Kran HD (mit Brautabholung)"
                />
              </FormGroup>
            </Box>
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.davulZurnaOhne}
                      onChange={(e) => setFormData(prev => ({ ...prev, davulZurnaOhne: e.target.checked }))}
                    />
                  }
                  label="1× Davul & Zurna (4–5 Std. im Saal)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.davulZurnaMit}
                      onChange={(e) => setFormData(prev => ({ ...prev, davulZurnaMit: e.target.checked }))}
                    />
                  }
                  label="1× Davul & Zurna (inkl. Brautabholung und 4–5 Std. im Saal)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.saalDekoration}
                      onChange={(e) => setFormData(prev => ({ ...prev, saalDekoration: e.target.checked }))}
                    />
                  }
                  label="Saal- & Tischdekoration"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.feuerwerkBodennebel}
                      onChange={(e) => setFormData(prev => ({ ...prev, feuerwerkBodennebel: e.target.checked }))}
                    />
                  }
                  label="Feuerwerk & Bodennebel (für den 1. Tanz)"
                />
              </FormGroup>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Veranstaltungszeit */}
          <Typography variant="h6" gutterBottom>
            Veranstaltungszeit
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Feste Zeit: 16:00 Uhr bis 24:00 Uhr
            </Typography>
            <Typography variant="body2">
              Nach 24:00 Uhr ist für jede weitere angefangene Stunde eine zusätzliche Gebühr von 500 € fällig (zusätzlich zur Saalmiete).
            </Typography>
          </Alert>

          <Divider sx={{ my: 3 }} />

          {/* Kostenübersicht */}
          <Typography variant="h6" gutterBottom>
            Kostenübersicht
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <TextField
                fullWidth
                label="Mietzahlung (€)"
                type="number"
                value={formData.mietzahlung}
                onChange={(e) => setFormData(prev => ({ ...prev, mietzahlung: e.target.value }))}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <TextField
                fullWidth
                label="Servicezahlung (€)"
                type="number"
                value={formData.servicezahlung}
                onChange={(e) => setFormData(prev => ({ ...prev, servicezahlung: e.target.value }))}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <TextField
                fullWidth
                label="Gesamtzahlung (€)"
                type="number"
                value={formData.gesamtzahlung}
                onChange={(e) => setFormData(prev => ({ ...prev, gesamtzahlung: e.target.value }))}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <TextField
                fullWidth
                label="Anzahlung (€)"
                type="number"
                value={formData.anzahlung}
                onChange={(e) => setFormData(prev => ({ ...prev, anzahlung: e.target.value }))}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <TextField
                fullWidth
                label="Restzahlung (€)"
                type="number"
                value={formData.restzahlung}
                onChange={(e) => setFormData(prev => ({ ...prev, restzahlung: e.target.value }))}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Extras / Zusatzleistungen */}
          <Typography variant="h6" gutterBottom>
            Extras / Zusatzleistungen (Checkbox-Mehrfachauswahl)
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 4, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.goldEingangsfeuerwerk}
                      onChange={(e) => setFormData(prev => ({ ...prev, goldEingangsfeuerwerk: e.target.checked }))}
                    />
                  }
                  label="Gold- & Eingangsfeuerwerk (2 Stück), 4× Bodennebel, 1. Tanz Feuerwerk – 300 €"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.helikopterlandung}
                      onChange={(e) => setFormData(prev => ({ ...prev, helikopterlandung: e.target.checked }))}
                    />
                  }
                  label="Helikopterlandung auf Parkplatz – 2.000 €"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.feuerwerkEingang}
                      onChange={(e) => setFormData(prev => ({ ...prev, feuerwerkEingang: e.target.checked }))}
                    />
                  }
                  label="Feuerwerk beim Eingang, 1. Tanz, Kuchen – 1.000 €"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.dekorVintage}
                      onChange={(e) => setFormData(prev => ({ ...prev, dekorVintage: e.target.checked }))}
                    />
                  }
                  label="Dekor 'Vintage' – 400 € (inkl. Silbervasen & Kerzen)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.dekorPlatin}
                      onChange={(e) => setFormData(prev => ({ ...prev, dekorPlatin: e.target.checked }))}
                    />
                  }
                  label="Dekor 'Platin' – 600 € (inkl. 9 Kerzenständer & Vasen)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.obstKuchenbuffet}
                      onChange={(e) => setFormData(prev => ({ ...prev, obstKuchenbuffet: e.target.checked }))}
                    />
                  }
                  label="Obst- & Kuchenbuffet inkl. Tatlı – 1.500 € (max. 300 Pers.)"
                />
              </FormGroup>
            </Box>
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.mezeBuffet}
                      onChange={(e) => setFormData(prev => ({ ...prev, mezeBuffet: e.target.checked }))}
                    />
                  }
                  label="Meze-Buffet mit Hauptgang – 1.250 €, je 100 Pers. extra +150 €"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.cigkoefte}
                      onChange={(e) => setFormData(prev => ({ ...prev, cigkoefte: e.target.checked }))}
                    />
                  }
                  label="Çiğköfte (Tischservice) für 1.000 Personen – 1.500 €, +150 €/weitere 100 Pers."
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.vegetarischesBuffet}
                      onChange={(e) => setFormData(prev => ({ ...prev, vegetarischesBuffet: e.target.checked }))}
                    />
                  }
                  label="Vegetarisches Buffet (4 Sorten Menü) – 500 €"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.suppeHauptgang}
                      onChange={(e) => setFormData(prev => ({ ...prev, suppeHauptgang: e.target.checked }))}
                    />
                  }
                  label="Suppe vor Hauptgang (Tischservice) – 2.100 € für 700 Pers."
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.cocktailEmpfang}
                      onChange={(e) => setFormData(prev => ({ ...prev, cocktailEmpfang: e.target.checked }))}
                    />
                  }
                  label="Cocktail-Empfang (alkoholfrei, 2 Std., max. 1.000 Pers.) – 1.200 €"
                />
              </FormGroup>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Hinweise */}
          <Typography variant="h6" gutterBottom>
            Hinweise
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" component="div">
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Kein Vorsteuerabzug möglich.</li>
                <li>Bei Absage durch den Kunden (auch bei Todesfällen) wird die Anzahlung nicht erstattet.</li>
                <li>Veranstalter kann bei Absage Strafzahlungen verlangen.</li>
                <li>Höhere Gewalt kann zur Absage führen.</li>
                <li>Mieter muss selbst eine Eventversicherung (z. B. Hansa Merkur) abschließen.</li>
              </ul>
            </Typography>
          </Alert>

          <Divider sx={{ my: 3 }} />

          {/* Datum & Unterschrift */}
          <Typography variant="h6" gutterBottom>
            Datum & Unterschrift
          </Typography>
          
          <TextField
            fullWidth
            label="Unterschrift"
            multiline
            rows={3}
            value={formData.signature}
            onChange={(e) => setFormData(prev => ({ ...prev, signature: e.target.value }))}
            placeholder="Hier können Sie Ihre Unterschrift eingeben oder Notizen hinzufügen..."
          />

        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Abbrechen</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={
            !formData.customerName.trim() ||
            !formData.personCount.trim() ||
            !formData.eventType.trim() ||
            (!formData.eventsaal1 && !formData.eventsaal2)
          }
        >
          Event erstellen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventForm; 