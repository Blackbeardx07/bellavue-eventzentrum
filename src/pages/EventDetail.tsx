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
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { de } from 'date-fns/locale';
import {
  Comment as CommentIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Description as FileIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import type { Event } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { getStatusLabel } from '../utils';
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
  const [newComment, setNewComment] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
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

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const updatedComments = [...(editedEvent.comments || []), newComment];
    setEditedEvent({
      ...editedEvent,
      comments: updatedComments,
    });
    setNewComment('');
  };

  const handleDownloadFile = (fileName: string) => {
    // Erstelle einen Blob mit dem Dateinamen als Inhalt für Demo-Zwecke
    const content = `Inhalt der Datei: ${fileName}\n\nDies ist eine Demo-Datei für das Event "${editedEvent.title}".\nErstellt am: ${new Date().toLocaleDateString('de-DE')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    
    // Cleanup
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    if (!contentRef.current) return;

    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
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

      pdf.save(`event-${editedEvent.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);
    } catch (error) {
      console.error('Fehler beim PDF-Export:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }} ref={contentRef}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            {isEditing ? 'Event bearbeiten' : 'Event-Details'}
          </Typography>
          <Box>
            {isEditing ? (
              <>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{ mr: 1 }}
                >
                  Speichern
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  sx={{ mr: 1 }}
                >
                  Abbrechen
                </Button>
              </>
            ) : (
              <>
                <IconButton 
                  onClick={handleExportPDF}
                  sx={{ mr: 1 }}
                  title="Als PDF exportieren"
                >
                  <PdfIcon />
                </IconButton>
                <IconButton 
                  onClick={() => {
                    if (mode !== 'edit') {
                      navigate(`${location.pathname}?mode=edit`);
                    }
                  }} 
                  sx={{ mr: 1 }}
                  disabled={role !== 'admin'}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  onClick={handleDelete} 
                  color="error" 
                  sx={{ mr: 1 }}
                  disabled={role !== 'admin'}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        <Box sx={{ pt: 1 }}>
          {/* Basic Information */}
          <Typography variant="h6" gutterBottom>
            Grundinformationen
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Event-Titel"
                value={editedEvent.title}
                onChange={(e) => setEditedEvent(prev => ({ ...prev, title: e.target.value }))}
                disabled={!isEditing}
              />
            </Box>


          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                <DateTimePicker
                  label="Datum & Uhrzeit"
                  value={new Date(editedEvent.date)}
                  onChange={(newValue) => setEditedEvent(prev => ({ 
                    ...prev, 
                    date: newValue ? newValue.toISOString().split('T')[0] : prev.date 
                  }))}
                  slotProps={{ textField: { fullWidth: true, disabled: !isEditing } }}
                />
              </LocalizationProvider>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editedEvent.status}
                  label="Status"
                  onChange={(e) => setEditedEvent(prev => ({ ...prev, status: e.target.value as Event['status'] }))}
                  disabled={!isEditing}
                >
                  <MenuItem value="planned">{getStatusLabel('planned')}</MenuItem>
                  <MenuItem value="confirmed">{getStatusLabel('confirmed')}</MenuItem>
                  <MenuItem value="cancelled">{getStatusLabel('cancelled')}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Anzahl Gäste"
                type="number"
                value={editedEvent.guestCount || ''}
                onChange={(e) => setEditedEvent(prev => ({ ...prev, guestCount: e.target.value }))}
                disabled={!isEditing}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Kosten (€)"
                type="number"
                value={editedEvent.kosten || ''}
                onChange={(e) => setEditedEvent(prev => ({ ...prev, kosten: e.target.value }))}
                disabled={!isEditing}
              />
            </Box>
          </Box>

          {/* Event Ort */}
          {editedEvent.eventTypes && editedEvent.eventTypes.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Event Ort
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {editedEvent.eventTypes.map((type, index) => (
                  <Chip key={index} label={type} size="small" />
                ))}
              </Box>
            </Box>
          )}

          {/* Service-Angebot Details */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Service-Angebot Details
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
              label="Veranstaltungsart"
              value={editedEvent.veranstaltungsart || editedEvent.eventTypes?.[0] || ''}
              onChange={(e) => setEditedEvent(prev => ({ 
                ...prev, 
                veranstaltungsart: e.target.value,
                eventTypes: [e.target.value]
              }))}
              disabled={!isEditing}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
            <TextField
              fullWidth
              label="Personenanzahl"
              type="number"
              value={editedEvent.personenanzahl || editedEvent.guestCount || ''}
              onChange={(e) => setEditedEvent(prev => ({ 
                ...prev, 
                personenanzahl: e.target.value,
                guestCount: e.target.value
              }))}
              disabled={!isEditing}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
            <TextField
              fullWidth
              label="Wochentag"
              value={editedEvent.wochentag || editedEvent.description?.split('\n').find(line => line.includes('Wochentag'))?.split(': ')[1] || ''}
              onChange={(e) => {
                setEditedEvent(prev => ({ 
                  ...prev, 
                  wochentag: e.target.value
                }));
              }}
              disabled={!isEditing}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
            <TextField
              fullWidth
              label="Angebotssumme (€)"
              type="number"
              value={editedEvent.angebotssumme || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, angebotssumme: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
            <TextField
              fullWidth
              label="Saalmiete (€)"
              type="number"
              value={editedEvent.saalmiete || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, saalmiete: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
            <TextField
              fullWidth
              label="Service (€)"
              type="number"
              value={editedEvent.service || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, service: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
            <TextField
              fullWidth
              label="Gesamtpreis (€)"
              type="number"
              value={editedEvent.gesamtpreis || editedEvent.kosten || ''}
              onChange={(e) => setEditedEvent(prev => ({ 
                ...prev, 
                gesamtpreis: e.target.value,
                kosten: e.target.value
              }))}
              disabled={!isEditing}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
            <TextField
              fullWidth
              label="Anzahlung (€)"
              type="number"
              value={editedEvent.anzahlung || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, anzahlung: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
            <TextField
              fullWidth
              label="Restzahlung (€)"
              type="number"
              value={editedEvent.restzahlung || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, restzahlung: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
          </Box>

          {/* Allgemeine Event Information */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Allgemeine Event Information
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
              label="Anzahl Personen"
              type="number"
              value={editedEvent.guestCount || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, guestCount: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
            <TextField
              fullWidth
              label="Veranstaltungsart"
              value={editedEvent.eventTypes?.[0] || ''}
              onChange={(e) => setEditedEvent(prev => ({ 
                ...prev, 
                eventTypes: [e.target.value]
              }))}
              disabled={!isEditing}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
            <TextField
              fullWidth
              label="Wochentag"
              value={editedEvent.description?.split('\n').find(line => line.includes('Wochentag'))?.split(': ')[1] || ''}
              onChange={(e) => {
                const lines = editedEvent.description?.split('\n') || [];
                const updatedLines = lines.map(line => 
                  line.includes('Wochentag') ? `Wochentag: ${e.target.value}` : line
                );
                setEditedEvent(prev => ({ 
                  ...prev, 
                  description: updatedLines.join('\n')
                }));
              }}
              disabled={!isEditing}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
          </Box>

          {/* Eventsaal Auswahl */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Eventsaal (Checkbox-Auswahl):
            </Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editedEvent.room?.includes('Eventsaal 1') || false}
                    disabled={!isEditing}
                  />
                }
                label="Eventsaal 1"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editedEvent.room?.includes('Eventsaal 2') || false}
                    disabled={!isEditing}
                  />
                }
                label="Eventsaal 2"
              />
            </FormGroup>
          </Box>

          {/* Service-Angebot Leistungen */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
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
                    label="Halbes Hähnchen (Tischservice)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.reis || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, reis: e.target.checked }))}
                      />
                    }
                    label="Reis (Tischbuffet)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.gemuese || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, gemuese: e.target.checked }))}
                      />
                    }
                    label="Gemüse (Tischbuffet) oder"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.salatJahreszeit || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, salatJahreszeit: e.target.checked }))}
                      />
                    }
                    label="Salat entsprechend der Jahreszeit (Tischbuffet)"
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
                    label="Softgetränke und Mineralwasser (Tischservice ohne Limit)"
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
                    label="Hochzeitstorte 3 Etagen (Geschmack nach Wahl) oder"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.hochzeitstorteFlach || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, hochzeitstorteFlach: e.target.checked }))}
                      />
                    }
                    label="Hochzeitstorte (flach) zum selber bestücken mit 5 Sorten Früchten"
                  />
                </FormGroup>

                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2, mt: 3 }}>
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
                    label="Standard Dekoration Saal sowie Tischdekoration"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.serviceAllgemein || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, serviceAllgemein: e.target.checked }))}
                      />
                    }
                    label="Service im Allgemein"
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
              </Box>
            </Box>
          </Box>

          {/* Leistungen */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Weitere Leistungen
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
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.serviceAllgemein || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, serviceAllgemein: e.target.checked }))}
                      />
                    }
                    label="Service im Allgemein"
                  />
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
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.etSoteHaehnchengeschnetzeltes || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, etSoteHaehnchengeschnetzeltes: e.target.checked }))}
                      />
                    }
                    label="Hähnchengeschnetzeltes (Tischservice)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.tavukSoteRindergulasch || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, tavukSoteRindergulasch: e.target.checked }))}
                      />
                    }
                    label="Rindergulasch (Tischservice)"
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
                        checked={editedEvent.halbesHaehnchen || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, halbesHaehnchen: e.target.checked }))}
                      />
                    }
                    label="Halbes Hähnchen (Tischservice)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.antipastiVorspeisenBrot || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, antipastiVorspeisenBrot: e.target.checked }))}
                      />
                    }
                    label="3 Sorten Vorspeisen und Brot (Meze) - Tischservice"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.obstschale || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, obstschale: e.target.checked }))}
                      />
                    }
                    label="Obstteller (Tischservice)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.nachtischBaklava || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, nachtischBaklava: e.target.checked }))}
                      />
                    }
                    label="Nachtisch (z. B. Baklava pro Tisch - 1 Teller)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.teeKaffeeservice || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, teeKaffeeservice: e.target.checked }))}
                      />
                    }
                    label="Tee & Kaffeeservice"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.softgetraenkeMineralwasser || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, softgetraenkeMineralwasser: e.target.checked }))}
                      />
                    }
                    label="Softgetränke & Mineralwasser (ohne Limit)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.hochzeitstorte3Etagen || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, hochzeitstorte3Etagen: e.target.checked }))}
                      />
                    }
                    label="Hochzeitstorte (4-5 Etagen, Pyramidenform)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.standardDekoration || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, standardDekoration: e.target.checked }))}
                      />
                    }
                    label="Knabbereien (Cerez) - Tischservice"
                  />
                </FormGroup>
              </Box>
              <Box sx={{ flex: 1, minWidth: 350 }}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.bandDj || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, bandDj: e.target.checked }))}
                      />
                    }
                    label="Band"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.serviceAllgemein || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, serviceAllgemein: e.target.checked }))}
                      />
                    }
                    label="DJ"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.videoKameraKranHDOhne || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, videoKameraKranHDOhne: e.target.checked }))}
                      />
                    }
                    label="1× Kamera-Kran HD (ohne Brautabholung)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.videoKameraKranHDMitBrautigam || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, videoKameraKranHDMitBrautigam: e.target.checked }))}
                      />
                    }
                    label="1× Kamera-Kran HD (mit Brautabholung)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.davulZurna4Stunden || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, davulZurna4Stunden: e.target.checked }))}
                      />
                    }
                    label="1× Davul & Zurna (4-5 Std. im Saal)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.davulZurnaMitBrautabholung || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, davulZurnaMitBrautabholung: e.target.checked }))}
                      />
                    }
                    label="1× Davul & Zurna (inkl. Brautabholung und 4-5 Std. im Saal)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.saeulenabgrenzungBlumenFeuerwerk || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, saeulenabgrenzungBlumenFeuerwerk: e.target.checked }))}
                      />
                    }
                    label="Saal- & Tischdekoration"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={editedEvent.saeulenabgrenzungKuchenAnschneiden || false} 
                        disabled={!isEditing}
                        onChange={(e) => setEditedEvent(prev => ({ ...prev, saeulenabgrenzungKuchenAnschneiden: e.target.checked }))}
                      />
                    }
                    label="Feuerwerk & Bodennebel (für den 1. Tanz)"
                  />
                </FormGroup>
              </Box>
            </Box>
          </Box>

          {/* Veranstaltungszeit */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Veranstaltungszeit
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
            <Typography variant="body1" gutterBottom>
              Feste Zeit: 16:00 Uhr bis 24:00 Uhr
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nach 24:00 Uhr ist für jede weitere angefangene Stunde eine zusätzliche Gebühr von 500 € fällig (zusätzlich zur Saalmiete).
            </Typography>
          </Box>

          {/* Kostenübersicht */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
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
              {/* Erste Zeile: Mietzahlung + Servicezahlung = Gesamtzahlung */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <TextField
                    fullWidth
                    label="Mietzahlung (€)"
                    type="number"
                    value={editedEvent.kosten ? (parseFloat(editedEvent.kosten) * 0.6).toString() : ''}
                    onChange={(e) => {
                      const mietzahlung = parseFloat(e.target.value) || 0;
                      const servicezahlung = parseFloat(editedEvent.kosten || '0') - mietzahlung;
                      setEditedEvent(prev => ({ 
                        ...prev, 
                        kosten: (mietzahlung + servicezahlung).toString()
                      }));
                    }}
                    disabled={!isEditing}
                  />
                </Box>
                <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                  +
                </Typography>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <TextField
                    fullWidth
                    label="Servicezahlung (€)"
                    type="number"
                    value={editedEvent.kosten ? (parseFloat(editedEvent.kosten) * 0.4).toString() : ''}
                    onChange={(e) => {
                      const servicezahlung = parseFloat(e.target.value) || 0;
                      const mietzahlung = parseFloat(editedEvent.kosten || '0') - servicezahlung;
                      setEditedEvent(prev => ({ 
                        ...prev, 
                        kosten: (mietzahlung + servicezahlung).toString()
                      }));
                    }}
                    disabled={!isEditing}
                  />
                </Box>
                <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                  =
                </Typography>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <TextField
                    fullWidth
                    label="Gesamtzahlung (€)"
                    type="number"
                    value={editedEvent.kosten || ''}
                    onChange={(e) => setEditedEvent(prev => ({ ...prev, kosten: e.target.value }))}
                    disabled={!isEditing}
                  />
                </Box>
              </Box>
              
              {/* Zweite Zeile: Gesamtzahlung - Anzahlung = Restzahlung */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <TextField
                    fullWidth
                    label="Gesamtzahlung (€)"
                    type="number"
                    value={editedEvent.kosten || ''}
                    disabled
                  />
                </Box>
                <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                  -
                </Typography>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <TextField
                    fullWidth
                    label="Anzahlung (€)"
                    type="number"
                    value={editedEvent.anzahlung || ''}
                    onChange={(e) => setEditedEvent(prev => ({ ...prev, anzahlung: e.target.value }))}
                    disabled={!isEditing}
                  />
                </Box>
                <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                  =
                </Typography>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <TextField
                    fullWidth
                    label="Restzahlung (€)"
                    type="number"
                    value={editedEvent.restzahlung || ''}
                    disabled
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Extras / Zusatzleistungen */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Extras / Zusatzleistungen
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
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={editedEvent.eingangsfeuerwerkBrautpaar || false} 
                    disabled={!isEditing}
                    onChange={(e) => setEditedEvent(prev => ({ ...prev, eingangsfeuerwerkBrautpaar: e.target.checked }))}
                  />
                }
                label="Gold- & Eingangsfeuerwerk (2 Stück), 4× Bodennebel, 1. Tanz Feuerwerk – 300 €"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={editedEvent.helikopterlandung || false} 
                    disabled={!isEditing}
                    onChange={(e) => setEditedEvent(prev => ({ ...prev, helikopterlandung: e.target.checked }))}
                  />
                }
                label="Helikopterlandung auf Parkplatz – 2.000 €"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={editedEvent.helikopterlandung || false} 
                    disabled={!isEditing}
                    onChange={(e) => setEditedEvent(prev => ({ ...prev, helikopterlandung: e.target.checked }))}
                  />
                }
                label="Feuerwerk beim Eingang, 1. Tanz, Kuchen – 1.000 €"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={editedEvent.obstKuchenbuffetTatli || false} 
                    disabled={!isEditing}
                    onChange={(e) => setEditedEvent(prev => ({ ...prev, obstKuchenbuffetTatli: e.target.checked }))}
                  />
                }
                label="Dekor 'Vintage' – 400 € (inkl. Silbervasen & Kerzen)"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={editedEvent.cigkoefteTischservice || false} 
                    disabled={!isEditing}
                    onChange={(e) => setEditedEvent(prev => ({ ...prev, cigkoefteTischservice: e.target.checked }))}
                  />
                }
                label="Dekor 'Platin' – 600 € (inkl. 9 Kerzenständer & Vasen)"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={editedEvent.obstKuchenbuffetTatli || false} 
                    disabled={!isEditing}
                    onChange={(e) => setEditedEvent(prev => ({ ...prev, obstKuchenbuffetTatli: e.target.checked }))}
                  />
                }
                label="Obst- & Kuchenbuffet inkl. Tatlı – 1.500 € (max. 300 Pers.)"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={editedEvent.suppeHauptgang || false} 
                    disabled={!isEditing}
                    onChange={(e) => setEditedEvent(prev => ({ ...prev, suppeHauptgang: e.target.checked }))}
                  />
                }
                label="Meze-Buffet mit Hauptgang – 1.250 €, je 100 Pers. extra +150 €"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={editedEvent.cigkoefteTischservice || false} 
                    disabled={!isEditing}
                    onChange={(e) => setEditedEvent(prev => ({ ...prev, cigkoefteTischservice: e.target.checked }))}
                  />
                }
                label="Çiğköfte (Tischservice) für 1.000 Personen – 1.500 €, +150 €/weitere 100 Pers."
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={editedEvent.cocktailEmpfang || false} 
                    disabled={!isEditing}
                    onChange={(e) => setEditedEvent(prev => ({ ...prev, cocktailEmpfang: e.target.checked }))}
                  />
                }
                label="Vegetarisches Buffet (4 Sorten Menü) – 500 €"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={editedEvent.suppeHauptgang || false} 
                    disabled={!isEditing}
                    onChange={(e) => setEditedEvent(prev => ({ ...prev, suppeHauptgang: e.target.checked }))}
                  />
                }
                label="Suppe vor Hauptgang (Tischservice) – 2.100 € für 700 Pers."
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={editedEvent.cocktailEmpfang || false} 
                    disabled={!isEditing}
                    onChange={(e) => setEditedEvent(prev => ({ ...prev, cocktailEmpfang: e.target.checked }))}
                  />
                }
                label="Cocktail-Empfang (alkoholfrei, 2 Std., max. 1.000 Pers.) – 1.200 €"
              />
            </FormGroup>
          </Box>

          {/* Hinweise */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Hinweise
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 4 }}>
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

          {/* Datum & Unterschrift */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Datum & Unterschrift
          </Typography>
          
          <TextField
            fullWidth
            label="Unterschrift"
            multiline
            rows={3}
            value={editedEvent.signature || ''}
            onChange={(e) => setEditedEvent(prev => ({ ...prev, signature: e.target.value }))}
            disabled={!isEditing}
            placeholder="Hier können Sie Ihre Unterschrift eingeben oder Notizen hinzufügen..."
          />

          {/* Kunden-Präferenzen */}
          <Typography variant="subtitle1" gutterBottom>
            Kunden-Präferenzen
          </Typography>
          <Box sx={{ mb: 3 }}>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editedEvent.preferences?.catering || false}
                    onChange={(e) => setEditedEvent(prev => ({
                      ...prev,
                      preferences: { 
                        catering: e.target.checked,
                        decoration: prev.preferences?.decoration || false,
                        music: prev.preferences?.music || false,
                        photography: prev.preferences?.photography || false
                      }
                    }))}
                    disabled={!isEditing}
                  />
                }
                label="Catering"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editedEvent.preferences?.decoration || false}
                    onChange={(e) => setEditedEvent(prev => ({
                      ...prev,
                      preferences: { 
                        catering: prev.preferences?.catering || false,
                        decoration: e.target.checked,
                        music: prev.preferences?.music || false,
                        photography: prev.preferences?.photography || false
                      }
                    }))}
                    disabled={!isEditing}
                  />
                }
                label="Dekoration"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editedEvent.preferences?.music || false}
                    onChange={(e) => setEditedEvent(prev => ({
                      ...prev,
                      preferences: { 
                        catering: prev.preferences?.catering || false,
                        decoration: prev.preferences?.decoration || false,
                        music: e.target.checked,
                        photography: prev.preferences?.photography || false
                      }
                    }))}
                    disabled={!isEditing}
                  />
                }
                label="Musik"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editedEvent.preferences?.photography || false}
                    onChange={(e) => setEditedEvent(prev => ({
                      ...prev,
                      preferences: { 
                        catering: prev.preferences?.catering || false,
                        decoration: prev.preferences?.decoration || false,
                        music: prev.preferences?.music || false,
                        photography: e.target.checked
                      }
                    }))}
                    disabled={!isEditing}
                  />
                }
                label="Fotografie"
              />
            </FormGroup>
          </Box>

          {/* Customer Information */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Kundeninformationen
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              {isEditing ? (
                <TextField
                  fullWidth
                  label="Kunde"
                  value={editedEvent.customer}
                  onChange={(e) => setEditedEvent(prev => ({ ...prev, customer: e.target.value }))}
                />
              ) : (
                <Box
                  onClick={() => {
                    console.log('Kunde clicked in EventDetail:', editedEvent.customer, 'customerId:', editedEvent.customerId);
                    window.location.href = `/customer/${editedEvent.customerId}`;
                  }}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Kunde
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {editedEvent.customer}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* File Upload */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Dateien
          </Typography>

          {editedEvent.files && editedEvent.files.length > 0 && (
            <List dense>
              {editedEvent.files.map((file, index) => (
                <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                  <FileIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <ListItemText
                    primary={file}
                    secondary="Datei"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadFile(file)}
                    >
                      Herunterladen
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}

          {/* Description and Notes */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Beschreibung"
              multiline
              rows={3}
              value={editedEvent.description || ''}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, description: e.target.value }))}
              disabled={!isEditing}
            />
          </Box>

          {/* Besondere Anforderungen */}
          {editedEvent.specialRequirements && (
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Besondere Anforderungen"
                multiline
                rows={2}
                value={editedEvent.specialRequirements}
                onChange={(e) => setEditedEvent(prev => ({ ...prev, specialRequirements: e.target.value }))}
                disabled={!isEditing}
              />
            </Box>
          )}

          {/* Notizen */}
          {editedEvent.notes && (
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Notizen"
                multiline
                rows={2}
                value={editedEvent.notes}
                onChange={(e) => setEditedEvent(prev => ({ ...prev, notes: e.target.value }))}
                disabled={!isEditing}
              />
            </Box>
          )}

          {/* Comments */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Kommentare ({editedEvent.comments?.length || 0})
            </Typography>
            <List>
              {editedEvent.comments?.map((comment, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CommentIcon />
                  </ListItemIcon>
                  <ListItemText primary={comment} />
                </ListItem>
              ))}
            </List>
            {isEditing && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <TextField
                  fullWidth
                  label="Neuer Kommentar"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  Hinzufügen
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      <ConfirmDialog
        open={confirmDialog}
        title="Event löschen"
        message={`Möchten Sie das Event "${event.title}" wirklich löschen?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Löschen"
        cancelText="Abbrechen"
        isDestructive={true}
      />
    </Box>
  );
} 