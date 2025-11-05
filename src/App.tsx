import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { de } from 'date-fns/locale';
import { Box, Button, Typography, Paper, TextField, Alert, CssBaseline, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import MainLayout from './layouts/MainLayout';
import CalendarView from './pages/CalendarView';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import CustomerList from './pages/CustomerList';
import CustomerDetail from './pages/CustomerDetail';
import CustomerForm from './components/CustomerForm';
import EventForm from './components/EventForm';
import ConfirmDialog from './components/ConfirmDialog';
import type { Event, Customer } from './types';
import { eventService, customerService } from './firebase/firestore';
import { auth } from './firebase/config'; // Firebase initialisieren
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import theme from './theme';

// CustomerDetail wrapper component to handle routing
const CustomerDetailWrapper: React.FC<{
  customers: Customer[];
  events: Event[];
  onSave: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}> = ({ customers, events, onSave, onDelete }) => {
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

  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [pendingEventData, setPendingEventData] = useState<any>(null);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    data: any;
  }>({ open: false, data: null });
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('bellavue-role') as UserRole) || null;
  });

  // Firebase Auth und Real-time Listeners
  useEffect(() => {
    console.log('Setting up Firebase auth and listeners...');
    
    // Warten auf Firebase Initialisierung, dann authentifizieren
    const initializeAuth = async () => {
      // Warte kurz, damit Firebase vollständig initialisiert ist
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        console.log('Attempting anonymous authentication...');
        const userCredential = await signInAnonymously(auth);
        console.log('Anonymous authentication successful:', userCredential.user.uid);
        console.log('Auth token:', await userCredential.user.getIdToken());
      } catch (error) {
        console.error('Anonymous authentication failed:', error);
        console.error('Error details:', error);
        
        // Mehrfache Versuche mit steigenden Verzögerungen
        for (let i = 1; i <= 3; i++) {
          setTimeout(async () => {
            try {
              console.log(`Retry authentication attempt ${i}...`);
              await signInAnonymously(auth);
              console.log(`Retry ${i} authentication successful`);
            } catch (retryError) {
              console.error(`Retry ${i} authentication failed:`, retryError);
            }
          }, i * 2000);
        }
      }
    };
    
    initializeAuth();
    
    // Firebase Auth State Listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('User authenticated:', user.uid);
        try {
          const token = await user.getIdToken();
          console.log('Current auth token:', token);
        } catch (tokenError) {
          console.error('Error getting token:', tokenError);
        }
      } else {
        console.log('No user authenticated - attempting to sign in...');
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error('Auto sign-in failed:', error);
        }
      }
    });
    
    // Events Listener
    const unsubscribeEvents = eventService.onEventsChange((newEvents) => {
      console.log('Events updated from Firebase:', newEvents);
      setEvents(newEvents);
    });

    // Customers Listener
    const unsubscribeCustomers = customerService.onCustomersChange((newCustomers) => {
      console.log('Customers updated from Firebase:', newCustomers);
      setCustomers(newCustomers);
    });

    // Cleanup listeners on unmount
    return () => {
      console.log('Cleaning up Firebase listeners...');
      unsubscribeAuth();
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
          setConfirmDialog({ open: true, data });
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

  const handleConfirmImport = () => {
    if (confirmDialog.data) {
      setEvents(confirmDialog.data.events);
      setCustomers(confirmDialog.data.customers);
      alert('Daten erfolgreich importiert!');
    }
    setConfirmDialog({ open: false, data: null });
  };

  const handleCancelImport = () => {
    setConfirmDialog({ open: false, data: null });
  };


  // Hilfsfunktion zum Zusammenfügen von Adressfeldern
  const composeAddress = (streetAndNumber?: string, zipAndCity?: string) =>
    [streetAndNumber?.trim(), zipAndCity?.trim()].filter(Boolean).join(', ');

  const handleNewEvent = async (newEvent: Omit<Event, 'id'>, newCustomer: any) => {
    try {
      console.log('handleNewEvent aufgerufen mit:', { newEvent, newCustomer });
      
      // SCHRITT 1: Kunde automatisch erstellen (nur mit angeforderten Feldern)
      if (!newCustomer) {
        throw new Error('Keine Kundendaten vorhanden');
      }

      // Debug: Prüfe welche Daten vom Event-Formular kommen
      console.log('Kundendaten vom Event-Formular:', {
        firstName: newCustomer.firstName,
        lastName: newCustomer.lastName,
        email: newCustomer.email,
        phone: newCustomer.phone,
        mobile: newCustomer.mobile,
        streetAndNumber: newCustomer.streetAndNumber,
        zipAndCity: newCustomer.zipAndCity,
        notes: newCustomer.notes,
        company: newCustomer.company
      });

      // Erstelle Customer-Objekt nur mit den angeforderten Feldern
      // Alle Werte explizit aus newCustomer übernehmen (mit Fallback auf leeren String)
      
      // Mapping sicherstellen falls EventForm andere Feldnamen liefert
      newCustomer.streetAndNumber = newCustomer.streetAndNumber || (newCustomer as any).address || "";
      newCustomer.zipAndCity = newCustomer.zipAndCity || (newCustomer as any).addressCity || "";
      newCustomer.mobile = newCustomer.mobile || "";
      
      const customerToCreate: Omit<Customer, 'id'> = {
        name: newCustomer.name || '',
        firstName: newCustomer.firstName || '',
        lastName: newCustomer.lastName || '',
        company: newCustomer.company || '',
        email: newCustomer.email || '',
        phone: newCustomer.phone || '',
        mobile: newCustomer.mobile !== undefined && newCustomer.mobile !== null ? newCustomer.mobile : '',
        streetAndNumber: newCustomer.streetAndNumber !== undefined && newCustomer.streetAndNumber !== null ? newCustomer.streetAndNumber : '',
        zipAndCity: newCustomer.zipAndCity !== undefined && newCustomer.zipAndCity !== null ? newCustomer.zipAndCity : '',
        notes: newCustomer.notes !== undefined && newCustomer.notes !== null ? newCustomer.notes : '',
        // Alle anderen Felder müssen auf leere Werte gesetzt werden
        address: composeAddress(newCustomer.streetAndNumber, newCustomer.zipAndCity),
        addressBride: '',
        addressGroom: '',
        nationalityBride: '',
        nationalityGroom: '',
        ageBride: '',
        ageGroom: '',
        events: [],
        contactPerson: '',
        budget: '',
        guestCount: '',
        specialRequirements: '',
        preferences: {
          catering: false,
          decoration: false,
          music: false,
          photography: false
        }
      };

      // Customer-ID generieren
      const customerId = Date.now().toString() + Math.random().toString(36).substr(2, 6);
      const customerWithId: Customer = {
        ...customerToCreate,
        id: customerId
      };

      // SCHRITT 1B: Customer in Firebase speichern
      console.log('Speichere Customer in Firebase...', customerToCreate);
      const savedCustomerId = await customerService.createCustomer(customerToCreate);
      console.log('Customer erfolgreich in Firebase gespeichert mit ID:', savedCustomerId);
      customerWithId.id = savedCustomerId;

      // SCHRITT 2: Event in Firebase speichern
      console.log('Erstelle Event mit customerId:', savedCustomerId);
      const eventToSave: Omit<Event, 'id'> = {
        ...newEvent,
        customerId: savedCustomerId
      };

      console.log('Speichere Event in Firebase...', eventToSave);
      const eventId = await eventService.createEvent(eventToSave);
      console.log('Event erfolgreich in Firebase gespeichert mit ID:', eventId);

      const eventWithId: Event = {
        ...eventToSave,
        id: eventId
      };

      // SCHRITT 3: Customer mit Event-ID in Firebase aktualisieren
      customerWithId.events = [eventId];
      await customerService.updateCustomer(savedCustomerId, { events: [eventId] });
      console.log('Customer in Firebase mit Event-ID aktualisiert');

      // SCHRITT 4: UI aktualisieren
      setCustomers(prev => {
        const updated = prev.map(c => c.id === savedCustomerId ? customerWithId : c);
        if (!updated.find(c => c.id === savedCustomerId)) {
          updated.push(customerWithId);
        }
        return updated;
      });
      setEvents(prev => [...prev, eventWithId]);

      console.log('Event und Kunde erfolgreich erstellt und verknüpft');
      
    } catch (error) {
      console.error('Fehler beim Erstellen des Events:', error);
      alert('Fehler beim Erstellen des Service-Angebots: ' + (error instanceof Error ? error.message : String(error)));
      throw error; // Fehler weiterwerfen, damit die Event-Erstellung abgebrochen wird
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
      console.log('Event wird in Firebase aktualisiert:', event.id);
      
      // Event in Firebase aktualisieren
      const { id, ...eventData } = event;
      await eventService.updateEvent(id, eventData);
      console.log('Event erfolgreich in Firebase aktualisiert:', id);
      
      // Customer erstellen oder aktualisieren, wenn customerId vorhanden
      if (event.customerId) {
        try {
          const existingCustomer = await customerService.getCustomerById(event.customerId);
          
          if (existingCustomer) {
            // Customer in Firebase aktualisieren
            const updatedCustomerData: Partial<Customer> = {
              firstName: event.firstName || existingCustomer.firstName || "",
              lastName: event.lastName || existingCustomer.lastName || "",
              email: event.email || existingCustomer.email || "",
              phone: event.phone || existingCustomer.phone || "",
              mobile: (event as any).mobile || event.mobile || existingCustomer.mobile || "",
              streetAndNumber: (event as any).streetAndNumber || (event as any).address || existingCustomer.streetAndNumber || "",
              zipAndCity: (event as any).zipAndCity || (event as any).addressCity || existingCustomer.zipAndCity || "",
              notes: event.notes || existingCustomer.notes || "",
              address:
                (existingCustomer.address && existingCustomer.address.trim())
                  ? existingCustomer.address
                  : composeAddress(
                      (event as any).streetAndNumber || (event as any).address,
                      (event as any).zipAndCity || (event as any).addressCity
                    ),
            };
            
            await customerService.updateCustomer(event.customerId, updatedCustomerData);
            console.log('Customer erfolgreich in Firebase aktualisiert:', event.customerId);
            
            // UI State aktualisieren
            const updatedCustomer: Customer = { ...existingCustomer, ...updatedCustomerData };
            setCustomers(prev => prev.map(c => c.id === event.customerId ? updatedCustomer : c));
          } else {
            // Neuer Customer in Firebase erstellen
            const customerName = `${event.firstName || ''} ${event.lastName || ''}`.trim() || event.customer || '';
            const newCustomer: Omit<Customer, 'id'> = {
              name: customerName,
              firstName: event.firstName || "",
              lastName: event.lastName || "",
              company: event.company || "",
              email: event.email || "",
              phone: event.phone || "",
              mobile: (event as any).mobile || event.mobile || "",
              streetAndNumber: (event as any).streetAndNumber || (event as any).address || "",
              zipAndCity: (event as any).zipAndCity || (event as any).addressCity || "",
              notes: event.notes || "",
              address: composeAddress(
                (event as any).streetAndNumber || (event as any).address,
                (event as any).zipAndCity || (event as any).addressCity
              ),
              addressBride: "",
              addressGroom: "",
              nationalityBride: "",
              nationalityGroom: "",
              ageBride: "",
              ageGroom: "",
              events: [event.id],
              contactPerson: "",
              budget: "",
              guestCount: "",
              specialRequirements: "",
              preferences: {
                catering: false,
                decoration: false,
                music: false,
                photography: false
              }
            };
            
            const newCustomerId = await customerService.createCustomer(newCustomer);
            console.log('Customer erfolgreich in Firebase erstellt:', newCustomerId);
            
            // UI State aktualisieren
            const customerWithId: Customer = { ...newCustomer, id: newCustomerId };
            setCustomers(prev => {
              const updated = prev.filter(c => c.id !== event.customerId);
              return [...updated, customerWithId];
            });
          }
        } catch (customerError) {
          console.error('Fehler beim Aktualisieren/Erstellen des Customers in Firebase:', customerError);
          // Customer-Fehler nicht blockieren, Event wurde bereits gespeichert
        }
      }
      
      // UI State aktualisieren (Firebase Real-time Listener wird das automatisch aktualisieren)
      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
      
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Events in Firebase:', error);
      alert('Fehler beim Speichern des Events: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  };

  const handleEventDelete = async (event: Event) => {
    try {
      console.log('Event wird in Firebase gelöscht:', event.id);
      
      // Event aus Firebase löschen
      await eventService.deleteEvent(event.id);
      console.log('Event erfolgreich in Firebase gelöscht:', event.id);
      
      // UI State wird automatisch durch Firebase Real-time Listener aktualisiert
      setEvents(prev => prev.filter(e => e.id !== event.id));
      
    } catch (error) {
      console.error('Fehler beim Löschen des Events in Firebase:', error);
      alert('Fehler beim Löschen des Events: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  };

  const handleCustomerSave = async (customer: Customer) => {
    try {
      console.log('Kunde wird in Firebase aktualisiert:', customer.id);
      
      // Kunde in Firebase aktualisieren
      const { id, ...customerData } = customer;
      await customerService.updateCustomer(id, customerData);
      console.log('Kunde erfolgreich in Firebase aktualisiert:', id);
      
      // UI State wird automatisch durch Firebase Real-time Listener aktualisiert
      setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
      
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Kunden in Firebase:', error);
      alert('Fehler beim Speichern des Kunden: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  };

  const handleCustomerDelete = async (customer: Customer) => {
    try {
      console.log('Kunde wird in Firebase gelöscht:', customer.id);
      
      // Kunde aus Firebase löschen
      await customerService.deleteCustomer(customer.id);
      console.log('Kunde erfolgreich in Firebase gelöscht:', customer.id);
      
      // UI State wird automatisch durch Firebase Real-time Listener aktualisiert
      setCustomers(prev => prev.filter(c => c.id !== customer.id));
      
    } catch (error) {
      console.error('Fehler beim Löschen des Kunden in Firebase:', error);
      alert('Fehler beim Löschen des Kunden: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  };

  const login = (username: string, password: string) => {
    // Trim whitespace und normalize
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    
    // Admin Login (case-insensitive)
    if (trimmedUsername.toLowerCase() === 'admin' && trimmedPassword === 'BellavueNokta2025#') {
      setRole('admin');
      localStorage.setItem('bellavue-role', 'admin');
      return true;
    }
    // Mitarbeiter Login (case-insensitive)
    if (trimmedUsername.toLowerCase() === 'mitarbeiter' && trimmedPassword === 'BellavueMitarbeiter2025#') {
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

  // Daten werden über Firebase Real-time Listener geladen (siehe useEffect oben)
  // Keine localStorage-Lade-Logik mehr nötig - alles kommt aus Firebase

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

          {/* Confirm Dialog for Import */}
          <ConfirmDialog
            open={confirmDialog.open}
            title="Daten importieren"
            message="Möchten Sie die aktuellen Daten mit den importierten Daten ersetzen?"
            onConfirm={handleConfirmImport}
            onCancel={handleCancelImport}
            confirmText="Importieren"
            cancelText="Abbrechen"
            isDestructive={false}
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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(username, password)) {
      setError('Falscher Benutzername oder Passwort');
    }
  };
  
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        height: '100dvh',
        minHeight: '100vh',
        p: 0,
        m: 0,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: { xs: 1.5, sm: 4 },
          borderRadius: 3,
          maxWidth: 360,
          width: '100%',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          mx: 'auto',
          boxSizing: 'border-box',
          overflowX: 'hidden',
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
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Passwort anzeigen/verstecken"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
        </Box>
      </Paper>
    </Box>
  );
};

export default App;
