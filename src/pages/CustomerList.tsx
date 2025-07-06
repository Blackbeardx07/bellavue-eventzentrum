import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import type { Customer } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../App';

interface CustomerListProps {
  customers: Customer[];
  onCustomerClick?: (customer: Customer) => void;
  onNewCustomer?: () => void;
  onDelete?: (customer: Customer) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, onCustomerClick, onNewCustomer, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    customer: Customer | null;
  }>({ open: false, customer: null });
  const navigate = useNavigate();
  const { role } = useAuth();

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleViewCustomer = (customer: Customer) => {
    navigate(`/customer/${customer.id}?mode=view`);
    if (onCustomerClick) {
      onCustomerClick(customer);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    navigate(`/customer/${customer.id}?mode=edit`);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setConfirmDialog({ open: true, customer });
  };

  const handleConfirmDelete = () => {
    if (confirmDialog.customer && onDelete) {
      onDelete(confirmDialog.customer);
    }
    setConfirmDialog({ open: false, customer: null });
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ open: false, customer: null });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Kunden durchsuchen"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ maxWidth: { sm: 400 } }}
        />
      </Box>

      {/* Customer Count */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
        }}>
          Kunden
        </Typography>
        {role === 'admin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onNewCustomer}
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1, sm: 2 }
            }}
          >
            Neuer Kunde
          </Button>
        )}
      </Box>

      {/* Mobile Card View */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {customer.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Email:</strong> {customer.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Telefon:</strong> {customer.phone}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Adresse:</strong> {customer.address}
              </Typography>
              {customer.notes && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Notizen:</strong> {customer.notes}
                </Typography>
              )}
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
              <Button size="small" onClick={() => handleViewCustomer(customer)}>
                Anzeigen
              </Button>
              {role === 'admin' && (
                <>
                  <Button size="small" onClick={() => handleEditCustomer(customer)}>
                    Bearbeiten
                  </Button>
                  <Button size="small" onClick={() => handleDeleteCustomer(customer)}>
                    Löschen
                  </Button>
                </>
              )}
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* Desktop Table View */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>Adresse</TableCell>
                <TableCell>Notizen</TableCell>
                <TableCell align="right">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id} hover>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>
                    {customer.notes && customer.notes.length > 50 
                      ? `${customer.notes.substring(0, 50)}...` 
                      : customer.notes}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewCustomer(customer)}
                        title="Kunde anzeigen"
                      >
                        <ViewIcon />
                      </IconButton>
                      {role === 'admin' && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleEditCustomer(customer)}
                            title="Kunde bearbeiten"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteCustomer(customer)}
                            title="Kunde löschen"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <ConfirmDialog
        open={confirmDialog.open}
        title="Kunde löschen"
        message={confirmDialog.customer ? `Möchten Sie den Kunden "${confirmDialog.customer.name}" wirklich löschen?` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Löschen"
        cancelText="Abbrechen"
        isDestructive={true}
      />
    </Box>
  );
};

export default CustomerList; 