import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Add as AddIcon
} from '@mui/icons-material';
import type { Event } from '../types';
import EventForm from '../components/EventForm';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useAuth } from '../App';
import { getStatusLabel, getStatusColor } from '../utils';

interface CalendarViewProps {
  events: Event[];
  onNewEvent: (event: Omit<Event, 'id'>, customer: any) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, onNewEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const navigate = useNavigate();
  const { role } = useAuth();

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  // Filter-Logik
  const filteredEvents = events.filter(event => {
    const statusOk = statusFilter === 'all' || event.status === statusFilter;
    const customerOk = customerFilter === 'all' || event.customer === customerFilter;
    return statusOk && customerOk;
  });

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#4caf50'; // Grün
      case 'cancelled':
        return '#f44336'; // Rot
      case 'planned':
      default:
        return '#ff9800'; // Orange
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleViewEvent = (event: Event) => {
    navigate(`/event/${event.id}?mode=view`);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const uniqueCustomers = Array.from(new Set(events.map(e => e.customer)));
  const uniqueStatuses = Array.from(new Set(events.map(e => e.status)));

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        maxWidth: 1100,
        mx: 'auto',
        width: '100%',
      }}
    >
      {/* Filter Bar */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={e => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">Alle</MenuItem>
            {uniqueStatuses.map(status => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Kunde</InputLabel>
          <Select
            value={customerFilter}
            label="Kunde"
            onChange={e => setCustomerFilter(e.target.value)}
          >
            <MenuItem value="all">Alle</MenuItem>
            {uniqueCustomers.map(customer => (
              <MenuItem key={customer} value={customer}>{customer}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {role === 'admin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setEventFormOpen(true)}
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, px: { xs: 1, sm: 2 } }}
          >
            Neues Event
          </Button>
        )}
      </Paper>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
          Kalender
        </Typography>
      </Box>

      {/* Kalender + Eventliste nebeneinander ab md */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: 500,
        }}
      >
        {/* Kalenderbereich */}
        <Box
          sx={{
            width: { xs: '100%', md: 520 },
            minWidth: { md: 520 },
            maxWidth: { md: 520 },
            flexShrink: 0,
          }}
        >
          <Paper sx={{ p: { xs: 1, sm: 2 }, mb: { xs: 3, md: 0 } }}>
            {/* Calendar Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton onClick={() => handleMonthChange('prev')} size="small">
                  <ChevronLeftIcon />
                </IconButton>
                <Typography variant="h6" sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </Typography>
                <IconButton onClick={() => handleMonthChange('next')} size="small">
                  <ChevronRightIcon />
                </IconButton>
              </Box>
              <Button
                startIcon={<TodayIcon />}
                onClick={goToToday}
                size="small"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Heute
              </Button>
            </Box>

            {/* Calendar Grid */}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {dayNames.map(day => (
                      <TableCell key={day} align="center" sx={{ fontWeight: 'bold', py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {day}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) => (
                    <TableRow key={weekIndex}>
                      {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
                        if (!day) {
                          return <TableCell key={dayIndex} sx={{ height: { xs: 60, sm: 80 } }} />;
                        }
                        const dayEvents = getEventsForDate(day);
                        const isSelected = selectedDate?.toDateString() === day.toDateString();
                        const isToday = new Date().toDateString() === day.toDateString();
                        return (
                          <TableCell
                            key={dayIndex}
                            align="center"
                            sx={{
                              cursor: 'pointer',
                              height: { xs: 60, sm: 80 },
                              position: 'relative',
                              backgroundColor: isSelected ? 'primary.light' : 'transparent',
                              color: isSelected ? 'white' : 'text.primary',
                              border: isToday ? '2px solid' : '1px solid',
                              borderColor: isToday ? 'primary.main' : 'divider',
                              '&:hover': {
                                backgroundColor: isSelected ? 'primary.light' : 'action.hover',
                              },
                            }}
                            onClick={() => handleDateClick(day)}
                          >
                            <Typography variant="body2" sx={{ mb: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {day.getDate()}
                            </Typography>
                            {/* Event indicators */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {dayEvents.slice(0, 3).map((event, eventIndex) => (
                                <Box
                                  key={eventIndex}
                                  sx={{
                                    height: 3,
                                    backgroundColor: getEventColor(event.status),
                                    borderRadius: 1,
                                    mx: 0.5,
                                    cursor: 'pointer',
                                  }}
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleEventClick(event);
                                  }}
                                  title={`${event.title} - ${event.status}`}
                                />
                              ))}
                              {dayEvents.length > 3 && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}>
                                  +{dayEvents.length - 3}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Legend */}
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#ff9800', borderRadius: 1 }} />
                <Typography variant="caption" sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}>
                  Geplant
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#4caf50', borderRadius: 1 }} />
                <Typography variant="caption" sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}>
                  Bestätigt
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#f44336', borderRadius: 1 }} />
                <Typography variant="caption" sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}>
                  Abgesagt
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Tages-Eventliste */}
        {selectedDate && (
          <Box
            sx={{
              width: { xs: '100%', md: 360 },
              flexShrink: 0,
            }}
          >
            <Paper sx={{ p: { xs: 1, sm: 2 }, mb: { xs: 3, md: 0 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
                Events am {format(selectedDate, 'dd.MM.yyyy', { locale: de })} ({selectedDateEvents.length})
              </Typography>
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {selectedDateEvents.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    Keine Events an diesem Tag
                  </Typography>
                ) : (
                  <List disablePadding>
                    {selectedDateEvents.map(event => (
                      <ListItem
                        key={event.id}
                        alignItems="flex-start"
                        sx={{
                          borderLeft: `4px solid ${getEventColor(event.status)}`,
                          mb: 1,
                          pl: 2,
                          pr: 1,
                          py: 1,
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          boxShadow: 0,
                          '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' }
                        }}
                        onClick={() => handleEventClick(event)}
                      >
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography fontWeight="bold">{event.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.time} • {event.room} • {event.customer}
                          </Typography>
                          {event.description && (
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {event.description}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={getStatusLabel(event.status)}
                          color={getStatusColor(event.status)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Paper>
          </Box>
        )}
      </Box>

      {/* Event Details Dialog */}
      <Dialog
        open={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: 'auto' }
          }
        }}
      >
        {selectedEvent && (
          <>
            <DialogTitle sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, pb: 1 }}>
              {selectedEvent.title}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Datum & Zeit
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {format(new Date(selectedEvent.date), 'EEEE, dd.MM.yyyy', { locale: de })} • {selectedEvent.time}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Raum
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {selectedEvent.room}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Kunde
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {selectedEvent.customer}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Status
                  </Typography>
                  <Chip 
                    label={getStatusLabel(selectedEvent.status)}
                    color={getStatusColor(selectedEvent.status)}
                    size="small"
                  />
                </Box>
                {selectedEvent.description && (
                  <Box>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Beschreibung
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {selectedEvent.description}
                    </Typography>
                  </Box>
                )}
                {selectedEvent.preferences && (
                  <Box>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Kundenwünsche
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {typeof selectedEvent.preferences === 'string' 
                        ? selectedEvent.preferences 
                        : JSON.stringify(selectedEvent.preferences)}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
              <Button 
                onClick={() => setSelectedEvent(null)}
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Schließen
              </Button>
              <Button 
                variant="contained" 
                onClick={() => handleViewEvent(selectedEvent)}
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Details anzeigen
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Event Form Dialog */}
      <EventForm
        open={eventFormOpen}
        onClose={() => setEventFormOpen(false)}
        onSubmit={(newEvent, newCustomer) => {
          onNewEvent(newEvent, newCustomer);
          setEventFormOpen(false);
        }}
      />
    </Box>
  );
};

export default CalendarView; 