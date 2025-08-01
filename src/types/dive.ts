export interface DiveTour {
  tour_id: string;
  client_name: string;
  client_contact: string;
  contact_type: 'whatsapp' | 'phone' | 'email';
  tour_date: string;
  guide_name: string;
  total_value: number;
  guide_commission: number;
  commission_type: 'percentage' | 'fixed';
  client_payment_status: 'paid' | 'pending';
  guide_payment_status: 'paid' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface DiveTourFilters {
  date_from?: string;
  date_to?: string;
  client_name?: string;
  guide_name?: string;
  client_payment_status?: 'paid' | 'pending' | 'all';
  guide_payment_status?: 'paid' | 'pending' | 'all';
  search?: string;
}