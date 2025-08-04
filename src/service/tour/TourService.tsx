import { API } from '../axiosConfig';
import {
  DiveTour,
  CreateTourRequest,
  UpdateTourRequest,
  PaginatedResponse,
  GetAllDataResponse,
  ApiResponse,
  DateRangeParams,
  GuideParams
} from '../../types/dive';

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

  async getAllTours(page = 1, limit = 10): Promise<GetAllDataResponse<DiveTour>> {
    try {
      const response = await API.get<GetAllDataResponse<DiveTour>>(this.baseUrl, {
        params: { page, limit }
      });
      return response.data;
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

  async getToursByDateRange(params: DateRangeParams): Promise<PaginatedResponse<DiveTour>> {
    try {
      const response = await API.get<PaginatedResponse<DiveTour>>(`${this.baseUrl}/date-range`, {
        params
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Error fetching tours by date range');
    }
  }

  async getToursByGuide(params: GuideParams): Promise<PaginatedResponse<DiveTour>> {
    try {
      const response = await API.get<PaginatedResponse<DiveTour>>(`${this.baseUrl}/guide/${encodeURIComponent(params.guideName)}`, {
        params: {
          page: params.page,
          limit: params.limit
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error fetching tours for guide ${params.guideName}`);
    }
  }

  async getToursWithFilters(filters: {
    date_from?: string;
    date_to?: string;
    guide_name?: string;
    client_payment_status?: 'paid' | 'pending' | 'all';
    guide_payment_status?: 'paid' | 'pending' | 'all';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<DiveTour>> {
    try {
      const { page = 1, limit = 10, ...otherFilters } = filters;

      if (otherFilters.date_from && otherFilters.date_to) {
        const tours = await this.getToursByDateRange({
          startDate: otherFilters.date_from,
          endDate: otherFilters.date_to,
          page,
          limit
        });

        // Apply additional filters to the paginated results
        const filteredTours = this.applyFilters(tours.data, otherFilters);
        return {
          ...tours,
          data: filteredTours,
          pagination: {
            ...tours.pagination,
            totalCount: filteredTours.length
          }
        };
      }

      if (otherFilters.guide_name) {
        const tours = await this.getToursByGuide({
          guideName: otherFilters.guide_name,
          page,
          limit
        });
        return tours;
      }

      const tours = await this.getAllTours(page, limit);
      return tours;
    } catch (error) {
      throw this.handleError(error, 'Error fetching tours with filters');
    }
  }

  private applyFilters(tours: DiveTour[], filters: {
    date_from?: string;
    date_to?: string;
    guide_name?: string;
    client_payment_status?: 'paid' | 'pending' | 'all';
    guide_payment_status?: 'paid' | 'pending' | 'all';
  }): DiveTour[] {
    return tours.filter(tour => {
      if (filters.date_from && new Date(tour.tour_date) < new Date(filters.date_from)) {
        return false;
      }
      if (filters.date_to && new Date(tour.tour_date) > new Date(filters.date_to)) {
        return false;
      }

      if (filters.guide_name && !tour.guide_name.toLowerCase().includes(filters.guide_name.toLowerCase())) {
        return false;
      }

      if (filters.client_payment_status && filters.client_payment_status !== 'all' &&
        tour.client_payment_status !== filters.client_payment_status) {
        return false;
      }

      if (filters.guide_payment_status && filters.guide_payment_status !== 'all' &&
        tour.guide_payment_status !== filters.guide_payment_status) {
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
      // Get all tours without pagination for stats calculation
      const response = await API.get<PaginatedResponse<DiveTour>>(this.baseUrl, {
        params: { page: 1, limit: 1000 } // Get a large number to get all tours
      });
      const tours = response.data.data;

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
