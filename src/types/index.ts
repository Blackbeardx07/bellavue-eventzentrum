export type EventStatus = 'planned' | 'confirmed' | 'cancelled';

// Predefined rooms
export const PREDEFINED_ROOMS = ['Event 1', 'Event 2', 'Restaurant'] as const;
export type RoomType = typeof PREDEFINED_ROOMS[number];

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  room: string;
  status: 'planned' | 'confirmed' | 'cancelled';
  customerId: string;
  customer: string;
  description?: string;
  files?: string[];
  assignedStaff?: string[];
  comments?: string[];
  
  // Customer fields - PRIMARY FIELDS (used in Firebase)
  firstName?: string;
  lastName?: string;
  company?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  mobileNumber?: string; // Alias for mobile
  street?: string; // Alias for streetAndNumber
  streetAndNumber?: string;
  zipCity?: string; // Alias for zipAndCity
  zipAndCity?: string;
  notes?: string;
  
  // Event fields - PRIMARY FIELDS (used in Firebase)
  eventType?: string; // Alias for veranstaltungsart
  veranstaltungsart?: string;
  guestCount?: number | string;
  weekday?: string; // Alias for wochentag
  wochentag?: string;
  eventDate?: string; // Alias for date
  eventHall?: string; // Alias for room
  deposit?: number | string; // Alias for anzahlung
  anzahlung?: string;
  totalPrice?: number | string; // Alias for gesamtpreis
  gesamtpreis?: string;
  servicePrice?: number | string; // Alias for service/serviceKosten
  service?: string;
  serviceKosten?: string;
  hallPrice?: number | string; // Alias for saalmiete
  saalmiete?: string;
  remainingPayment?: number | string; // Alias for restzahlung
  restzahlung?: string;
  acceptedOffer?: boolean | string; // Alias for angebotAngenommen
  angebotAngenommen?: string;
  customerSignatureDate?: string; // Alias for datumUnterschriftKunde
  datumUnterschriftKunde?: string;
  bellavueSignatureDate?: string; // Alias for datumUnterschriftBellavue
  datumUnterschriftBellavue?: string;
  
  // Services list as array
  serviceLeistungen?: string[];
  
  // Legacy fields for compatibility
  kosten?: string;
  eventTypes?: string[];
  preferences?: {
    catering?: boolean;
    decoration?: boolean;
    music?: boolean;
    photography?: boolean;
  };
  specialRequirements?: string;
  address?: string;
  addressCity?: string;
  
  // Brautpaar Felder
  addressBride?: string;
  addressGroom?: string;
  nationalityBride?: string;
  nationalityGroom?: string;
  ageBride?: string;
  ageGroom?: string;
  
  // Event Details (legacy)
  personenanzahl?: string;
  eventsaal1?: boolean;
  eventsaal2?: boolean;
  veranstaltungsdatum?: string;
  angebotssumme?: string;
  
  // Service checkboxes (individual)
  rundeTische?: boolean;
  eckigeTische?: boolean;
  etSoteHaehnchengeschnetzeltes?: boolean;
  tavukSoteRindergulasch?: boolean;
  halbesHaehnchen?: boolean;
  reis?: boolean;
  gemuese?: boolean;
  salatJahreszeit?: boolean;
  pommesSalzkartoffel?: boolean;
  antipastiVorspeisenBrot?: boolean;
  knabbereienCerez?: boolean;
  obstschale?: boolean;
  nachtischBaklava?: boolean;
  teeKaffeeservice?: boolean;
  softgetraenkeMineralwasser?: boolean;
  hochzeitstorte3Etagen?: boolean;
  hochzeitstorteFlach?: boolean;
  standardDekoration?: boolean;
  serviceAllgemein?: boolean;
  bandDj?: boolean;
  videoKameraKranHDOhne?: boolean;
  videoKameraKranHDMit?: boolean;
  videoKameraKranHDMitBrautigam?: boolean;
  fotoshootingUSB?: boolean;
  weddingStoryClip?: boolean;
  fotoalbum?: boolean;
  davulZurna4Stunden?: boolean;
  davulZurnaMitBrautabholung?: boolean;
  saeulenabgrenzungBlumenFeuerwerk?: boolean;
  saeulenabgrenzungKuchenAnschneiden?: boolean;
  eingangsfeuerwerkBrautpaar?: boolean;
  helikopterlandung?: boolean;
  obstKuchenbuffetTatli?: boolean;
  cigkoefteTischservice?: boolean;
  suppeHauptgang?: boolean;
  cocktailEmpfang?: boolean;
  signature?: string;
}

export interface Customer {
  id: string;
  // Persönliche Informationen
  name: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  mobile: string;
  address?: string;
  streetAndNumber?: string;
  zipAndCity?: string;
  // Anschrift Braut
  addressBride: string;
  // Anschrift Bräutigam
  addressGroom: string;
  // Nationalität
  nationalityBride: string;
  nationalityGroom: string;
  // Alter
  ageBride: string;
  ageGroom: string;
  events: string[];
  notes?: string;
  // Zusätzliche Felder
  contactPerson?: string;
  budget?: string;
  guestCount?: string;
  specialRequirements?: string;
  preferences?: {
    catering?: boolean;
    decoration?: boolean;
    music?: boolean;
    photography?: boolean;
  };
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  facilities: string[];
} 