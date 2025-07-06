import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from './config';
import type { Event, Customer } from '../types';

// Events Collection
const EVENTS_COLLECTION = 'events';
const CUSTOMERS_COLLECTION = 'customers';

// Event Services
export const eventService = {
  // Alle Events abrufen
  async getAllEvents(): Promise<Event[]> {
    const q = query(collection(db, EVENTS_COLLECTION), orderBy('date', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Event[];
  },

  // Event erstellen
  async createEvent(event: Omit<Event, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), event);
    return docRef.id;
  },

  // Event aktualisieren
  async updateEvent(id: string, event: Partial<Event>): Promise<void> {
    const docRef = doc(db, EVENTS_COLLECTION, id);
    await updateDoc(docRef, event);
  },

  // Event löschen
  async deleteEvent(id: string): Promise<void> {
    const docRef = doc(db, EVENTS_COLLECTION, id);
    await deleteDoc(docRef);
  },

  // Event nach ID abrufen
  async getEventById(id: string): Promise<Event | null> {
    const docRef = doc(db, EVENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Event;
    }
    return null;
  },

  // Real-time Events Listener
  onEventsChange(callback: (events: Event[]) => void) {
    const q = query(collection(db, EVENTS_COLLECTION), orderBy('date', 'asc'));
    return onSnapshot(q, (querySnapshot) => {
      const events = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
      callback(events);
    });
  }
};

// Customer Services
export const customerService = {
  // Alle Kunden abrufen
  async getAllCustomers(): Promise<Customer[]> {
    const q = query(collection(db, CUSTOMERS_COLLECTION), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Customer[];
  },

  // Kunde erstellen
  async createCustomer(customer: Omit<Customer, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), customer);
    return docRef.id;
  },

  // Kunde aktualisieren
  async updateCustomer(id: string, customer: Partial<Customer>): Promise<void> {
    const docRef = doc(db, CUSTOMERS_COLLECTION, id);
    await updateDoc(docRef, customer);
  },

  // Kunde löschen
  async deleteCustomer(id: string): Promise<void> {
    const docRef = doc(db, CUSTOMERS_COLLECTION, id);
    await deleteDoc(docRef);
  },

  // Kunde nach ID abrufen
  async getCustomerById(id: string): Promise<Customer | null> {
    const docRef = doc(db, CUSTOMERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Customer;
    }
    return null;
  },

  // Real-time Customers Listener
  onCustomersChange(callback: (customers: Customer[]) => void) {
    const q = query(collection(db, CUSTOMERS_COLLECTION), orderBy('name', 'asc'));
    return onSnapshot(q, (querySnapshot) => {
      const customers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[];
      callback(customers);
    });
  }
}; 