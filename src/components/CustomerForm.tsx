import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import type { Customer } from '../types';
import type { SelectChangeEvent } from '@mui/material';

interface CustomerFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (customer: Omit<Customer, 'id'>) => void;
  eventData?: {
    title: string;
    customer: string;
    contactPerson: string;
    contactPhone: string;
    contactEmail: string;
    eventTypes: string[];
    guestCount: string;
    budget: string;
    description: string;
    specialRequirements: string;
    notes: string;
    catering: boolean;
    decoration: boolean;
    music: boolean;
    photography: boolean;
  };
}

const CustomerForm: React.FC<CustomerFormProps> = ({ open, onClose, onSubmit, eventData }) => {
  const [formData, setFormData] = useState({
    name: eventData?.customer || '',
    email: eventData?.contactEmail || '',
    phone: eventData?.contactPhone || '',
    address: '',
    events: [] as string[],
    tags: [] as string[],
    notes: eventData?.notes || '',
    company: '',
    vatNumber: '',
    contactPerson: eventData?.contactPerson || '',
    website: '',
    birthday: '',
    anniversary: '',
    preferences: {
      catering: eventData?.catering || false,
      decoration: eventData?.decoration || false,
      music: eventData?.music || false,
      photography: eventData?.photography || false
    },
    budget: eventData?.budget || '',
    guestCount: eventData?.guestCount || '',
    specialRequirements: eventData?.specialRequirements || ''
  });

  const tagOptions = ['VIP', 'Stammkunde', 'Firmenkunde', 'Privatkunde', 'Hochzeit', 'Firmenfeier', 'Geburtstag'];

  const handleTagsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      tags: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleSubmit = () => {
    const newCustomer: Omit<Customer, 'id'> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      events: formData.events,
      tags: formData.tags,
      notes: formData.notes,
      contactPerson: formData.contactPerson,
      company: formData.company,
      website: formData.website,
      vatNumber: formData.vatNumber,
      birthday: formData.birthday,
      anniversary: formData.anniversary,
      preferences: formData.preferences,
      budget: formData.budget,
      guestCount: formData.guestCount,
      specialRequirements: formData.specialRequirements
    };

    onSubmit(newCustomer);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      name: eventData?.customer || '',
      email: eventData?.contactEmail || '',
      phone: eventData?.contactPhone || '',
      address: '',
      events: [],
      tags: [],
      notes: eventData?.notes || '',
      company: '',
      vatNumber: '',
      contactPerson: eventData?.contactPerson || '',
      website: '',
      birthday: '',
      anniversary: '',
      preferences: {
        catering: eventData?.catering || false,
        decoration: eventData?.decoration || false,
        music: eventData?.music || false,
        photography: eventData?.photography || false
      },
      budget: eventData?.budget || '',
      guestCount: eventData?.guestCount || '',
      specialRequirements: eventData?.specialRequirements || ''
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {eventData ? 'Kunde für Event erstellen' : 'Neuen Kunden erstellen'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {/* Event Information (if available) */}
          {eventData && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Event-Informationen
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Event:</strong> {eventData.title}
              </Typography>
              {eventData.description && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Beschreibung:</strong> {eventData.description}
                </Typography>
              )}
            </Box>
          )}

          {/* Basic Customer Information */}
          <Typography variant="h6" gutterBottom>
            Grundinformationen
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Kundenname"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="E-Mail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Telefon"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
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
                label="Adresse"
                multiline
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Firma"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="USt-IdNr."
                value={formData.vatNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, vatNumber: e.target.value }))}
              />
            </Box>
          </Box>

          {/* Event-specific information */}
          {eventData && (
            <>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 250 }}>
                  <TextField
                    fullWidth
                    label="Budget"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  />
                </Box>

                <Box sx={{ flex: 1, minWidth: 250 }}>
                  <TextField
                    fullWidth
                    label="Anzahl Gäste"
                    value={formData.guestCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, guestCount: e.target.value }))}
                  />
                </Box>
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
            </>
          )}

          {/* Tags */}
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Tags</InputLabel>
              <Select
                multiple
                value={formData.tags}
                onChange={handleTagsChange}
                input={<OutlinedInput label="Tags" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {tagOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Preferences */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Präferenzen
          </Typography>

          <Box sx={{ mb: 3 }}>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.preferences.catering}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, catering: e.target.checked }
                    }))}
                  />
                }
                label="Catering"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.preferences.decoration}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, decoration: e.target.checked }
                    }))}
                  />
                }
                label="Dekoration"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.preferences.music}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, music: e.target.checked }
                    }))}
                  />
                }
                label="Musik"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.preferences.photography}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, photography: e.target.checked }
                    }))}
                  />
                }
                label="Fotografie"
              />
            </FormGroup>
          </Box>

          {/* Additional Information */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Notizen"
              multiline
              rows={3}
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
          disabled={!formData.name || !formData.email || !formData.phone}
        >
          {eventData ? 'Kunde erstellen' : 'Kunde erstellen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerForm; 