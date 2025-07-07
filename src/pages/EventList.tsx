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
  Chip,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import type { Event } from '../types';
import * as XLSX from 'xlsx';
import EventForm from '../components/EventForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../App';
import { getStatusLabel, getStatusColor } from '../utils';

interface EventListProps {
  events: Event[];
  onNewEvent: (event: Omit<Event, 'id'>, customer: any) => void;
  onDelete?: (event: Event) => void;
}

const EventList: React.FC<EventListProps> = ({ events, onNewEvent, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    event: Event | null;
  }>({ open: false, event: null });
  const navigate = useNavigate();
  const { role } = useAuth();

  const allStatuses = Array.from(new Set(events.map(event => event.status)));

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.room.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    
    // Date range filtering
    const eventDate = new Date(event.date);
    const fromDate = dateFromFilter ? new Date(dateFromFilter) : null;
    const toDate = dateToFilter ? new Date(dateToFilter) : null;
    
    let matchesDate = true;
    if (fromDate && toDate) {
      matchesDate = eventDate >= fromDate && eventDate <= toDate;
    } else if (fromDate) {
      matchesDate = eventDate >= fromDate;
    } else if (toDate) {
      matchesDate = eventDate <= toDate;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewEvent = (event: Event) => {
    navigate(`/event/${event.id}?mode=view`);
  };

  const handleEditEvent = (event: Event) => {
    navigate(`/event/${event.id}?mode=edit`);
  };

  const handleDeleteEvent = (event: Event) => {
    setConfirmDialog({ open: true, event });
  };

  const handleConfirmDelete = () => {
    if (confirmDialog.event) {
      onDelete?.(confirmDialog.event);
    }
    setConfirmDialog({ open: false, event: null });
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ open: false, event: null });
  };

  const handleExportExcel = () => {
    const data = filteredEvents.map(({ id, title, date, time, room, customer, status, description }) => ({
      ID: id,
      Titel: title,
      Datum: date,
      Zeit: time,
      Raum: room,
      Kunde: customer,
      Status: status,
      Beschreibung: description || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Events');
    XLSX.writeFile(workbook, 'eventliste.xlsx');
  };

  const handleEventFormSubmit = (newEvent: Omit<Event, 'id'>, newCustomer: any) => {
    onNewEvent(newEvent, newCustomer);
    setEventFormOpen(false);
  };

  const clearDateFilters = () => {
    setDateFromFilter('');
    setDateToFilter('');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <TextField
              fullWidth
              label="Events durchsuchen"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ flex: { md: 2 } }}
            />
            <FormControl size="small" sx={{ minWidth: { md: 150 } }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">Alle</MenuItem>
                {allStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={handleExportExcel}
              startIcon={<DownloadIcon />}
              size="small"
              sx={{ whiteSpace: 'nowrap' }}
            >
              Excel
            </Button>
          </Box>
          
          {/* Date Range Filter */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 2,
            alignItems: { xs: 'stretch', md: 'center' }
          }}>
            <Typography variant="body2" sx={{ 
              fontWeight: 'medium',
              color: 'text.secondary',
              minWidth: { md: 80 }
            }}>
              Datumsbereich:
            </Typography>
            <TextField
              type="date"
              label="Von"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: { md: 150 } }}
            />
            <Typography variant="body2" sx={{ 
              color: 'text.secondary',
              alignSelf: 'center'
            }}>
              bis
            </Typography>
            <TextField
              type="date"
              label="Bis"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: { md: 150 } }}
            />
            {(dateFromFilter || dateToFilter) && (
              <Button
                variant="text"
                onClick={clearDateFilters}
                size="small"
                sx={{ 
                  whiteSpace: 'nowrap',
                  minWidth: 'auto',
                  px: 1
                }}
              >
                Zurücksetzen
              </Button>
            )}
          </Box>
        </Stack>
      </Box>

      {/* Event Count */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
        }}>
          Events
        </Typography>
        {role === 'admin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setEventFormOpen(true)}
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1, sm: 2 }
            }}
          >
            Neues Event
          </Button>
        )}
      </Box>

      {/* Mobile Card View */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
        {filteredEvents.map((event) => (
          <Card key={event.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {event.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Datum:</strong> {formatDate(event.date)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Zeit:</strong> {event.time}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Raum:</strong> {event.room}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Status:</strong> {getStatusLabel(event.status)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Kunde:</strong> {event.customer}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
              <Button size="small" onClick={() => handleViewEvent(event)}>
                Anzeigen
              </Button>
              {role === 'admin' && (
                <>
                  <Button size="small" onClick={() => handleEditEvent(event)}>
                    Bearbeiten
                  </Button>
                  <Button size="small" onClick={() => handleDeleteEvent(event)}>
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
                <TableCell>Event</TableCell>
                <TableCell>Datum</TableCell>
                <TableCell>Zeit</TableCell>
                <TableCell>Raum</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Kunde</TableCell>
                <TableCell align="right">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow key={event.id} hover>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>
                    {formatDate(event.date)}
                  </TableCell>
                  <TableCell>{event.time}</TableCell>
                  <TableCell>{event.room}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(event.status)}
                      color={getStatusColor(event.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{event.customer}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewEvent(event)}
                        title="Event anzeigen"
                      >
                        <ViewIcon />
                      </IconButton>
                      {role === 'admin' && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleEditEvent(event)}
                            title="Event bearbeiten"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteEvent(event)}
                            title="Event löschen"
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

      <EventForm
        open={eventFormOpen}
        onClose={() => setEventFormOpen(false)}
        onSubmit={handleEventFormSubmit}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title="Event löschen"
        message={confirmDialog.event ? `Möchten Sie das Event "${confirmDialog.event.title}" wirklich löschen?` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Löschen"
        cancelText="Abbrechen"
        isDestructive={true}
      />
    </Box>
  );
};

export default EventList; 