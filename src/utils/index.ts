import type { EventStatus } from '../types';

export const getStatusLabel = (status: EventStatus): string => {
  switch (status) {
    case 'planned':
      return 'Geplant';
    case 'confirmed':
      return 'Bestätigt';
    case 'cancelled':
      return 'Abgesagt';
    default:
      return status;
  }
};

export const getStatusColor = (status: EventStatus): 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'cancelled':
      return 'error';
    case 'planned':
    default:
      return 'warning';
  }
}; 