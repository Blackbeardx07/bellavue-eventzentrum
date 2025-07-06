import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { de } from 'date-fns/locale';
import { CssBaseline, Box, Typography, Button, Paper, TextField, Alert } from '@mui/material';
import theme from './theme';
import MainLayout from './layouts/MainLayout';
import CalendarView from './pages/CalendarView';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import CustomerList from './pages/CustomerList';
import CustomerDetail from './pages/CustomerDetail';
import CustomerForm from './components/CustomerForm';
import EventForm from './components/EventForm';
import type { Event, Customer } from './types';
import { eventService, customerService } from './firebase/firestore';
import './firebase/config'; // Firebase initialisieren

// CustomerDetail wrapper component to handle routing
const CustomerDetailWrapper: React.FC<{
  customers: Customer[];
  events: Event[];
  onSave: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onEventClick: (event: Event) => void;
}> = ({ customers, events, onSave, onDelete, onEventClick }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'view';
  
  const customer = customers.find(c => c.id === id);
  
  if (!customer) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          Kunde nicht gefunden
        </Typography>
        <Button onClick={() => navigate('/customers')} sx={{ mt: 2 }}>
          Zurück zur Kundenliste
        </Button>
      </Box>
    );
  }

  return (
    <CustomerDetail 
      customer={customer} 
      events={events} 
      onSave={onSave} 
      onDelete={onDelete} 
      onEventClick={onEventClick} 
      mode={mode}
    />
  );
};

// EventDetail wrapper component to handle routing
const EventDetailWrapper: React.FC<{
  events: Event[];
  onSave: (event: Event) => void;
  onDelete: (event: Event) => void;
}> = ({ events, onSave, onDelete }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'view';
  
  const event = events.find(e => e.id === id);
  
  if (!event) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          Event nicht gefunden
        </Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Zurück zum Kalender
        </Button>
      </Box>
    );
  }

  return (
    <EventDetail 
      event={event} 
      onSave={onSave} 
      onDelete={onDelete} 
      mode={mode}
    />
  );
};

