import React, { useState, useRef } from 'react';
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
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Event, Customer } from '../types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { customerService } from '../firebase/firestore';

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (event: Omit<Event, 'id'>, customer: Omit<Customer, 'id'>) => void; // Optional, da wir direkt in Firebase speichern
  initialDate?: Date;
}

const EventForm: React.FC<EventFormProps> = ({ open, onClose, onSubmit: _onSubmit, initialDate }) => {
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    // Persönliche Kundeninformationen
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    mobile: '',
    streetAndNumber: '',
    zipAndCity: '',
    addressBride: '',
    addressGroom: '',
    nationalityBride: '',
    nationalityGroom: '',
    ageBride: '',
    ageGroom: '',
    notes: '',
    
    // Event Details
    personenanzahl: '',
    veranstaltungsart: '',
    eventsaal1: false,
    eventsaal2: false,
    eventDate: initialDate || new Date(),
    wochentag: '',
    
    // Kostenübersicht
    angebotssumme: '',
    saalmiete: '',
    service: '',
    gesamtpreis: '',
    anzahlung: '',
    restzahlung: '',
    
    // Tischaufstellung
    rundeTische: false,
    eckigeTische: false,
    
    // Essen & Catering
    etSoteHaehnchengeschnetzeltes: false,
    tavukSoteRindergulasch: false,
    halbesHaehnchen: false,
    reis: false,
    gemuese: false,
    salatJahreszeit: false,
    pommesSalzkartoffel: false,
    antipastiVorspeisenBrot: false,
    knabbereienCerez: false,
    obstschale: false,
    nachtischBaklava: false,
    
    // Getränke
    teeKaffeeservice: false,
    softgetraenkeMineralwasser: false,
    
    // Torte
    hochzeitstorte3Etagen: false,
    hochzeitstorteFlach: false,
    
    // Service
    standardDekoration: false,
    serviceAllgemein: false,
    bandDj: false,
    
    // Video & Fotografie
    videoKameraKranHDOhne: false,
    videoKameraKranHDMit: false,
    videoKameraKranHDMitBrautigam: false,
    fotoshootingUSB: false,
    weddingStoryClip: false,
    fotoalbum: false,
    
    // Musik
    davulZurna4Stunden: false,
    davulZurnaMitBrautabholung: false,
    
    // Dekoration & Effekte
    saeulenabgrenzungBlumenFeuerwerk: false,
    saeulenabgrenzungKuchenAnschneiden: false,
    eingangsfeuerwerkBrautpaar: false,
    
    // Extras
    helikopterlandung: false,
    obstKuchenbuffetTatli: false,
    cigkoefteTischservice: false,
    suppeHauptgang: false,
    cocktailEmpfang: false,
    
    // Unterschrift
    signature: '',
    angebotAngenommen: '',
    datumUnterschriftKunde: '',
    datumUnterschriftBellavue: ''
  });

  const generatePDF = async () => {
    if (!pdfRef.current) return;

    try {
      // Warten bis alle Inhalte geladen sind
      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: false,
        foreignObjectRendering: false,
        imageTimeout: 0,
        width: pdfRef.current.scrollWidth,
        height: pdfRef.current.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Berechne die Anzahl der benötigten Seiten
      const totalPages = Math.ceil(imgHeight / pageHeight);
      
      // Erste Seite
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Wenn mehr als eine Seite benötigt wird, erstelle weitere Seiten
      if (totalPages > 1) {
        for (let i = 1; i < totalPages; i++) {
          pdf.addPage();
          const yOffset = -(i * pageHeight);
          pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);
        }
      }

      return pdf;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  };

  const handleDownloadPDF = async () => {
    const pdf = await generatePDF();
    if (pdf) {
      const fileName = `BELLAVUE_Service_Angebot_${formData.firstName}_${formData.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    }
    handleCloseDownloadDialog(); // Schließe das Formular nach dem Download
  };

  const handlePrintPDF = async () => {
    const pdf = await generatePDF();
    if (pdf) {
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  const handleCloseDownloadDialog = () => {
    setShowDownloadDialog(false);
    // Formular zurücksetzen und schließen
    handleClose();
  };

  // Funktion zum Speichern des Events direkt in Firebase
  const handleEventSubmit = async (customerId: string) => {
    try {
      console.log('Speichere Event in Firebase...');
      // Mapping: Checkbox-Feld → Exakter Label-Text (inkl. End-Codes)
      const serviceLabels: Record<string, string> = {
        // Tischaufstellung
        rundeTische: 'Runde Tische',
        eckigeTische: 'Eckige Tische',
        
        // Essen & Catering
        etSoteHaehnchengeschnetzeltes: 'Et Sote / Hähnchengeschnetzeltes (Tischbuffet)',
        tavukSoteRindergulasch: 'Tavuk Sote / Rindergulasch (Tischbuffet)',
        halbesHaehnchen: 'Halbes Hähnchen (Tischservice)',
        reis: 'Reis (Tischbuffet)',
        gemuese: 'Gemüse (Tischbuffet) oder',
        salatJahreszeit: 'Salat entsprechend der Jahreszeit (Tischbuffet)',
        pommesSalzkartoffel: 'Pommes oder Salzkartoffel (Tischservice)',
        antipastiVorspeisenBrot: '3 Sorten Antipasti / Vorspeisen und Brot (Meze) als (Tischservice)',
        knabbereienCerez: 'Knabbereien (Cerez) (Tischservice)',
        obstschale: 'Obstschale mind. 4-5 Sorten Obst (Tischservice)',
        nachtischBaklava: 'Nachtisch (z.B Baklava pro Tisch 1- Teller) (Tischservice)',
        
        // Getränke
        teeKaffeeservice: 'Tee & Kaffeeservice (Tee & Kaffee Station und Service im Bistro)',
        softgetraenkeMineralwasser: 'Softgetränke und Mineralwasser (Tischservice ohne Limit)',
        
        // Torte
        hochzeitstorte3Etagen: 'Hochzeitstorte 3 Etagen (Geschmack nach Wahl) oder',
        hochzeitstorteFlach: 'Hochzeitstorte (flach) zum selber bestücken mit 5 Sorten Früchten',
        
        // Service
        standardDekoration: 'Standard Dekoration Saal sowie Tischdekoration',
        serviceAllgemein: 'Service im Allgemein',
        bandDj: 'Band & DJ',
        
        // Video & Fotografie
        videoKameraKranHDOhne: '3 x Video Kamera inkl. Kran HD (ohne Brautabholung)',
        videoKameraKranHDMit: '3 x Video Kamera inkl. Kran HD im Saal (inkl. Brautabholung) F 6.8',
        videoKameraKranHDMitBrautigam: '3 x Video Kamera inkl. Kran HD im Saal (inkl. Bräutigamabholung) S 5.8',
        fotoshootingUSB: 'Fotoshooting inkl. 35-40 Bilder auf USB Stick K 5.5',
        weddingStoryClip: 'Wedding Story (Clip) aus Brautabholung, Fotoshooting, 1. Tanz H 6.5',
        fotoalbum: 'Fotoalbum mit ca. 35 hochwertig gedruckte Bilder B 6.0',
        
        // Musik
        davulZurna4Stunden: '1x Davul & Zurna (4-5 Stunden nur im Saal) A 7.5',
        davulZurnaMitBrautabholung: '1x Davul & Zurna (inkl. Brautabholung und 4-5 Stunden im Saal) L 8.5',
        
        // Dekoration & Effekte
        saeulenabgrenzungBlumenFeuerwerk: 'Säulenabgrenzung mit Blumen, Feuerwerk, Bodennebel und Hochzeitslaser 4-6 Stk. (für den 1. Tanz) M 5.0',
        saeulenabgrenzungKuchenAnschneiden: 'Säulenabgrenzung mit Blumen, Feuerwerk, Bodennebel (4-6 Stk.) beim Kuchen Anschneiden W 4.0',
        eingangsfeuerwerkBrautpaar: 'Eingangsfeuerwerk für Brautpaar (8-10 Stk.) beim Betreten vom Saal D 5.0 (Nur in den Wintermonaten und bei Dunkelheit möglich)',
        
        // Extras
        helikopterlandung: 'Landung mit dem Helikopter auf dem Parkplatz des Eventzentrums F 28.0',
        obstKuchenbuffetTatli: 'Obst und Küchenbuffet inkl. Tatli als offenes Buffet nach dem Essen RK 0,20',
        cigkoefteTischservice: 'Cigköfte als Tischservice inkl. Blattsalat, Soße und Zitrone SR 0,20',
        suppeHauptgang: 'Suppe vor dem Hauptgang als Tischservice Mercimek, Yayla, Broccoli LA 0,27',
        cocktailEmpfang: 'Cocktail Empfang (Alkoholfrei ca. 2 Stunden am Haupteingang durch Kellner) TU 0,18'
      };

      // Services in Arrays gruppieren - EXAKTE Label-Texte verwenden
      const services = {
        tischaufstellung: [
          formData.rundeTische ? serviceLabels.rundeTische : '',
          formData.eckigeTische ? serviceLabels.eckigeTische : ''
        ].filter(Boolean),
        essenCatering: [
          formData.etSoteHaehnchengeschnetzeltes ? serviceLabels.etSoteHaehnchengeschnetzeltes : '',
          formData.tavukSoteRindergulasch ? serviceLabels.tavukSoteRindergulasch : '',
          formData.halbesHaehnchen ? serviceLabels.halbesHaehnchen : '',
          formData.reis ? serviceLabels.reis : '',
          formData.gemuese ? serviceLabels.gemuese : '',
          formData.salatJahreszeit ? serviceLabels.salatJahreszeit : '',
          formData.pommesSalzkartoffel ? serviceLabels.pommesSalzkartoffel : '',
          formData.antipastiVorspeisenBrot ? serviceLabels.antipastiVorspeisenBrot : '',
          formData.knabbereienCerez ? serviceLabels.knabbereienCerez : '',
          formData.obstschale ? serviceLabels.obstschale : '',
          formData.nachtischBaklava ? serviceLabels.nachtischBaklava : ''
        ].filter(Boolean),
        getraenke: [
          formData.teeKaffeeservice ? serviceLabels.teeKaffeeservice : '',
          formData.softgetraenkeMineralwasser ? serviceLabels.softgetraenkeMineralwasser : ''
        ].filter(Boolean),
        torte: [
          formData.hochzeitstorte3Etagen ? serviceLabels.hochzeitstorte3Etagen : '',
          formData.hochzeitstorteFlach ? serviceLabels.hochzeitstorteFlach : ''
        ].filter(Boolean),
        service: [
          formData.standardDekoration ? serviceLabels.standardDekoration : '',
          formData.serviceAllgemein ? serviceLabels.serviceAllgemein : '',
          formData.bandDj ? serviceLabels.bandDj : ''
        ].filter(Boolean),
        videoFotografie: [
          formData.videoKameraKranHDOhne ? serviceLabels.videoKameraKranHDOhne : '',
          formData.videoKameraKranHDMit ? serviceLabels.videoKameraKranHDMit : '',
          formData.videoKameraKranHDMitBrautigam ? serviceLabels.videoKameraKranHDMitBrautigam : '',
          formData.fotoshootingUSB ? serviceLabels.fotoshootingUSB : '',
          formData.weddingStoryClip ? serviceLabels.weddingStoryClip : '',
          formData.fotoalbum ? serviceLabels.fotoalbum : ''
        ].filter(Boolean),
        musik: [
          formData.davulZurna4Stunden ? serviceLabels.davulZurna4Stunden : '',
          formData.davulZurnaMitBrautabholung ? serviceLabels.davulZurnaMitBrautabholung : ''
        ].filter(Boolean),
        dekoEffekte: [
          formData.saeulenabgrenzungBlumenFeuerwerk ? serviceLabels.saeulenabgrenzungBlumenFeuerwerk : '',
          formData.saeulenabgrenzungKuchenAnschneiden ? serviceLabels.saeulenabgrenzungKuchenAnschneiden : '',
          formData.eingangsfeuerwerkBrautpaar ? serviceLabels.eingangsfeuerwerkBrautpaar : ''
        ].filter(Boolean),
        extras: [
          formData.helikopterlandung ? serviceLabels.helikopterlandung : '',
          formData.obstKuchenbuffetTatli ? serviceLabels.obstKuchenbuffetTatli : '',
          formData.cigkoefteTischservice ? serviceLabels.cigkoefteTischservice : '',
          formData.suppeHauptgang ? serviceLabels.suppeHauptgang : '',
          formData.cocktailEmpfang ? serviceLabels.cocktailEmpfang : ''
        ].filter(Boolean)
      };

      // Services als Array für serviceLeistungen
      const serviceLeistungenArray: string[] = [
        ...services.tischaufstellung,
        ...services.essenCatering,
        ...services.getraenke,
        ...services.torte,
        ...services.service,
        ...services.videoFotografie,
        ...services.musik,
        ...services.dekoEffekte,
        ...services.extras
      ];

      // Event-Hall aus eventsaal1 und eventsaal2 zusammenstellen
      const eventHallArray: string[] = [];
      if (formData.eventsaal1) eventHallArray.push('Event Saal -1-');
      if (formData.eventsaal2) eventHallArray.push('Event Saal -2-');
      const eventHall = eventHallArray.join(', ');

      // Event-Datenobjekt für Firebase erstellen (ALLE Felder)
      const eventData: any = {
        // Basis-Felder
        title: `${formData.firstName} ${formData.lastName}`.trim() || 'Unbekannt',
        date: formData.eventDate.toISOString().split('T')[0] || '',
        time: '16:00-24:00',
        room: eventHall || '',
        status: 'planned',
        customerId: customerId,
        customer: `${formData.firstName} ${formData.lastName}`.trim() || 'Unbekannt',
        
        // Customer fields
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        company: formData.company || '',
        email: formData.email || '',
        phone: formData.phone || '',
        mobile: formData.mobile || '',
        mobileNumber: formData.mobile || '',
        street: formData.streetAndNumber || '',
        streetAndNumber: formData.streetAndNumber || '',
        zipCity: formData.zipAndCity || '',
        zipAndCity: formData.zipAndCity || '',
        notes: formData.notes || '',
        
        // Event fields - PRIMARY NAMES
        eventType: formData.veranstaltungsart || '',
        veranstaltungsart: formData.veranstaltungsart || '',
        guestCount: Number(formData.personenanzahl) || 0,
        personenanzahl: formData.personenanzahl || '',
        weekday: formData.wochentag || '',
        wochentag: formData.wochentag || '',
        eventDate: formData.eventDate.toISOString().split('T')[0] || '',
        eventHall: eventHall || '',
        deposit: Number(formData.anzahlung) || 0,
        anzahlung: formData.anzahlung || '',
        totalPrice: Number(formData.gesamtpreis) || 0,
        gesamtpreis: formData.gesamtpreis || '',
        servicePrice: Number(formData.service) || 0,
        service: formData.service || '',
        serviceKosten: formData.service || '',
        hallPrice: Number(formData.saalmiete) || 0,
        saalmiete: formData.saalmiete || '',
        remainingPayment: Number(formData.restzahlung) || 0,
        restzahlung: formData.restzahlung || '',
        acceptedOffer: formData.angebotAngenommen === 'ja' || formData.angebotAngenommen === 'true' || false,
        angebotAngenommen: formData.angebotAngenommen || '',
        customerSignatureDate: formData.datumUnterschriftKunde || '',
        datumUnterschriftKunde: formData.datumUnterschriftKunde || '',
        bellavueSignatureDate: formData.datumUnterschriftBellavue || '',
        datumUnterschriftBellavue: formData.datumUnterschriftBellavue || '',
        
        // Services
        serviceLeistungen: serviceLeistungenArray,
        services: services,
        
        // Legacy fields for compatibility
        offerTotal: Number(formData.angebotssumme) || 0,
        angebotssumme: formData.angebotssumme || '',
        rentalFee: Number(formData.saalmiete) || 0,
        serviceFee: Number(formData.service) || 0,
        
        // Brautpaar fields
        addressBride: formData.addressBride || '',
        addressGroom: formData.addressGroom || '',
        nationalityBride: formData.nationalityBride || '',
        nationalityGroom: formData.nationalityGroom || '',
        ageBride: formData.ageBride || '',
        ageGroom: formData.ageGroom || '',
        
        // Event details
        eventsaal1: formData.eventsaal1 || false,
        eventsaal2: formData.eventsaal2 || false,
        veranstaltungsdatum: formData.eventDate.toISOString().split('T')[0] || '',
        
        // All service checkboxes
        rundeTische: formData.rundeTische || false,
        eckigeTische: formData.eckigeTische || false,
        etSoteHaehnchengeschnetzeltes: formData.etSoteHaehnchengeschnetzeltes || false,
        tavukSoteRindergulasch: formData.tavukSoteRindergulasch || false,
        halbesHaehnchen: formData.halbesHaehnchen || false,
        reis: formData.reis || false,
        gemuese: formData.gemuese || false,
        salatJahreszeit: formData.salatJahreszeit || false,
        pommesSalzkartoffel: formData.pommesSalzkartoffel || false,
        antipastiVorspeisenBrot: formData.antipastiVorspeisenBrot || false,
        knabbereienCerez: formData.knabbereienCerez || false,
        obstschale: formData.obstschale || false,
        nachtischBaklava: formData.nachtischBaklava || false,
        teeKaffeeservice: formData.teeKaffeeservice || false,
        softgetraenkeMineralwasser: formData.softgetraenkeMineralwasser || false,
        hochzeitstorte3Etagen: formData.hochzeitstorte3Etagen || false,
        hochzeitstorteFlach: formData.hochzeitstorteFlach || false,
        standardDekoration: formData.standardDekoration || false,
        serviceAllgemein: formData.serviceAllgemein || false,
        bandDj: formData.bandDj || false,
        videoKameraKranHDOhne: formData.videoKameraKranHDOhne || false,
        videoKameraKranHDMit: formData.videoKameraKranHDMit || false,
        videoKameraKranHDMitBrautigam: formData.videoKameraKranHDMitBrautigam || false,
        fotoshootingUSB: formData.fotoshootingUSB || false,
        weddingStoryClip: formData.weddingStoryClip || false,
        fotoalbum: formData.fotoalbum || false,
        davulZurna4Stunden: formData.davulZurna4Stunden || false,
        davulZurnaMitBrautabholung: formData.davulZurnaMitBrautabholung || false,
        saeulenabgrenzungBlumenFeuerwerk: formData.saeulenabgrenzungBlumenFeuerwerk || false,
        saeulenabgrenzungKuchenAnschneiden: formData.saeulenabgrenzungKuchenAnschneiden || false,
        eingangsfeuerwerkBrautpaar: formData.eingangsfeuerwerkBrautpaar || false,
        helikopterlandung: formData.helikopterlandung || false,
        obstKuchenbuffetTatli: formData.obstKuchenbuffetTatli || false,
        cigkoefteTischservice: formData.cigkoefteTischservice || false,
        suppeHauptgang: formData.suppeHauptgang || false,
        cocktailEmpfang: formData.cocktailEmpfang || false,
        signature: formData.signature || '',
        
        createdAt: serverTimestamp()
      };

      // Event in Firebase speichern
      const docRef = await addDoc(collection(db, 'events'), eventData);
      console.log('Event erfolgreich gespeichert mit ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Fehler beim Speichern des Events in Firebase:', error);
      throw error;
    }
  };

  // Hilfsfunktion zum Zusammenfügen von Adressfeldern
  const composeAddress = (streetAndNumber?: string, zipAndCity?: string) =>
    [streetAndNumber?.trim(), zipAndCity?.trim()].filter(Boolean).join(', ');

  const handleSubmit = async () => {
    try {
      // Customer-Objekt aus persönlichen Kundeninformationen
      // Nur die 8 angeforderten Felder aus dem Formular übernehmen
      const customerName = `${formData.firstName} ${formData.lastName}`.trim();
      
      const newCustomer: Omit<Customer, 'id'> = {
        // Die 8 benötigten Felder aus dem Formular
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        email: formData.email || '',
        phone: formData.phone || '',
        mobile: formData.mobile || '',
        streetAndNumber: formData.streetAndNumber || '',
        zipAndCity: formData.zipAndCity || '',
        notes: formData.notes || '',
        // Pflichtfelder für Interface (minimal gesetzt)
        name: customerName,
        company: formData.company || '',
        address: composeAddress(formData.streetAndNumber, formData.zipAndCity),
        addressBride: '',
        addressGroom: '',
        nationalityBride: '',
        nationalityGroom: '',
        ageBride: '',
        ageGroom: '',
        events: []
      };

      // Customer in Firebase speichern
      console.log('Speichere Customer in Firebase...', newCustomer);
      const customerId = await customerService.createCustomer(newCustomer);
      console.log('Customer erfolgreich in Firebase gespeichert mit ID:', customerId);

      // Event direkt in Firebase speichern
      console.log('Speichere Event in Firebase...');
      const eventId = await handleEventSubmit(customerId);
      console.log('Event erfolgreich in Firebase gespeichert mit ID:', eventId);

      // Customer mit Event-ID in Firebase aktualisieren
      await customerService.updateCustomer(customerId, { events: [eventId] });
      console.log('Customer in Firebase mit Event-ID aktualisiert');

      // Formular zurücksetzen
      handleClose();
      
      // PDF-Dialog anzeigen
      setShowDownloadDialog(true);
      
      // WICHTIG: onSubmit NICHT mehr aufrufen, da wir bereits direkt in Firebase gespeichert haben
      // Die Daten werden über die Firebase Real-time Listeners automatisch geladen
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      console.error('Fehlerdetails:', {
        message: error instanceof Error ? error.message : 'Unbekannter Fehler',
        stack: error instanceof Error ? error.stack : undefined,
        code: (error as any)?.code,
        details: (error as any)?.details
      });
      
      let errorMessage = 'Fehler beim Speichern des Events. ';
      if (error instanceof Error) {
        if (error.message.includes('permission') || error.message.includes('Missing or insufficient permissions')) {
          errorMessage += 'Berechtigungsfehler: Bitte stellen Sie sicher, dass die Firestore Security Rules korrekt konfiguriert sind und die anonyme Authentifizierung aktiviert ist.';
        } else if (error.message.includes('Authentifizierung')) {
          errorMessage += 'Authentifizierungsfehler: ' + error.message;
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Unbekannter Fehler. Bitte versuchen Sie es erneut.';
      }
      
      alert(errorMessage);
    }
  };

  const handleClose = () => {
    setFormData({
      // Persönliche Kundeninformationen
      firstName: '',
      lastName: '',
      company: '',
      email: '',
      phone: '',
      mobile: '',
      streetAndNumber: '',
      zipAndCity: '',
      addressBride: '',
      addressGroom: '',
      nationalityBride: '',
      nationalityGroom: '',
      ageBride: '',
      ageGroom: '',
      notes: '',
      
      // Event Details
      personenanzahl: '',
      veranstaltungsart: '',
      eventsaal1: false,
      eventsaal2: false,
      eventDate: initialDate || new Date(),
      wochentag: '',
      
      // Kostenübersicht
      angebotssumme: '',
      saalmiete: '',
      service: '',
      gesamtpreis: '',
      anzahlung: '',
      restzahlung: '',
      
      // Tischaufstellung
      rundeTische: false,
      eckigeTische: false,
      
      // Essen & Catering
      etSoteHaehnchengeschnetzeltes: false,
      tavukSoteRindergulasch: false,
      halbesHaehnchen: false,
      reis: false,
      gemuese: false,
      salatJahreszeit: false,
      pommesSalzkartoffel: false,
      antipastiVorspeisenBrot: false,
      knabbereienCerez: false,
      obstschale: false,
      nachtischBaklava: false,
      
      // Getränke
      teeKaffeeservice: false,
      softgetraenkeMineralwasser: false,
      
      // Torte
      hochzeitstorte3Etagen: false,
      hochzeitstorteFlach: false,
      
      // Service
      standardDekoration: false,
      serviceAllgemein: false,
      bandDj: false,
      
      // Video & Fotografie
      videoKameraKranHDOhne: false,
      videoKameraKranHDMit: false,
      videoKameraKranHDMitBrautigam: false,
      fotoshootingUSB: false,
      weddingStoryClip: false,
      fotoalbum: false,
      
      // Musik
      davulZurna4Stunden: false,
      davulZurnaMitBrautabholung: false,
      
      // Dekoration & Effekte
      saeulenabgrenzungBlumenFeuerwerk: false,
      saeulenabgrenzungKuchenAnschneiden: false,
      eingangsfeuerwerkBrautpaar: false,
      
      // Extras
      helikopterlandung: false,
      obstKuchenbuffetTatli: false,
      cigkoefteTischservice: false,
      suppeHauptgang: false,
      cocktailEmpfang: false,
      
      // Unterschrift
      signature: '',
      angebotAngenommen: '',
      datumUnterschriftKunde: '',
      datumUnterschriftBellavue: ''
    });
    onClose();
  };

  return (
    <>
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>Service Angebot - BELLAVUE Event</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          
          {/* Persönliche Kundeninformationen */}
          <Typography variant="h5" gutterBottom sx={{ mt: 2, mb: 3, color: 'primary.main', fontWeight: 'bold' }}>
            👤 Persönliche Kundeninformationen
          </Typography>
          
          {/* Grunddaten */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
              Grunddaten
            </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 3, 
            p: 3,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <TextField
              fullWidth
              label="Vorname"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              required
              variant="outlined"
                placeholder="z.B. Max"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
            <TextField
              fullWidth
              label="Nachname"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              required
              variant="outlined"
                placeholder="z.B. Mustermann"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
            <TextField
              fullWidth
                label="Firma (optional)"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              variant="outlined"
                placeholder="z.B. Mustermann GmbH"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
            <TextField
              fullWidth
                label="E-Mail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              variant="outlined"
                placeholder="max.mustermann@email.com"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
            <TextField
              fullWidth
                label="Telefon"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
              variant="outlined"
                placeholder="z.B. 0123 456789"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
            <TextField
              fullWidth
                label="Mobilnummer"
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
              variant="outlined"
                placeholder="z.B. 0171 1234567"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
                <TextField
                  fullWidth
                  label="Straße & Hausnummer"
                value={formData.streetAndNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, streetAndNumber: e.target.value }))}
                  variant="outlined"
                  placeholder="z.B. Musterstraße 123"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.default'
                    }
                  }}
                />
                <TextField
                  fullWidth
                  label="PLZ & Ort"
                value={formData.zipAndCity}
                onChange={(e) => setFormData(prev => ({ ...prev, zipAndCity: e.target.value }))}
                  variant="outlined"
                  placeholder="z.B. 12345 Musterstadt"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.default'
                    }
                  }}
                />
            <TextField
              fullWidth
                label="Notizen"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              variant="outlined"
              multiline
              rows={3}
              placeholder="Zusätzliche Informationen oder Notizen zum Kunden"
              sx={{ 
                gridColumn: { xs: '1', sm: '1 / -1' },
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.default'
                    }
                  }}
                />
              </Box>
            </Box>

          {/* Event Details */}
          <Typography variant="h5" gutterBottom sx={{ mt: 2, mb: 3, color: 'primary.main', fontWeight: 'bold' }}>
            📅 Event Details
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 3, 
            mb: 4,
            p: 3,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <TextField
              fullWidth
              label="Personenanzahl"
              type="number"
              value={formData.personenanzahl}
              onChange={(e) => setFormData(prev => ({ ...prev, personenanzahl: e.target.value }))}
              required
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
            <FormControl fullWidth required>
              <InputLabel>Veranstaltungsart</InputLabel>
              <Select
                value={formData.veranstaltungsart}
                onChange={(e) => setFormData(prev => ({ ...prev, veranstaltungsart: e.target.value }))}
              label="Veranstaltungsart"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
              >
                <MenuItem value="Hochzeit">Hochzeit</MenuItem>
                <MenuItem value="Firmenfeier">Firmenfeier</MenuItem>
                <MenuItem value="Geburtstag">Geburtstag</MenuItem>
                <MenuItem value="Jahrestag">Jahrestag</MenuItem>
                <MenuItem value="Konfirmation">Konfirmation</MenuItem>
                <MenuItem value="Kommunion">Kommunion</MenuItem>
                <MenuItem value="Weihnachtsfeier">Weihnachtsfeier</MenuItem>
                <MenuItem value="Sommerfest">Sommerfest</MenuItem>
                <MenuItem value="Sonstiges">Sonstiges</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Wochentag"
              value={formData.wochentag}
              onChange={(e) => setFormData(prev => ({ ...prev, wochentag: e.target.value }))}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Event Saal (Checkbox-Auswahl):
            </Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.eventsaal1}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventsaal1: e.target.checked }))}
                  />
                }
                label="Event Saal -1-"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.eventsaal2}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventsaal2: e.target.checked }))}
                  />
                }
                label="Event Saal -2-"
              />
            </FormGroup>
          </Box>

          <Box sx={{ mb: 3 }}>
            <DatePicker
              label="Veranstaltungs- Datum"
              value={formData.eventDate}
              onChange={(newValue) => setFormData(prev => ({ ...prev, eventDate: newValue || new Date() }))}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Box>

          {/* Brautpaar Informationen - nur bei Hochzeiten */}
          {formData.veranstaltungsart.toLowerCase().includes('hochzeit') && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ mt: 2, mb: 3, color: 'primary.main', fontWeight: 'bold' }}>
                💒 Brautpaar Informationen
              </Typography>
              
              {/* Braut */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
                  👰 Braut
          </Typography>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                  gap: 3, 
                  p: 3,
                  backgroundColor: 'background.paper',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <TextField
                    fullWidth
                    label="Anschrift Braut"
                    value={formData.addressBride}
                    onChange={(e) => setFormData(prev => ({ ...prev, addressBride: e.target.value }))}
                    required
                    variant="outlined"
                    multiline
                    rows={2}
                    placeholder="Straße, Hausnummer, PLZ, Ort"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.default'
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Nationalität Braut"
                    value={formData.nationalityBride}
                    onChange={(e) => setFormData(prev => ({ ...prev, nationalityBride: e.target.value }))}
                    required
                    variant="outlined"
                    placeholder="z.B. Deutsch"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.default'
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Alter Braut"
                    type="number"
                    value={formData.ageBride}
                    onChange={(e) => setFormData(prev => ({ ...prev, ageBride: e.target.value }))}
                    required
                    variant="outlined"
                    placeholder="z.B. 28"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.default'
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Bräutigam */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
                  🤵 Bräutigam
                </Typography>
          <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                  gap: 3, 
            p: 3, 
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <TextField
                    fullWidth
                    label="Anschrift Bräutigam"
                    value={formData.addressGroom}
                    onChange={(e) => setFormData(prev => ({ ...prev, addressGroom: e.target.value }))}
                    required
                    variant="outlined"
                    multiline
                    rows={2}
                    placeholder="Straße, Hausnummer, PLZ, Ort"
                        sx={{ 
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.default'
                          }
                        }}
                      />
                  <TextField
                    fullWidth
                    label="Nationalität Bräutigam"
                    value={formData.nationalityGroom}
                    onChange={(e) => setFormData(prev => ({ ...prev, nationalityGroom: e.target.value }))}
                    required
                    variant="outlined"
                    placeholder="z.B. Türkisch"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.default'
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Alter Bräutigam"
                    type="number"
                    value={formData.ageGroom}
                    onChange={(e) => setFormData(prev => ({ ...prev, ageGroom: e.target.value }))}
                    required
                    variant="outlined"
                    placeholder="z.B. 30"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.default'
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Service Angebot */}
          <Typography variant="h6" gutterBottom>
            Service Angebot
          </Typography>
          
          {/* Tischaufstellung */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
            Tischaufstellung
          </Typography>
          
          <Box sx={{ 
            p: 3, 
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            mb: 4
          }}>
                <FormGroup sx={{ gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.rundeTische}
                        onChange={(e) => setFormData(prev => ({ ...prev, rundeTische: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                    label="Runde Tische"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                        fontSize: '1rem',
                        fontWeight: 500
                      }
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.eckigeTische}
                        onChange={(e) => setFormData(prev => ({ ...prev, eckigeTische: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                    label="Eckige Tische"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                    fontSize: '1rem',
                    fontWeight: 500
                      }
                    }}
                  />
            </FormGroup>
          </Box>

          {/* Essen & Catering */}
          <Typography variant="h6" gutterBottom>
            Essen & Catering
          </Typography>
          
          <Box sx={{ 
            p: 3, 
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            mb: 4
          }}>
            <FormGroup sx={{ gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                    checked={formData.etSoteHaehnchengeschnetzeltes}
                    onChange={(e) => setFormData(prev => ({ ...prev, etSoteHaehnchengeschnetzeltes: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                label="Et Sote / Hähnchengeschnetzeltes (Tischbuffet)"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.95rem'
                      }
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                    checked={formData.tavukSoteRindergulasch}
                    onChange={(e) => setFormData(prev => ({ ...prev, tavukSoteRindergulasch: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                label="Tavuk Sote / Rindergulasch (Tischbuffet)"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.95rem'
                      }
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                    checked={formData.halbesHaehnchen}
                    onChange={(e) => setFormData(prev => ({ ...prev, halbesHaehnchen: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                label="Halbes Hähnchen (Tischservice)"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.95rem'
                      }
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                    checked={formData.reis}
                    onChange={(e) => setFormData(prev => ({ ...prev, reis: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                label="Reis (Tischbuffet)"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.95rem'
                      }
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                    checked={formData.gemuese}
                    onChange={(e) => setFormData(prev => ({ ...prev, gemuese: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                label="Gemüse (Tischbuffet) oder"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.95rem'
                      }
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                    checked={formData.salatJahreszeit}
                    onChange={(e) => setFormData(prev => ({ ...prev, salatJahreszeit: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                label="Salat entsprechend der Jahreszeit (Tischbuffet)"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.95rem'
                      }
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                    checked={formData.pommesSalzkartoffel}
                    onChange={(e) => setFormData(prev => ({ ...prev, pommesSalzkartoffel: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                label="Pommes oder Salzkartoffel (Tischservice)"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.95rem'
                      }
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                    checked={formData.antipastiVorspeisenBrot}
                    onChange={(e) => setFormData(prev => ({ ...prev, antipastiVorspeisenBrot: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                label="3 Sorten Antipasti / Vorspeisen und Brot (Meze) als (Tischservice)"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.95rem'
                      }
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                    checked={formData.knabbereienCerez}
                    onChange={(e) => setFormData(prev => ({ ...prev, knabbereienCerez: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                label="Knabbereien (Cerez) (Tischservice)"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.95rem'
                      }
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                    checked={formData.obstschale}
                    onChange={(e) => setFormData(prev => ({ ...prev, obstschale: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                label="Obstschale mind. 4-5 Sorten Obst (Tischservice)"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.95rem'
                      }
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                    checked={formData.nachtischBaklava}
                    onChange={(e) => setFormData(prev => ({ ...prev, nachtischBaklava: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                label="Nachtisch (z.B Baklava pro Tisch 1- Teller) (Tischservice)"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.95rem'
                      }
                    }}
                  />
            </FormGroup>
          </Box>

          {/* Getränke */}
          <Typography variant="h6" gutterBottom>
            Getränke
          </Typography>
          
          <Box sx={{ 
            p: 3, 
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            mb: 4
          }}>
            <FormGroup sx={{ gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                    checked={formData.teeKaffeeservice}
                    onChange={(e) => setFormData(prev => ({ ...prev, teeKaffeeservice: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                label="Tee & Kaffeeservice (Tee & Kaffee Station und Service im Bistro)"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.95rem'
                      }
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                    checked={formData.softgetraenkeMineralwasser}
                    onChange={(e) => setFormData(prev => ({ ...prev, softgetraenkeMineralwasser: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                label="Softgetränke und Mineralwasser (Tischservice ohne Limit)"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.95rem'
                      }
                    }}
                  />
            </FormGroup>
          </Box>

          {/* Torte */}
          <Typography variant="h6" gutterBottom>
            Torte
          </Typography>
          
          <Box sx={{ 
            p: 3, 
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            mb: 4
          }}>
            <FormGroup sx={{ gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                    checked={formData.hochzeitstorte3Etagen}
                    onChange={(e) => setFormData(prev => ({ ...prev, hochzeitstorte3Etagen: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                label="Hochzeitstorte 3 Etagen (Geschmack nach Wahl) oder"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.95rem'
                      }
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                    checked={formData.hochzeitstorteFlach}
                    onChange={(e) => setFormData(prev => ({ ...prev, hochzeitstorteFlach: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                label="Hochzeitstorte (flach) zum selber bestücken mit 5 Sorten Früchten"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.95rem'
                      }
                    }}
                  />
            </FormGroup>
          </Box>

          {/* Service */}
          <Typography variant="h6" gutterBottom>
            Service
          </Typography>
          
          <Box sx={{ 
            p: 3, 
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            mb: 4
          }}>
            <FormGroup sx={{ gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                    checked={formData.standardDekoration}
                    onChange={(e) => setFormData(prev => ({ ...prev, standardDekoration: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                label="Standard Dekoration Saal sowie Tischdekoration"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.95rem'
                      }
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                    checked={formData.serviceAllgemein}
                    onChange={(e) => setFormData(prev => ({ ...prev, serviceAllgemein: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                label="Service im Allgemein"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.95rem'
                      }
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                    checked={formData.bandDj}
                    onChange={(e) => setFormData(prev => ({ ...prev, bandDj: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                label="Band & DJ"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.95rem'
                      }
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                    checked={formData.videoKameraKranHDOhne}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoKameraKranHDOhne: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                label="3 x Video Kamera inkl. Kran HD (ohne Brautabholung)"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.95rem'
                      }
                    }}
                  />
                </FormGroup>
          </Box>

          {/* Zusatzleistungen */}
          <Typography variant="h6" gutterBottom>
            Zusatzleistungen
          </Typography>
          
          <Box sx={{ 
            p: 3, 
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            mb: 4
          }}>
            <FormGroup sx={{ gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.videoKameraKranHDMit}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoKameraKranHDMit: e.target.checked }))}
                    sx={{ 
                      '&.Mui-checked': {
                        color: 'primary.main'
                      }
                    }}
                  />
                }
                label="3 x Video Kamera inkl. Kran HD im Saal (inkl. Brautabholung) F 6.8"
                sx={{ 
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.95rem'
                  }
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.videoKameraKranHDMitBrautigam}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoKameraKranHDMitBrautigam: e.target.checked }))}
                    sx={{ 
                      '&.Mui-checked': {
                        color: 'primary.main'
                      }
                    }}
                  />
                }
                label="3 x Video Kamera inkl. Kran HD im Saal (inkl. Bräutigamabholung) S 5.8"
                sx={{ 
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.95rem'
                  }
                }}
              />
                  <FormControlLabel
                    control={
                      <Checkbox
                    checked={formData.fotoshootingUSB}
                    onChange={(e) => setFormData(prev => ({ ...prev, fotoshootingUSB: e.target.checked }))}
                        sx={{ 
                          '&.Mui-checked': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    }
                label="Fotoshooting inkl. 35-40 Bilder auf USB Stick K 5.5"
                    sx={{ 
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.95rem'
                      }
                    }}
                  />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.weddingStoryClip}
                    onChange={(e) => setFormData(prev => ({ ...prev, weddingStoryClip: e.target.checked }))}
                    sx={{ 
                      '&.Mui-checked': {
                        color: 'primary.main'
                      }
                    }}
                  />
                }
                label="Wedding Story (Clip) aus Brautabholung, Fotoshooting, 1. Tanz H 6.5"
                sx={{ 
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.95rem'
                      }
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.fotoalbum}
                    onChange={(e) => setFormData(prev => ({ ...prev, fotoalbum: e.target.checked }))}
                    sx={{ 
                      '&.Mui-checked': {
                        color: 'primary.main'
                      }
                    }}
                  />
                }
                label="Fotoalbum mit ca. 35 hochwertig gedruckte Bilder B 6.0"
                sx={{ 
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.95rem'
                      }
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.davulZurna4Stunden}
                    onChange={(e) => setFormData(prev => ({ ...prev, davulZurna4Stunden: e.target.checked }))}
                    sx={{ 
                      '&.Mui-checked': {
                        color: 'primary.main'
                      }
                    }}
                  />
                }
                label="1x Davul & Zurna (4-5 Stunden nur im Saal) A 7.5"
                sx={{ 
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.95rem'
                  }
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.davulZurnaMitBrautabholung}
                    onChange={(e) => setFormData(prev => ({ ...prev, davulZurnaMitBrautabholung: e.target.checked }))}
                    sx={{ 
                      '&.Mui-checked': {
                        color: 'primary.main'
                      }
                    }}
                  />
                }
                label="1x Davul & Zurna (inkl. Brautabholung und 4-5 Stunden im Saal) L 8.5"
                sx={{ 
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.95rem'
                  }
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.saeulenabgrenzungBlumenFeuerwerk}
                    onChange={(e) => setFormData(prev => ({ ...prev, saeulenabgrenzungBlumenFeuerwerk: e.target.checked }))}
                    sx={{ 
                      '&.Mui-checked': {
                        color: 'primary.main'
                      }
                    }}
                  />
                }
                label="Säulenabgrenzung mit Blumen, Feuerwerk, Bodennebel und Hochzeitslaser 4-6 Stk. (für den 1. Tanz) M 5.0"
                sx={{ 
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.95rem'
                  }
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.saeulenabgrenzungKuchenAnschneiden}
                    onChange={(e) => setFormData(prev => ({ ...prev, saeulenabgrenzungKuchenAnschneiden: e.target.checked }))}
                    sx={{ 
                      '&.Mui-checked': {
                        color: 'primary.main'
                      }
                    }}
                  />
                }
                label="Säulenabgrenzung mit Blumen, Feuerwerk, Bodennebel (4-6 Stk.) beim Kuchen Anschneiden W 4.0"
                sx={{ 
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.95rem'
                  }
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.eingangsfeuerwerkBrautpaar}
                    onChange={(e) => setFormData(prev => ({ ...prev, eingangsfeuerwerkBrautpaar: e.target.checked }))}
                    sx={{ 
                      '&.Mui-checked': {
                        color: 'primary.main'
                      }
                    }}
                  />
                }
                label="Eingangsfeuerwerk für Brautpaar (8-10 Stk.) beim Betreten vom Saal D 5.0 (Nur in den Wintermonaten und bei Dunkelheit möglich)"
                sx={{ 
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.95rem'
                  }
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.helikopterlandung}
                    onChange={(e) => setFormData(prev => ({ ...prev, helikopterlandung: e.target.checked }))}
                    sx={{ 
                      '&.Mui-checked': {
                        color: 'primary.main'
                      }
                    }}
                  />
                }
                label="Landung mit dem Helikopter auf dem Parkplatz des Eventzentrums F 28.0"
                sx={{ 
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.95rem'
                  }
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.obstKuchenbuffetTatli}
                    onChange={(e) => setFormData(prev => ({ ...prev, obstKuchenbuffetTatli: e.target.checked }))}
                    sx={{ 
                      '&.Mui-checked': {
                        color: 'primary.main'
                      }
                    }}
                  />
                }
                label="Obst und Küchenbuffet inkl. Tatli als offenes Buffet nach dem Essen RK 0,20"
                sx={{ 
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.95rem'
                  }
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.cigkoefteTischservice}
                    onChange={(e) => setFormData(prev => ({ ...prev, cigkoefteTischservice: e.target.checked }))}
                    sx={{ 
                      '&.Mui-checked': {
                        color: 'primary.main'
                      }
                    }}
                  />
                }
                label="Cigköfte als Tischservice inkl. Blattsalat, Soße und Zitrone SR 0,20"
                sx={{ 
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.95rem'
                  }
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.suppeHauptgang}
                    onChange={(e) => setFormData(prev => ({ ...prev, suppeHauptgang: e.target.checked }))}
                    sx={{ 
                      '&.Mui-checked': {
                        color: 'primary.main'
                      }
                    }}
                  />
                }
                label="Suppe vor dem Hauptgang als Tischservice Mercimek, Yayla, Broccoli LA 0,27"
                sx={{ 
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.95rem'
                  }
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.cocktailEmpfang}
                    onChange={(e) => setFormData(prev => ({ ...prev, cocktailEmpfang: e.target.checked }))}
                    sx={{ 
                      '&.Mui-checked': {
                        color: 'primary.main'
                      }
                    }}
                  />
                }
                label="Cocktail Empfang (Alkoholfrei ca. 2 Stunden am Haupteingang durch Kellner) TU 0,18"
                sx={{ 
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.95rem'
                      }
                }}
              />
            </FormGroup>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Veranstaltungszeit */}
          <Typography variant="h6" gutterBottom>
            Veranstaltungszeit
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Veranstaltungszeitraum ist von 16:00 bis 24:00 Uhr
            </Typography>
            <Typography variant="body2">
              Nach 24:00 Uhr, behält sich der Vermieter das Recht vor, für jede weitere angefangene Stunde 500,-€ zusätzlich als Saalmiete aufrufen.
            </Typography>
          </Alert>

          <Divider sx={{ my: 3 }} />

          {/* Kostenübersicht */}
          <Typography variant="h6" gutterBottom>
            Kostenübersicht
          </Typography>
          
          <Box sx={{ 
            p: 3, 
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            mb: 4
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <TextField
                    fullWidth
                    label="Angebotssumme (€)"
                    type="number"
                    value={formData.angebotssumme}
                    onChange={(e) => setFormData(prev => ({ ...prev, angebotssumme: e.target.value }))}
                  />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <TextField
                    fullWidth
                    label="Saalmiete (€)"
                    type="number"
                    value={formData.saalmiete}
                    onChange={(e) => setFormData(prev => ({ ...prev, saalmiete: e.target.value }))}
                  />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <TextField
                    fullWidth
                    label="Service (€)"
                    type="number"
                    value={formData.service}
                    onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
                  />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <TextField
                    fullWidth
                    label="Gesamtpreis (€)"
                    type="number"
                    value={formData.gesamtpreis}
                    onChange={(e) => setFormData(prev => ({ ...prev, gesamtpreis: e.target.value }))}
                  />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <TextField
                    fullWidth
                    label="Abzgl. Anzahlung - (€)"
                    type="number"
                    value={formData.anzahlung}
                    onChange={(e) => setFormData(prev => ({ ...prev, anzahlung: e.target.value }))}
                  />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Rechtliche Hinweise */}
          <Typography variant="h6" gutterBottom>
            Rechtliche Hinweise
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" component="div">
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Dieses Angebot berechtigt nicht zum Vorsteuerabzug.
              </Typography>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Bei Absage durch den Kunden (auch bei Todesfällen) wird die Anzahlung nicht erstattet.</li>
                <li>Der Veranstalter kann bei Absage Strafzahlungen verlangen.</li>
                <li>Der Veranstalter kann bei höherer Gewalt das Event absagen.</li>
                <li>Die Reservierung wird erst nach Erhalt der Anzahlung verbindlich.</li>
                <li>Wir empfehlen dem Mieter, eine Eventversicherung (z. B. HanseMerkur Versicherung) abzuschließen. 
                    Informationsmaterial/Broschüre wird von BELLAVUE zur Verfügung gestellt.</li>
              </ul>
            </Typography>
          </Alert>

          <Divider sx={{ my: 3 }} />

          {/* Angebot angenommen */}
          <Typography variant="h6" gutterBottom>
            Angebot angenommen
          </Typography>
          
          <Box sx={{ 
            p: 3, 
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            mb: 4
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
                label="Angebot angenommen"
                value={formData.angebotAngenommen}
                onChange={(e) => setFormData(prev => ({ ...prev, angebotAngenommen: e.target.value }))}
              />
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 250 }}>
                  <TextField
                    fullWidth
                    label="Datum & Unterschrift Kunde/n"
                    value={formData.datumUnterschriftKunde}
                    onChange={(e) => setFormData(prev => ({ ...prev, datumUnterschriftKunde: e.target.value }))}
            multiline
                    rows={2}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 250 }}>
                  <TextField
                    fullWidth
                    label="Datum & Unterschrift BELLAVUE Event"
                    value={formData.datumUnterschriftBellavue}
                    onChange={(e) => setFormData(prev => ({ ...prev, datumUnterschriftBellavue: e.target.value }))}
                    multiline
                    rows={2}
                  />
                </Box>
              </Box>
            </Box>
          </Box>

        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Abbrechen</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={
            !formData.firstName.trim() ||
            !formData.lastName.trim() ||
            !formData.email.trim() ||
            !formData.phone.trim() ||
            !formData.personenanzahl.trim() ||
            !formData.veranstaltungsart.trim() ||
            (!formData.eventsaal1 && !formData.eventsaal2) ||
            // Brautpaar-Felder nur bei Hochzeiten required
            (formData.veranstaltungsart.toLowerCase().includes('hochzeit') && (
              !formData.addressBride.trim() ||
              !formData.addressGroom.trim() ||
              !formData.nationalityBride.trim() ||
              !formData.nationalityGroom.trim() ||
              !formData.ageBride.trim() ||
              !formData.ageGroom.trim()
            ))
          }
        >
          Service Angebot erstellen
        </Button>
      </DialogActions>
    </Dialog>

    {/* Download Dialog */}
    <Dialog open={showDownloadDialog} onClose={() => setShowDownloadDialog(false)} maxWidth="sm" fullWidth>
      <DialogTitle>📄 PDF Download</DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="h6" gutterBottom>
            Service Angebot wurde erfolgreich erstellt!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Das Service Angebot wurde gespeichert. Möchten Sie es als PDF herunterladen oder drucken?
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button 
          onClick={handleCloseDownloadDialog}
          variant="outlined"
        >
          Nur speichern
        </Button>
        <Button 
          onClick={handleDownloadPDF}
          variant="contained"
          color="primary"
          startIcon="💾"
        >
          PDF herunterladen
        </Button>
        <Button 
          onClick={handlePrintPDF}
          variant="contained"
          color="secondary"
          startIcon="🖨️"
        >
          Drucken
        </Button>
      </DialogActions>
    </Dialog>

    {/* PDF Template - Hidden */}
    <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
      <div ref={pdfRef} style={{ 
        width: '210mm', 
        padding: '20mm', 
        backgroundColor: 'white', 
        fontFamily: 'Arial, sans-serif'
      }}>
        {/* BELLAVUE Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#000' }}>BELLAVUE EVENT</h1>
          <p style={{ margin: '5px 0 0', fontSize: '16px', color: '#666' }}>Service Angebot</p>
        </div>

        {/* Kundeninformationen */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', borderBottom: '2px solid #000', paddingBottom: '5px' }}>
            Persönliche Kundeninformationen
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div><strong>Name:</strong> {formData.firstName} {formData.lastName}</div>
            <div><strong>Firma:</strong> {formData.company}</div>
            <div><strong>E-Mail:</strong> {formData.email}</div>
            <div><strong>Telefon:</strong> {formData.phone}</div>
            <div><strong>Mobil:</strong> {formData.mobile}</div>
          </div>
        </div>

        {/* Event Details */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', borderBottom: '2px solid #000', paddingBottom: '5px' }}>
            Event Details
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div><strong>Personenanzahl:</strong> {formData.personenanzahl}</div>
            <div><strong>Veranstaltungsart:</strong> {formData.veranstaltungsart}</div>
            <div><strong>Datum:</strong> {formData.eventDate.toLocaleDateString('de-DE')}</div>
            <div><strong>Wochentag:</strong> {formData.wochentag}</div>
            <div><strong>Event Saal:</strong> {formData.eventsaal1 ? 'Event Saal -1-' : ''} {formData.eventsaal2 ? 'Event Saal -2-' : ''}</div>
          </div>
        </div>

        {/* Brautpaar Informationen - nur bei Hochzeiten */}
        {formData.veranstaltungsart.toLowerCase().includes('hochzeit') && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '15px', borderBottom: '2px solid #000', paddingBottom: '5px' }}>
              Brautpaar Informationen
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Braut</h3>
                <div><strong>Anschrift:</strong> {formData.addressBride}</div>
                <div><strong>Nationalität:</strong> {formData.nationalityBride}</div>
                <div><strong>Alter:</strong> {formData.ageBride}</div>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Bräutigam</h3>
                <div><strong>Anschrift:</strong> {formData.addressGroom}</div>
                <div><strong>Nationalität:</strong> {formData.nationalityGroom}</div>
                <div><strong>Alter:</strong> {formData.ageGroom}</div>
              </div>
            </div>
          </div>
        )}

        {/* Service Angebot */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', borderBottom: '2px solid #000', paddingBottom: '5px' }}>
            Service Angebot
          </h2>
          
          {/* Tischaufstellung */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Tischaufstellung</h3>
            <div style={{ marginLeft: '20px' }}>
              {formData.rundeTische && <div>✓ Runde Tische</div>}
              {formData.eckigeTische && <div>✓ Eckige Tische</div>}
            </div>
          </div>

          {/* Essen & Catering */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Essen & Catering</h3>
            <div style={{ marginLeft: '20px', columns: 2, columnGap: '20px' }}>
              {formData.etSoteHaehnchengeschnetzeltes && <div>✓ Et Sote / Hähnchengeschnetzeltes (Tischbuffet)</div>}
              {formData.tavukSoteRindergulasch && <div>✓ Tavuk Sote / Rindergulasch (Tischbuffet)</div>}
              {formData.halbesHaehnchen && <div>✓ Halbes Hähnchen (Tischservice)</div>}
              {formData.reis && <div>✓ Reis (Tischbuffet)</div>}
              {formData.gemuese && <div>✓ Gemüse (Tischbuffet) oder</div>}
              {formData.salatJahreszeit && <div>✓ Salat entsprechend der Jahreszeit (Tischbuffet)</div>}
              {formData.pommesSalzkartoffel && <div>✓ Pommes oder Salzkartoffel (Tischservice)</div>}
              {formData.antipastiVorspeisenBrot && <div>✓ 3 Sorten Antipasti / Vorspeisen und Brot (Meze) als (Tischservice)</div>}
              {formData.knabbereienCerez && <div>✓ Knabbereien (Cerez) (Tischservice)</div>}
              {formData.obstschale && <div>✓ Obstschale mind. 4-5 Sorten Obst (Tischservice)</div>}
              {formData.nachtischBaklava && <div>✓ Nachtisch (z.B Baklava pro Tisch 1- Teller) (Tischservice)</div>}
            </div>
          </div>

          {/* Getränke */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Getränke</h3>
            <div style={{ marginLeft: '20px' }}>
              {formData.teeKaffeeservice && <div>✓ Tee & Kaffeeservice (Tee & Kaffee Station und Service im Bistro)</div>}
              {formData.softgetraenkeMineralwasser && <div>✓ Softgetränke und Mineralwasser (Tischservice ohne Limit)</div>}
            </div>
          </div>

          {/* Torte */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Torte</h3>
            <div style={{ marginLeft: '20px' }}>
              {formData.hochzeitstorte3Etagen && <div>✓ Hochzeitstorte 3 Etagen (Geschmack nach Wahl) oder</div>}
              {formData.hochzeitstorteFlach && <div>✓ Hochzeitstorte (flach) zum selber bestücken mit 5 Sorten Früchten</div>}
            </div>
          </div>

          {/* Service */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Service</h3>
            <div style={{ marginLeft: '20px' }}>
              {formData.standardDekoration && <div>✓ Standard Dekoration Saal sowie Tischdekoration</div>}
              {formData.serviceAllgemein && <div>✓ Service im Allgemein</div>}
              {formData.bandDj && <div>✓ Band & DJ</div>}
              {formData.videoKameraKranHDOhne && <div>✓ 3 x Video Kamera inkl. Kran HD (ohne Brautabholung)</div>}
            </div>
          </div>
        </div>

        {/* Kostenübersicht */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', borderBottom: '2px solid #000', paddingBottom: '5px' }}>
            Kostenübersicht
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div><strong>Angebotssumme:</strong> {formData.angebotssumme} €</div>
            <div><strong>Saalmiete:</strong> {formData.saalmiete} €</div>
            <div><strong>Service:</strong> {formData.service} €</div>
            <div><strong>Gesamtpreis:</strong> {formData.gesamtpreis} €</div>
            <div><strong>Abzgl. Anzahlung:</strong> {formData.anzahlung} €</div>
            <div><strong>Restzahlung:</strong> {formData.restzahlung} €</div>
          </div>
        </div>

        {/* Veranstaltungszeit */}
        <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Veranstaltungszeit</h3>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Veranstaltungszeitraum ist von 16:00 bis 24:00 Uhr</p>
          <p style={{ margin: '5px 0 0', fontSize: '14px' }}>
            Nach 24:00 Uhr, behält sich der Vermieter das Recht vor, für jede weitere angefangene Stunde 500,-€ zusätzlich als Saalmiete aufrufen.
          </p>
        </div>

        {/* Rechtliche Hinweise */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', borderBottom: '2px solid #000', paddingBottom: '5px' }}>
            Rechtliche Hinweise
          </h2>
          <div style={{ padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px', border: '1px solid #ffeaa7' }}>
            <p style={{ margin: '0 0 10px', fontWeight: 'bold' }}>Dieses Angebot berechtigt nicht zum Vorsteuerabzug.</p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Bei Absage durch den Kunden (auch bei Todesfällen) wird die Anzahlung nicht erstattet.</li>
              <li>Der Veranstalter kann bei Absage Strafzahlungen verlangen.</li>
              <li>Der Veranstalter kann bei höherer Gewalt das Event absagen.</li>
              <li>Die Reservierung wird erst nach Erhalt der Anzahlung verbindlich.</li>
              <li>Wir empfehlen dem Mieter, eine Eventversicherung (z. B. HanseMerkur Versicherung) abzuschließen.</li>
            </ul>
          </div>
        </div>

        {/* Angebot angenommen */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', borderBottom: '2px solid #000', paddingBottom: '5px' }}>
            Angebot angenommen
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <div style={{ marginBottom: '10px' }}><strong>Angebot angenommen:</strong></div>
              <div style={{ height: '40px', borderBottom: '1px solid #000' }}></div>
            </div>
            <div>
              <div style={{ marginBottom: '10px' }}><strong>Datum & Unterschrift Kunde/n:</strong></div>
              <div style={{ height: '40px', borderBottom: '1px solid #000' }}></div>
            </div>
            <div>
              <div style={{ marginBottom: '10px' }}><strong>Datum & Unterschrift BELLAVUE Event:</strong></div>
              <div style={{ height: '40px', borderBottom: '1px solid #000' }}></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ccc' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
            BELLAVUE Event - Ihr Partner für unvergessliche Veranstaltungen
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default EventForm; 