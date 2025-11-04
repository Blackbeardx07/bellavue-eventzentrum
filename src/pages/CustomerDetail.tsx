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
  mode?: 'view' | 'edit' | string;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({
  customer,
  events,
  onSave,
  onDelete,
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
    console.log('Event clicked in CustomerDetail:', event);
    // Navigiere zur Event-Detail-Seite
    navigate(`/event/${event.id}?mode=view`);
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
          {/* Persönliche Kundeninformationen */}
          <Typography variant="h6" gutterBottom>
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
              value={editedCustomer.firstName || ''}
              onChange={(e) => {
                setEditedCustomer(prev => ({ 
                  ...prev, 
                  firstName: e.target.value,
                  name: `${e.target.value} ${prev.lastName || ''}`.trim()
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
              label="Nachname"
              value={editedCustomer.lastName || ''}
              onChange={(e) => {
                setEditedCustomer(prev => ({ 
                  ...prev, 
                  lastName: e.target.value,
                  name: `${prev.firstName || ''} ${e.target.value}`.trim()
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
              label="Firma"
              value={editedCustomer.company || ''}
              onChange={(e) => setEditedCustomer(prev => ({ ...prev, company: e.target.value }))}
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
              label="E-Mail"
              type="email"
              value={editedCustomer.email || ''}
              onChange={(e) => setEditedCustomer(prev => ({ ...prev, email: e.target.value }))}
              disabled={!isEditing}
              required
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
            <TextField
              fullWidth
              label="Telefon"
              value={editedCustomer.phone || ''}
              onChange={(e) => setEditedCustomer(prev => ({ ...prev, phone: e.target.value }))}
              disabled={!isEditing}
              required
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
            <TextField
              fullWidth
              label="Mobilnummer"
              value={editedCustomer.mobile || ''}
              onChange={(e) => setEditedCustomer(prev => ({ ...prev, mobile: e.target.value }))}
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
              label="Straße & Hausnummer"
              value={editedCustomer.streetAndNumber || ''}
              onChange={(e) => setEditedCustomer(prev => ({ ...prev, streetAndNumber: e.target.value }))}
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
              label="PLZ & Ort"
              value={editedCustomer.zipAndCity || ''}
              onChange={(e) => setEditedCustomer(prev => ({ ...prev, zipAndCity: e.target.value }))}
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
              label="Notizen"
              value={editedCustomer.notes || ''}
              onChange={(e) => setEditedCustomer(prev => ({ ...prev, notes: e.target.value }))}
              disabled={!isEditing}
              multiline
              rows={3}
              variant="outlined"
              sx={{ 
                gridColumn: { xs: '1', sm: '1 / -1' },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
          </Box>

          {/* Eventhistorie */}
          {customerEvents.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Eventhistorie ({customerEvents.length})
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
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {event.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(event.date).toLocaleDateString('de-DE')} - {event.time}
                        </Typography>
                        {event.kosten && (
                          <Typography variant="body2" color="primary.main" sx={{ mt: 0.5 }}>
                            Gesamtkosten: {event.kosten} €
                          </Typography>
                        )}
                        {event.guestCount && (
                          <Typography variant="body2" color="text.secondary">
                            Gäste: {event.guestCount}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={getStatusLabel(event.status)}
                          color={getStatusColor(event.status)}
                          size="small"
                        />
                        {event.veranstaltungsart && (
                          <Chip
                            label={event.veranstaltungsart}
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </Box>
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