// AuthContext für Login und Rollen
export type UserRole = 'admin' | 'user' | null;
interface AuthContextType {
  role: UserRole;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType>({ role: null, login: () => false, logout: () => {} });
export const useAuth = () => useContext(AuthContext);

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [pendingEventData, setPendingEventData] = useState<any>(null);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('bellavue-role') as UserRole) || null;
  });

  // Firebase Real-time Listeners
  useEffect(() => {
    console.log('Setting up Firebase listeners...');
    
    // Events Listener
    const unsubscribeEvents = eventService.onEventsChange((newEvents) => {
      console.log('Events updated from Firebase:', newEvents);
      setEvents(newEvents);
      setLoading(false);
    });

    // Customers Listener
    const unsubscribeCustomers = customerService.onCustomersChange((newCustomers) => {
      console.log('Customers updated from Firebase:', newCustomers);
      setCustomers(newCustomers);
    });

    // Cleanup listeners on unmount
    return () => {
      console.log('Cleaning up Firebase listeners...');
      unsubscribeEvents();
      unsubscribeCustomers();
    };
  }, []);

  // Export data function
  const exportData = () => {
    const data = {
      events,
      customers,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bellavue-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import data function
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.events && data.customers) {
          if (window.confirm('Möchten Sie die aktuellen Daten mit den importierten Daten ersetzen?')) {
            setEvents(data.events);
            setCustomers(data.customers);
            alert('Daten erfolgreich importiert!');
          }
        } else {
          alert('Ungültiges Dateiformat!');
        }
      } catch (error) {
        alert('Fehler beim Importieren der Daten!');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleEventClick = (event: Event) => {
    console.log('Event clicked:', event);
  };

  const handleNewEvent = async (newEvent: Omit<Event, 'id'>, newCustomer: any) => {
    try {
      // Event erstellen
      const eventId = await eventService.createEvent(newEvent);
      
      // Wenn ein neuer Kunde erstellt wurde
      if (newCustomer && newCustomer.name) {
        const customerId = await customerService.createCustomer(newCustomer);
        console.log('Neuer Kunde erstellt:', customerId);
      }
      
      console.log('Event erstellt:', eventId);
    } catch (error) {
      console.error('Fehler beim Erstellen des Events:', error);
    }
  };

  const handleCustomerFormSubmit = (newCustomer: Omit<Customer, 'id'>) => {
    // Create customer with ID and all fields from EventForm
    const customerWithId: Customer = {
      ...newCustomer,
      id: Date.now().toString(),
      events: [pendingEventData ? Date.now().toString() : ''],
      // Include additional fields from EventForm if available
      contactPerson: pendingEventData?.contactPerson || newCustomer.contactPerson,
      budget: pendingEventData?.budget || newCustomer.budget,
      guestCount: pendingEventData?.guestCount || newCustomer.guestCount,
      specialRequirements: pendingEventData?.specialRequirements || newCustomer.specialRequirements,
      preferences: {
        catering: pendingEventData?.catering || newCustomer.preferences?.catering || false,
        decoration: pendingEventData?.decoration || newCustomer.preferences?.decoration || false,
        music: pendingEventData?.music || newCustomer.preferences?.music || false,
        photography: pendingEventData?.photography || newCustomer.preferences?.photography || false,
      }
    };
    setCustomers(prev => [...prev, customerWithId]);

    // Create event with new customer ID
    if (pendingEventData) {
      const eventWithId: Event = {
        ...pendingEventData,
        id: Date.now().toString(),
        customerId: customerWithId.id,
        status: 'confirmed' as const
      };
      setEvents(prev => [...prev, eventWithId]);
    }

    setCustomerFormOpen(false);
    setPendingEventData(null);
    alert('Event und Kunde erfolgreich erstellt!');
  };

  const handleCustomerClick = (customer: Customer) => {
    console.log('Customer clicked:', customer);
  };

  const handleEventSave = async (event: Event) => {
    try {
      await eventService.updateEvent(event.id, event);
      console.log('Event aktualisiert:', event.id);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Events:', error);
    }
  };

  const handleEventDelete = async (event: Event) => {
    try {
      await eventService.deleteEvent(event.id);
      console.log('Event gelöscht:', event.id);
    } catch (error) {
      console.error('Fehler beim Löschen des Events:', error);
    }
  };

  const handleCustomerSave = async (customer: Customer) => {
    try {
      await customerService.updateCustomer(customer.id, customer);
      console.log('Kunde aktualisiert:', customer.id);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Kunden:', error);
    }
  };

  const handleCustomerDelete = async (customer: Customer) => {
    try {
      await customerService.deleteCustomer(customer.id);
      console.log('Kunde gelöscht:', customer.id);
    } catch (error) {
      console.error('Fehler beim Löschen des Kunden:', error);
    }
  };

  const login = (username: string, password: string) => {
    if (username === 'admin' && password === 'admin123') {
      setRole('admin');
      localStorage.setItem('bellavue-role', 'admin');
      return true;
    }
    if (username === 'user' && password === 'user123') {
      setRole('user');
      localStorage.setItem('bellavue-role', 'user');
      return true;
    }
    return false;
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem('bellavue-role');
  };

  useEffect(() => {
    // Beispiel-Event nur hinzufügen, wenn es noch nicht existiert
    const exists = events.some(e => e.date === '2025-10-18' && e.title.includes('Yılmaz'));
    if (!exists) {
      const customerId = '1001';
      const newCustomer = {
        id: customerId,
        name: 'Familie Yılmaz & Familie Demir',
        email: 'yilmaz-demir@email.com',
        phone: '+49 170 1234567',
        address: 'Beispielstraße 10, 12345 Musterstadt',
        events: [],
        tags: ['VIP', 'Hochzeit', 'Türkisch'],
        notes: 'Brautpaar wünscht Feuerwerk um Mitternacht, Hochzeitstorte 5-stöckig, Sitzordnung nach Familien',
        contactPerson: 'Herr Yılmaz',
        company: '',
        website: '',
        vatNumber: '',
        birthday: '',
        anniversary: '',
        preferences: {
          catering: true,
          decoration: true,
          music: true,
          photography: true
        },
        budget: '18000',
        guestCount: '300',
        specialRequirements: 'Bühne für Live-Band, Halal-Catering, Kinderbetreuung, Fotobox, große Tanzfläche, Dekoration in Gold & Rot'
      };
      setCustomers(prev => [...prev, newCustomer]);
      const newEvent = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
        title: 'Türkische Hochzeit – Yılmaz & Demir',
        date: '2025-10-18',
        time: '16:00 – 02:00',
        room: 'Event 1, Event 2',
        status: 'confirmed' as const,
        customerId: customerId,
        customer: 'Familie Yılmaz & Familie Demir',
        description: 'Große türkische Hochzeit mit traditioneller Zeremonie, Live-Musik, Tanz und umfangreichem Buffet. Nutzung beider Säle für Zeremonie, Dinner und Party.',
        files: ['hochzeit_yilmaz_demir_vertrag.pdf', 'tischplan.pdf'],
        assignedStaff: ['DJ Cem', 'Band Anadolu', 'Fotografin Aylin'],
        comments: ['Feuerwerk um Mitternacht', 'Torte 5-stöckig', 'DJ & Live-Band abwechselnd'],
        guestCount: '300',
        kosten: '18000',
        specialRequirements: 'Bühne für Live-Band, Halal-Catering, Kinderbetreuung, Fotobox, große Tanzfläche, Dekoration in Gold & Rot',
        notes: 'Brautpaar wünscht Feuerwerk um Mitternacht, Hochzeitstorte 5-stöckig, DJ & Live-Band abwechselnd, Sitzordnung nach Familien',
        eventTypes: ['Hochzeit', 'Türkisch', 'Großevent'],
        preferences: {
          catering: true,
          decoration: true,
          music: true,
          photography: true
        }
      };
      setEvents(prev => [...prev, newEvent]);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {!role ? <LoginDialog /> : (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
            <Router>
              <MainLayout onExportData={role === 'admin' ? exportData : undefined} onImportData={role === 'admin' ? importData : undefined}>
                <Routes>
                  <Route 
                    path="/" 
                    element={
                      <CalendarView
                        events={events}
                        onNewEvent={handleNewEvent}
                      />
                    } 
                  />
                  <Route 
                    path="/events" 
                    element={
                      <EventList 
                        events={events} 
                        onNewEvent={handleNewEvent}
                        onDelete={role === 'admin' ? handleEventDelete : undefined}
                      />
                    } 
                  />
                  <Route 
                    path="/event/:id" 
                    element={
                      <EventDetailWrapper 
                        events={events} 
                        onSave={handleEventSave} 
                        onDelete={handleEventDelete} 
                      />
                    } 
                  />
                  <Route 
                    path="/customers" 
                    element={
                      <CustomerList 
                        customers={customers} 
                        onCustomerClick={handleCustomerClick}
                        onNewCustomer={role === 'admin' ? () => setCustomerFormOpen(true) : undefined}
                        onDelete={role === 'admin' ? handleCustomerDelete : undefined}
                      />
                    } 
                  />
                  <Route 
                    path="/customer/:id" 
                    element={
                      <CustomerDetailWrapper 
                        customers={customers} 
                        events={events} 
                        onSave={handleCustomerSave} 
                        onDelete={handleCustomerDelete} 
                        onEventClick={handleEventClick} 
                      />
                    } 
                  />
                </Routes>
              </MainLayout>
            </Router>
          </LocalizationProvider>

          {/* Customer Form Dialog */}
          <CustomerForm
            open={customerFormOpen}
            onClose={() => {
              setCustomerFormOpen(false);
              setPendingEventData(null);
            }}
            onSubmit={handleCustomerFormSubmit}
            eventData={pendingEventData}
          />

          {/* Event Form Dialog */}
          <EventForm
            open={eventFormOpen}
            onClose={() => setEventFormOpen(false)}
            onSubmit={handleNewEvent}
          />
        </ThemeProvider>
      )}
    </AuthContext.Provider>
  );
}

// LoginDialog-Komponente
const LoginDialog: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(username, password)) {
      setError('Falscher Benutzername oder Passwort');
    }
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: 2,
        margin: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <Paper
        elevation={8}
        sx={{
          padding: 4,
          borderRadius: 3,
          minWidth: 400,
          maxWidth: 450,
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Logo */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <img 
            src="/bellavue-logo.png" 
            alt="Bellavue Logo" 
            style={{ 
              height: 80, 
              width: 80, 
              borderRadius: '50%', 
              background: '#fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }} 
          />
        </Box>
        
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
          Bellavue Eventzentrum
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Bitte melden Sie sich an
        </Typography>
        
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Benutzername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Passwort"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            sx={{ mb: 2 }}
          />
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              mt: 3, 
              mb: 2, 
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600
            }}
          >
            Anmelden
          </Button>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
              Zugangsdaten:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Admin:</strong> admin / admin123
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Mitarbeiter:</strong> user / user123
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default App;
