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
  guestCount?: string;
  kosten?: string;
  specialRequirements?: string;
  notes?: string;
  eventTypes?: string[];
  preferences?: {
    catering: boolean;
    decoration: boolean;
    music: boolean;
    photography: boolean;
  };
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  events: string[];
  tags: string[];
  notes?: string;
  contactPerson?: string;
  company?: string;
  website?: string;
  vatNumber?: string;
  birthday?: string;
  anniversary?: string;
  budget?: string;
  guestCount?: string;
  specialRequirements?: string;
  preferences?: {
    catering: boolean;
    decoration: boolean;
    music: boolean;
    photography: boolean;
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