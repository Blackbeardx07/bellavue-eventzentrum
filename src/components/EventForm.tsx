import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Box,
  Typography,
  Chip,
  OutlinedInput,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { 
  CloudUpload as UploadIcon, 
  Delete as DeleteIcon,
  Description as FileIcon
} from '@mui/icons-material';
import type { Event, Customer } from '../types';
import type { SelectChangeEvent } from '@mui/material';

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: Omit<Event, 'id'>, customer: Omit<Customer, 'id'>) => void;
  initialDate?: Date;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

const EventForm: React.FC<EventFormProps> = ({ open, onClose, onSubmit, initialDate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: initialDate || new Date(),
    time: '',
    status: 'planned' as const,
    customerId: '',
    firstName: '',
    lastName: '',
    customer: '',
    description: '',
    eventTypes: [] as string[],
    guestCount: '',
    kosten: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    specialRequirements: '',
    notes: '',
    address: '',
    company: '',
    website: '',
    birthday: '',
    anniversary: '',
    vatNumber: '',
    tags: '',
    catering: false,
    decoration: false,
    music: false,
    photography: false
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const eventTypeOptions = ['Event 1', 'Event 2', 'Restaurant'];

  const handleEventTypesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      eventTypes: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
    // Reset input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileDelete = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = () => {
    // Event-Objekt
    const newEvent: Omit<Event, 'id'> = {
      title: formData.title,
      date: formData.date.toISOString().split('T')[0],
      time: formData.time,
      room: formData.eventTypes.join(', '), // Verwende eventTypes als room
      status: formData.status,
      customerId: '', // Wird später gesetzt
      customer: `${formData.firstName} ${formData.lastName}`.trim(),
      description: formData.description,
      files: uploadedFiles.map(file => file.name),
      assignedStaff: [],
      comments: [],
      guestCount: formData.guestCount,
      kosten: formData.kosten,
      specialRequirements: formData.specialRequirements,
      notes: formData.notes,
      eventTypes: formData.eventTypes,
      preferences: {
        catering: formData.catering,
        decoration: formData.decoration,
        music: formData.music,
        photography: formData.photography
      }
    };
    // Customer-Objekt
    const newCustomer: Omit<Customer, 'id'> = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.contactEmail,
      phone: formData.contactPhone,
      address: formData.address,
      events: [],
      tags: formData.tags ? formData.tags.split(',').map((t: string) => t.trim()) : [],
      notes: formData.notes,
      contactPerson: formData.contactPerson,
      company: formData.company,
      website: formData.website,
      vatNumber: formData.vatNumber,
      birthday: formData.birthday,
      anniversary: formData.anniversary,
      budget: formData.kosten,
      guestCount: formData.guestCount,
      specialRequirements: formData.specialRequirements,
      preferences: {
        catering: formData.catering,
        decoration: formData.decoration,
        music: formData.music,
        photography: formData.photography
      }
    };
    onSubmit(newEvent, newCustomer);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      date: initialDate || new Date(),
      time: '',
      status: 'planned',
      customerId: '',
      firstName: '',
      lastName: '',
      customer: '',
      description: '',
      eventTypes: [],
      guestCount: '',
      kosten: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      specialRequirements: '',
      notes: '',
      address: '',
      company: '',
      website: '',
      birthday: '',
      anniversary: '',
      vatNumber: '',
      tags: '',
      catering: false,
      decoration: false,
      music: false,
      photography: false
    });
    setUploadedFiles([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Neues Event erstellen</DialogTitle>
      <DialogContent>
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
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 250 }}>
              <FormControl fullWidth>
                <InputLabel>Ort</InputLabel>
                <Select
                  multiple
                  value={formData.eventTypes}
                  onChange={handleEventTypesChange}
                  input={<OutlinedInput label="Ort" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {eventTypeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <DateTimePicker
                label="Datum & Uhrzeit"
                value={formData.date}
                onChange={(newValue) => setFormData(prev => ({ ...prev, date: newValue || new Date() }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Anzahl Gäste"
                type="number"
                value={formData.guestCount}
                onChange={(e) => setFormData(prev => ({ ...prev, guestCount: e.target.value }))}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Kosten (€)"
                type="number"
                value={formData.kosten}
                onChange={(e) => setFormData(prev => ({ ...prev, kosten: e.target.value }))}
              />
            </Box>
          </Box>

          {/* Kunden-Präferenzen */}
          <Typography variant="subtitle1" gutterBottom>
            Kunden-Präferenzen
          </Typography>
          <Box sx={{ mb: 3 }}>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.catering}
                    onChange={(e) => setFormData(prev => ({ ...prev, catering: e.target.checked }))}
                  />
                }
                label="Catering"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.decoration}
                    onChange={(e) => setFormData(prev => ({ ...prev, decoration: e.target.checked }))}
                  />
                }
                label="Dekoration"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.music}
                    onChange={(e) => setFormData(prev => ({ ...prev, music: e.target.checked }))}
                  />
                }
                label="Musik"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.photography}
                    onChange={(e) => setFormData(prev => ({ ...prev, photography: e.target.checked }))}
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
              <TextField
                fullWidth
                label="Vorname"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Nachname"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Ansprechpartner"
                value={formData.contactPerson}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Telefon"
                value={formData.contactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="E-Mail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Adresse"
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Firma"
                value={formData.company || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Website"
                value={formData.website || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Geburtstag"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.birthday || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="USt-IdNr."
                value={formData.vatNumber || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, vatNumber: e.target.value }))}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Jahrestag"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.anniversary || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, anniversary: e.target.value }))}
              />
            </Box>
          </Box>

          {/* Kunden-Tags */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Tags (Komma-getrennt, z.B. VIP, Stammkunde)"
              value={formData.tags || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              helperText="Mehrere Tags mit Komma trennen."
            />
          </Box>

          {/* File Upload */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Dateien hochladen
          </Typography>

          <Box sx={{ mb: 3 }}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ mb: 2 }}
            >
              Dateien auswählen
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Unterstützte Formate: PDF, DOC, DOCX, JPG, PNG, TXT (Max. 10MB pro Datei)
            </Typography>
            
            {uploadedFiles.length > 0 && (
              <List dense>
                {uploadedFiles.map((file) => (
                  <ListItem key={file.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                    <FileIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <ListItemText
                      primary={file.name}
                      secondary={`${formatFileSize(file.size)} • ${file.type}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleFileDelete(file.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* Description and Notes */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Beschreibung"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Besondere Anforderungen"
              multiline
              rows={2}
              value={formData.specialRequirements}
              onChange={(e) => setFormData(prev => ({ ...prev, specialRequirements: e.target.value }))}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Notizen"
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Abbrechen</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={
            !formData.title ||
            !formData.firstName ||
            !formData.lastName ||
            formData.eventTypes.length === 0
          }
        >
          Event erstellen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventForm; 