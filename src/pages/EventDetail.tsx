import { useState, useEffect } from 'react';
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
  Checkbox
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
  Download as DownloadIcon
} from '@mui/icons-material';
import type { Event } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { getStatusLabel } from '../utils';

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

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
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