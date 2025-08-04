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

export interface CreateTourRequest {
  client_name: string;
  client_contact: string;
  contact_type?: 'whatsapp' | 'phone' | 'email';
  tour_date: string;
  guide_name: string;
  total_value: number;
  guide_commission: number;
  commission_type?: 'percentage' | 'fixed';
  client_payment_status?: 'paid' | 'pending';
  guide_payment_status?: 'paid' | 'pending';
}

export interface UpdateTourRequest extends Partial<CreateTourRequest> {}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
}

export interface GetAllDataResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
  metrics: Metrics;
}

export interface Metrics {
  total_count: number,
  total_value: number,
  total_guide_commission: number,
  total_pending_payments: number,
  total_paid_tours: number,
  total_guide_commission_pedding: number
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  tourId?: string;
  pagination?: PaginationInfo;
}

export interface DateRangeParams {
  startDate: string;
  endDate: string;
  page?: number;
  limit?: number;
}

export interface GuideParams {
  guideName: string;
  page?: number;
  limit?: number;
}
