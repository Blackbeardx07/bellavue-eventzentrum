import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Chip,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import type { Customer, Event } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { getStatusLabel, getStatusColor } from '../utils';

interface CustomerDetailProps {
  customer: Customer;
  events: Event[];
  onSave: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onEventClick: (event: Event) => void;
  mode?: 'view' | 'edit' | string;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({
  customer,
  events,
  onSave,
  onDelete,
  onEventClick,
  mode
}) => {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit');
  const [editedCustomer, setEditedCustomer] = React.useState<Customer>(customer);
  const [confirmDialog, setConfirmDialog] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();

  React.useEffect(() => {
    setIsEditing(mode === 'edit');
  }, [mode]);

  // Filter events for this customer
  const customerEvents = events.filter(event => event.customerId === customer.id);

  const handleSave = () => {
    onSave(editedCustomer);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedCustomer(customer);
    setIsEditing(false);
  };

  const handleDelete = () => {
    setConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(customer);
    navigate('/customers');
    setConfirmDialog(false);
  };

  const handleCancelDelete = () => {
    setConfirmDialog(false);
  };

  const handleEventClick = (event: Event) => {
    onEventClick(event);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            {isEditing ? 'Kunde bearbeiten' : 'Kundendetails'}
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
          {/* Basic Customer Information */}
          <Typography variant="h6" gutterBottom>
            Grundinformationen
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Kundenname"
                value={editedCustomer.name}
                onChange={(e) => setEditedCustomer(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="E-Mail"
                type="email"
                value={editedCustomer.email}
                onChange={(e) => setEditedCustomer(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Telefon"
                value={editedCustomer.phone}
                onChange={(e) => setEditedCustomer(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!isEditing}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Ansprechpartner"
                value={editedCustomer.contactPerson || ''}
                onChange={(e) => setEditedCustomer(prev => ({ ...prev, contactPerson: e.target.value }))}
                disabled={!isEditing}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Adresse"
                value={editedCustomer.address}
                onChange={(e) => setEditedCustomer(prev => ({ ...prev, address: e.target.value }))}
                disabled={!isEditing}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Firma"
                value={editedCustomer.company || ''}
                onChange={(e) => setEditedCustomer(prev => ({ ...prev, company: e.target.value }))}
                disabled={!isEditing}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Website"
                value={editedCustomer.website || ''}
                onChange={(e) => setEditedCustomer(prev => ({ ...prev, website: e.target.value }))}
                disabled={!isEditing}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="USt-IdNr."
                value={editedCustomer.vatNumber || ''}
                onChange={(e) => setEditedCustomer(prev => ({ ...prev, vatNumber: e.target.value }))}
                disabled={!isEditing}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Geburtstag"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={editedCustomer.birthday || ''}
                onChange={(e) => setEditedCustomer(prev => ({ ...prev, birthday: e.target.value }))}
                disabled={!isEditing}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label="Jahrestag"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={editedCustomer.anniversary || ''}
                onChange={(e) => setEditedCustomer(prev => ({ ...prev, anniversary: e.target.value }))}
                disabled={!isEditing}
              />
            </Box>
          </Box>

          {/* Kunden-Tags */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Tags (Komma-getrennt)"
              value={editedCustomer.tags.join(', ')}
              onChange={(e) => setEditedCustomer(prev => ({ 
                ...prev, 
                tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
              }))}
              disabled={!isEditing}
              helperText="Mehrere Tags mit Komma trennen."
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Notizen"
              multiline
              rows={3}
              value={editedCustomer.notes || ''}
              onChange={(e) => setEditedCustomer(prev => ({ ...prev, notes: e.target.value }))}
              disabled={!isEditing}
            />
          </Box>

          {/* Events */}
          {customerEvents.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Events ({customerEvents.length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {customerEvents.map((event) => (
                  <Paper 
                    key={event.id} 
                    sx={{ 
                      p: 2, 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        boxShadow: 2
                      }
                    }} 
                    onClick={() => {
                      console.log('Event clicked in CustomerDetail:', event);
                      handleEventClick(event);
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {event.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(event.date).toLocaleDateString('de-DE')} - {event.time}
                        </Typography>
                      </Box>
                      <Chip
                        label={getStatusLabel(event.status)}
                        color={getStatusColor(event.status)}
                        size="small"
                      />
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      <ConfirmDialog
        open={confirmDialog}
        title="Kunde löschen"
        message={`Möchten Sie den Kunden "${customer.name}" wirklich löschen?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Löschen"
        cancelText="Abbrechen"
        isDestructive={true}
      />
    </Box>
  );
};

export default CustomerDetail; 