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
  // Zusätzliche Felder
  guestCount?: string;
  kosten?: string;
  eventTypes?: string[];
  preferences?: {
    catering?: boolean;
    decoration?: boolean;
    music?: boolean;
    photography?: boolean;
  };
  specialRequirements?: string;
  notes?: string;
  // Event Details
  personenanzahl?: string;
  veranstaltungsart?: string;
  eventsaal1?: boolean;
  eventsaal2?: boolean;
  veranstaltungsdatum?: string;
  wochentag?: string;
  // Kostenübersicht
  angebotssumme?: string;
  saalmiete?: string;
  service?: string;
  gesamtpreis?: string;
  anzahlung?: string;
  restzahlung?: string;
  // Tischaufstellung
  rundeTische?: boolean;
  eckigeTische?: boolean;
  // Essen & Catering
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
  // Getränke
  teeKaffeeservice?: boolean;
  softgetraenkeMineralwasser?: boolean;
  // Torte
  hochzeitstorte3Etagen?: boolean;
  hochzeitstorteFlach?: boolean;
  // Service
  standardDekoration?: boolean;
  serviceAllgemein?: boolean;
  bandDj?: boolean;
  // Video & Fotografie
  videoKameraKranHDOhne?: boolean;
  videoKameraKranHDMit?: boolean;
  videoKameraKranHDMitBrautigam?: boolean;
  fotoshootingUSB?: boolean;
  weddingStoryClip?: boolean;
  fotoalbum?: boolean;
  // Musik
  davulZurna4Stunden?: boolean;
  davulZurnaMitBrautabholung?: boolean;
  // Dekoration & Effekte
  saeulenabgrenzungBlumenFeuerwerk?: boolean;
  saeulenabgrenzungKuchenAnschneiden?: boolean;
  eingangsfeuerwerkBrautpaar?: boolean;
  // Extras
  helikopterlandung?: boolean;
  obstKuchenbuffetTatli?: boolean;
  cigkoefteTischservice?: boolean;
  suppeHauptgang?: boolean;
  cocktailEmpfang?: boolean;
  // Unterschrift
  signature?: string;
  // Datum & Unterschrift
  angebotAngenommen?: string;
  datumUnterschriftKunde?: string;
  datumUnterschriftBellavue?: string;
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