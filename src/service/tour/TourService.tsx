import { API } from '../axiosConfig';
import { DiveTour } from '../../types/dive';

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

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  tourId?: string;
}

export interface DateRangeParams {
  startDate: string;
  endDate: string;
}

class TourService {
  private readonly baseUrl = '/api/tour';

  async createTour(tourData: CreateTourRequest): Promise<ApiResponse> {
    try {
      const response = await API.post<ApiResponse>(this.baseUrl, tourData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Error creating tour');
    }
  }

  async getAllTours(): Promise<DiveTour[]> {
    try {
      const response = await API.get<ApiResponse<DiveTour[]>>(this.baseUrl);
      return response.data.data || [];
    } catch (error) {
      throw this.handleError(error, 'Error fetching tours');
    }
  }

  async getTourById(id: string): Promise<DiveTour> {
    try {
      const response = await API.get<ApiResponse<DiveTour>>(`${this.baseUrl}/${id}`);
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error, `Error fetching tour with ID ${id}`);
    }
  }

  async updateTour(id: string, tourData: UpdateTourRequest): Promise<ApiResponse> {
    try {
      const response = await API.put<ApiResponse>(`${this.baseUrl}/${id}`, tourData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error updating tour with ID ${id}`);
    }
  }

  async deleteTour(id: string): Promise<ApiResponse> {
    try {
      const response = await API.delete<ApiResponse>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error deleting tour with ID ${id}`);
    }
  }

  async getToursByDateRange(params: DateRangeParams): Promise<DiveTour[]> {
    try {
      const response = await API.get<ApiResponse<DiveTour[]>>(`${this.baseUrl}/date-range`, {
        params
      });
      return response.data.data || [];
    } catch (error) {
      throw this.handleError(error, 'Error fetching tours by date range');
    }
  }

  async getToursByGuide(guideName: string): Promise<DiveTour[]> {
    try {
      const response = await API.get<ApiResponse<DiveTour[]>>(`${this.baseUrl}/guide/${encodeURIComponent(guideName)}`);
      return response.data.data || [];
    } catch (error) {
      throw this.handleError(error, `Error fetching tours for guide ${guideName}`);
    }
  }

  async getToursWithFilters(filters: {
    dateFrom?: string;
    dateTo?: string;
    guideName?: string;
    clientPaymentStatus?: 'paid' | 'pending' | 'all';
    guidePaymentStatus?: 'paid' | 'pending' | 'all';
  }): Promise<DiveTour[]> {
    try {
        
      if (filters.dateFrom && filters.dateTo) {
        const tours = await this.getToursByDateRange({
          startDate: filters.dateFrom,
          endDate: filters.dateTo
        });
        
        
        return this.applyFilters(tours, filters);
      }

      
      if (filters.guideName) {
        const tours = await this.getToursByGuide(filters.guideName);
        return this.applyFilters(tours, filters);
      }

      
      const tours = await this.getAllTours();
      return this.applyFilters(tours, filters);
    } catch (error) {
      throw this.handleError(error, 'Error fetching tours with filters');
    }
  }

  private applyFilters(tours: DiveTour[], filters: {
    dateFrom?: string;
    dateTo?: string;
    guideName?: string;
    clientPaymentStatus?: 'paid' | 'pending' | 'all';
    guidePaymentStatus?: 'paid' | 'pending' | 'all';
  }): DiveTour[] {
    return tours.filter(tour => {
        
      if (filters.dateFrom && new Date(tour.tour_date) < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && new Date(tour.tour_date) > new Date(filters.dateTo)) {
        return false;
      }

      
      if (filters.guideName && !tour.guide_name.toLowerCase().includes(filters.guideName.toLowerCase())) {
        return false;
      }

      
      if (filters.clientPaymentStatus && filters.clientPaymentStatus !== 'all' && 
          tour.guide_payment_status !== filters.clientPaymentStatus) {
        return false;
      }

      if (filters.guidePaymentStatus && filters.guidePaymentStatus !== 'all' && 
          tour.guide_payment_status !== filters.guidePaymentStatus) {
        return false;
      }

      return true;
    });
  }

  private handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error(defaultMessage);
  }

  async getTourStats(): Promise<{
    totalTours: number;
    totalRevenue: number;
    pendingPayments: number;
    completedTours: number;
    thisMonthTours: number;
    thisMonthRevenue: number;
  }> {
    try {
      const tours = await this.getAllTours();
      
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      const thisMonthTours = tours.filter(tour => {
        const tourDate = new Date(tour.tour_date);
        return tourDate.getMonth() === thisMonth && tourDate.getFullYear() === thisYear;
      });
      
      const totalRevenue = tours.reduce((sum, tour) => sum + tour.total_value, 0);
      const thisMonthRevenue = thisMonthTours.reduce((sum, tour) => sum + tour.total_value, 0);
      const pendingPayments = tours.filter(tour => tour.client_payment_status === 'pending').length;
      const completedTours = tours.filter(tour => new Date(tour.tour_date) < now).length;
      
      return {
        totalTours: tours.length,
        totalRevenue,
        pendingPayments,
        completedTours,
        thisMonthTours: thisMonthTours.length,
        thisMonthRevenue
      };
    } catch (error) {
      throw this.handleError(error, 'Error fetching tour statistics');
    }
  }
}

export const tourService = new TourService();
export default tourService;
