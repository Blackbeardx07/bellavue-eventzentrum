import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import type { Event } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface EventDetailProps {
  event: Event;
  onSave: (event: Event) => void;
  onDelete: (event: Event) => void;
  mode?: 'view' | 'edit' | string;
}

export default function EventDetail({ event, onSave, onDelete, mode }: EventDetailProps) {
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [editedEvent, setEditedEvent] = useState<Event>(event);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const navigate = useNavigate();
  const { role } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsEditing(mode === 'edit');
  }, [mode]);

  const handleSave = () => {
    onSave(editedEvent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedEvent(event);
    setIsEditing(false);
  };

  const handleDelete = () => {
    setConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(event);
    navigate('/events');
    setConfirmDialog(false);
  };

  const handleCancelDelete = () => {
    setConfirmDialog(false);
  };

  const handleExportPDF = async () => {
    if (!contentRef.current) return;

    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`service-angebot-${editedEvent.title.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {isEditing ? 'Service-Angebot bearbeiten' : 'Service-Angebot Details'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isEditing ? (
              <>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{ bgcolor: 'success.main' }}
                >
                  Speichern
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                >
                  Abbrechen
                </Button>
              </>
            ) : (
              <>
                {role === 'admin' && (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                  >
                    Bearbeiten
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<PdfIcon />}
                  onClick={handleExportPDF}
                >
                  PDF Export
                </Button>
              </>
            )}
            {role === 'admin' && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
              >
                Löschen
              </Button>
            )}
          </Box>
        </Box>

        {/* PDF Content */}
        <div ref={contentRef} style={{ padding: '20px', backgroundColor: 'white' }}>
          {/* BELLAVUE Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#000' }}>BELLAVUE EVENT</h1>
            <p style={{ margin: '5px 0 0', fontSize: '16px', color: '#666' }}>Service Angebot</p>
          </div>

          {/* Persönliche Kundeninformationen */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 'bold', borderBottom: '2px solid #1976d2', pb: 1 }}>
            Persönliche Kundeninformationen
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
              label="Vorname"
              value={editedEvent.firstName || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, firstName: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Nachname"
              value={editedEvent.lastName || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, lastName: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Firma"
              value={editedEvent.company || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, company: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="E-Mail"
              value={editedEvent.email || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, email: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Telefon"
              value={editedEvent.phone || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, phone: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Mobil"
              value={editedEvent.mobile || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, mobile: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Adresse"
              value={editedEvent.address || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, address: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="PLZ & Ort"
              value={editedEvent.addressCity || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, addressCity: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
            />
          </Box>

          {/* Event Details */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 'bold', borderBottom: '2px solid #1976d2', pb: 1 }}>
            Event Details
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
            <FormControl fullWidth disabled={!isEditing}>
              <InputLabel>Veranstaltungsart</InputLabel>
              <Select
                value={editedEvent.veranstaltungsart || ''}
                onChange={(e) => setEditedEvent(prev => ({ ...prev, veranstaltungsart: e.target.value }))}
                label="Veranstaltungsart"
              >
                <MenuItem value="Hochzeit">Hochzeit</MenuItem>
                <MenuItem value="Firmenfeier">Firmenfeier</MenuItem>
                <MenuItem value="Geburtstag">Geburtstag</MenuItem>
                <MenuItem value="Jahresfeier">Jahresfeier</MenuItem>
                <MenuItem value="Weihnachtsfeier">Weihnachtsfeier</MenuItem>
                <MenuItem value="Sonstiges">Sonstiges</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Personenanzahl"
              type="number"
              value={editedEvent.personenanzahl || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, personenanzahl: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Wochentag"
              value={editedEvent.wochentag || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, wochentag: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Angebotssumme (€)"
              type="number"
              value={editedEvent.angebotssumme || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, angebotssumme: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Saalmiete (€)"
              type="number"
              value={editedEvent.saalmiete || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, saalmiete: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Service (€)"
              type="number"
              value={editedEvent.service || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, service: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Gesamtpreis (€)"
              type="number"
              value={editedEvent.gesamtpreis || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, gesamtpreis: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Anzahlung (€)"
              type="number"
              value={editedEvent.anzahlung || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, anzahlung: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Restzahlung (€)"
              type="number"
              value={editedEvent.restzahlung || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, restzahlung: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
            />
          </Box>

          {/* Brautpaar Informationen - nur bei Hochzeit */}
          {editedEvent.veranstaltungsart?.toLowerCase().includes('hochzeit') && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 'bold', borderBottom: '2px solid #1976d2', pb: 1 }}>
                Brautpaar Informationen
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
                  label="Anschrift Braut"
                  value={editedEvent.addressBride || ''}
                  onChange={(e) => setEditedEvent(prev => ({ ...prev, addressBride: e.target.value }))}
                  disabled={!isEditing}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Anschrift Bräutigam"
                  value={editedEvent.addressGroom || ''}
                  onChange={(e) => setEditedEvent(prev => ({ ...prev, addressGroom: e.target.value }))}
                  disabled={!isEditing}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Nationalität Braut"
                  value={editedEvent.nationalityBride || ''}
                  onChange={(e) => setEditedEvent(prev => ({ ...prev, nationalityBride: e.target.value }))}
                  disabled={!isEditing}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Nationalität Bräutigam"
                  value={editedEvent.nationalityGroom || ''}
                  onChange={(e) => setEditedEvent(prev => ({ ...prev, nationalityGroom: e.target.value }))}
                  disabled={!isEditing}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Alter Braut"
                  value={editedEvent.ageBride || ''}
                  onChange={(e) => setEditedEvent(prev => ({ ...prev, ageBride: e.target.value }))}
                  disabled={!isEditing}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Alter Bräutigam"
                  value={editedEvent.ageGroom || ''}
                  onChange={(e) => setEditedEvent(prev => ({ ...prev, ageGroom: e.target.value }))}
                  disabled={!isEditing}
                  variant="outlined"
                />
              </Box>
            </>
          )}

          {/* Service-Angebot Leistungen */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 'bold', borderBottom: '2px solid #1976d2', pb: 1 }}>
            Service-Angebot Leistungen
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
            <Box sx={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 350 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Tischaufstellung
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.rundeTische || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, rundeTische: e.target.checked }))}
                      />
                    }
                    label="Runde Tische"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.eckigeTische || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, eckigeTische: e.target.checked }))}
                      />
                    }
                    label="Eckige Tische"
                  />
                </FormGroup>

                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2, mt: 3 }}>
                  Essen & Catering
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.etSoteHaehnchengeschnetzeltes || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, etSoteHaehnchengeschnetzeltes: e.target.checked }))}
                      />
                    }
                    label="Et Sote / Hähnchengeschnetzeltes (Tischbuffet)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.tavukSoteRindergulasch || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, tavukSoteRindergulasch: e.target.checked }))}
                      />
                    }
                    label="Tavuk Sote / Rindergulasch (Tischbuffet)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.halbesHaehnchen || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, halbesHaehnchen: e.target.checked }))}
                      />
                    }
                    label="Halbes Hähnchen (Tischbuffet)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.reis || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, reis: e.target.checked }))}
                      />
                    }
                    label="Reis & Gemüse (Tischservice)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.gemuese || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, gemuese: e.target.checked }))}
                      />
                    }
                    label="Gemüse (Tischservice)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.salatJahreszeit || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, salatJahreszeit: e.target.checked }))}
                      />
                    }
                    label="Salat entsprechend der Jahreszeit (Tischservice)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.pommesSalzkartoffel || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, pommesSalzkartoffel: e.target.checked }))}
                      />
                    }
                    label="Pommes / Salzkartoffel (Tischservice)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.antipastiVorspeisenBrot || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, antipastiVorspeisenBrot: e.target.checked }))}
                      />
                    }
                    label="3 Sorten Antipasti / Vorspeisen und Brot (Meze) als (Tischservice)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.knabbereienCerez || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, knabbereienCerez: e.target.checked }))}
                      />
                    }
                    label="Knabbereien (Cerez) (Tischservice)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.obstschale || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, obstschale: e.target.checked }))}
                      />
                    }
                    label="Obstschale mind. 4-5 Sorten Obst (Tischservice)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.nachtischBaklava || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, nachtischBaklava: e.target.checked }))}
                      />
                    }
                    label="Nachtisch (z.B Baklava pro Tisch 1- Teller) (Tischservice)"
                  />
                </FormGroup>
              </Box>

              <Box sx={{ flex: 1, minWidth: 350 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Getränke
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.teeKaffeeservice || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, teeKaffeeservice: e.target.checked }))}
                      />
                    }
                    label="Tee & Kaffeeservice (Tee & Kaffee Station und Service im Bistro)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.softgetraenkeMineralwasser || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, softgetraenkeMineralwasser: e.target.checked }))}
                      />
                    }
                    label="Softgetränke & Mineralwasser (Tischservice)"
                  />
                </FormGroup>

                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2, mt: 3 }}>
                  Torte
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.hochzeitstorte3Etagen || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, hochzeitstorte3Etagen: e.target.checked }))}
                      />
                    }
                    label="Hochzeitstorte 3 Etagen"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.hochzeitstorteFlach || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, hochzeitstorteFlach: e.target.checked }))}
                      />
                    }
                    label="Hochzeitstorte Flach"
                  />
                </FormGroup>
              </Box>

              <Box sx={{ flex: 1, minWidth: 350 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Service
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.standardDekoration || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, standardDekoration: e.target.checked }))}
                      />
                    }
                    label="Standard Dekoration"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.serviceAllgemein || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, serviceAllgemein: e.target.checked }))}
                      />
                    }
                    label="Service Allgemein"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.bandDj || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, bandDj: e.target.checked }))}
                      />
                    }
                    label="Band & DJ"
                  />
                </FormGroup>

                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2, mt: 3 }}>
                  Video & Fotografie
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.videoKameraKranHDOhne || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, videoKameraKranHDOhne: e.target.checked }))}
                      />
                    }
                    label="3 x Video Kamera inkl. Kran HD (ohne Brautabholung)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.videoKameraKranHDMitBrautigam || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, videoKameraKranHDMitBrautigam: e.target.checked }))}
                      />
                    }
                    label="3 x Video Kamera inkl. Kran HD im Saal (inkl. Bräutigamabholung) S 5.8"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.fotoshootingUSB || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, fotoshootingUSB: e.target.checked }))}
                      />
                    }
                    label="Fotoshooting inkl. 35-40 Bilder auf USB Stick"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.weddingStoryClip || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, weddingStoryClip: e.target.checked }))}
                      />
                    }
                    label="Wedding Story Clip"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.fotoalbum || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, fotoalbum: e.target.checked }))}
                      />
                    }
                    label="Fotoalbum"
                  />
                </FormGroup>

                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2, mt: 3 }}>
                  Musik
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.davulZurna4Stunden || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, davulZurna4Stunden: e.target.checked }))}
                      />
                    }
                    label="Davul & Zurna 4 Stunden"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.davulZurnaMitBrautabholung || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, davulZurnaMitBrautabholung: e.target.checked }))}
                      />
                    }
                    label="Davul & Zurna mit Brautabholung"
                  />
                </FormGroup>
              </Box>

              <Box sx={{ flex: 1, minWidth: 350 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Dekoration & Effekte
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.saeulenabgrenzungBlumenFeuerwerk || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, saeulenabgrenzungBlumenFeuerwerk: e.target.checked }))}
                      />
                    }
                    label="Säulenabgrenzung mit Blumen & Feuerwerk"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.saeulenabgrenzungKuchenAnschneiden || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, saeulenabgrenzungKuchenAnschneiden: e.target.checked }))}
                      />
                    }
                    label="Säulenabgrenzung mit Kuchen Anschneiden"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.eingangsfeuerwerkBrautpaar || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, eingangsfeuerwerkBrautpaar: e.target.checked }))}
                      />
                    }
                    label="Eingangsfeuerwerk für Brautpaar"
                  />
                </FormGroup>

                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2, mt: 3 }}>
                  Extras
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.helikopterlandung || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, helikopterlandung: e.target.checked }))}
                      />
                    }
                    label="Helikopterlandung"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.obstKuchenbuffetTatli || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, obstKuchenbuffetTatli: e.target.checked }))}
                      />
                    }
                    label="Obst & Kuchenbuffet / Tatlı"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.cigkoefteTischservice || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, cigkoefteTischservice: e.target.checked }))}
                      />
                    }
                    label="Çiğköfte Tischservice"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.suppeHauptgang || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, suppeHauptgang: e.target.checked }))}
                      />
                    }
                    label="Suppe & Hauptgang"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.cocktailEmpfang || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, cocktailEmpfang: e.target.checked }))}
                      />
                    }
                    label="Cocktail Empfang"
                  />
                </FormGroup>
              </Box>
            </Box>
          </Box>

          {/* Unterschrift */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 'bold', borderBottom: '2px solid #1976d2', pb: 1 }}>
            Unterschrift
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
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
              label="Angebot angenommen"
              value={editedEvent.angebotAngenommen || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, angebotAngenommen: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Datum Unterschrift Kunde"
              value={editedEvent.datumUnterschriftKunde || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, datumUnterschriftKunde: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Datum Unterschrift BELLAVUE"
              value={editedEvent.datumUnterschriftBellavue || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, datumUnterschriftBellavue: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
            />
          </Box>
        </div>

        {/* Confirm Dialog */}
        <ConfirmDialog
          open={confirmDialog}
          title="Event löschen"
          message="Sind Sie sicher, dass Sie dieses Event löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          confirmText="Löschen"
          cancelText="Abbrechen"
          isDestructive={true}
        />
      </Paper>
    </Box>
  );
}