import { useState, useEffect, useCallback } from 'react';
import { DiveTour, DiveTourFilters } from '@/types/dive';
import { tourService, CreateTourRequest, UpdateTourRequest, PaginationInfo } from '@/service/tour/TourService';

export const useDiveTours = () => {
  const [tours, setTours] = useState<DiveTour[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [stats, setStats] = useState({
    totalTours: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    completedTours: 0,
    thisMonthTours: 0,
    thisMonthRevenue: 0,
  });

  useEffect(() => {
    loadTours();
    loadStats();
  }, []);

  const loadTours = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tourService.getAllTours(page, limit);
      setTours(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tours');
      console.error('Error loading tours:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await tourService.getTourStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, []);

  const addTour = async (tourData: Omit<DiveTour, 'tour_id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);

      const createData: CreateTourRequest = {
        client_name: tourData.client_name,
        client_contact: tourData.client_contact,
        contact_type: tourData.contact_type,
        tour_date: tourData.tour_date,
        guide_name: tourData.guide_name,
        total_value: tourData.total_value,
        guide_commission: tourData.guide_commission,
        commission_type: tourData.commission_type,
        client_payment_status: tourData.client_payment_status,
        guide_payment_status: tourData.guide_payment_status,
      };

      const response = await tourService.createTour(createData);

      if (response.success) {
        await loadTours(pagination.page, pagination.limit);
        await loadStats();
        return response;
      } else {
        throw new Error(response.message || 'Failed to create tour');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tour');
      console.error('Error creating tour:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTour = async (id: string, updates: Partial<DiveTour>) => {
    try {
      setLoading(true);
      setError(null);

      const updateData: UpdateTourRequest = {
        ...( 'client_name' in updates && { client_name: updates.client_name }),
        ...( 'client_contact' in updates && { client_contact: updates.client_contact }),
        ...( 'contact_type' in updates && { contact_type: updates.contact_type }),
        ...( 'tour_date' in updates && { tour_date: updates.tour_date }),
        ...( 'guide_name' in updates && { guide_name: updates.guide_name }),
        ...( 'total_value' in updates && { total_value: updates.total_value }),
        ...( 'guide_commission' in updates && { guide_commission: updates.guide_commission }),
        ...( 'commission_type' in updates && { commission_type: updates.commission_type }),
        ...( 'client_payment_status' in updates && { client_payment_status: updates.client_payment_status }),
        ...( 'guide_payment_status' in updates && { guide_payment_status: updates.guide_payment_status }),
      };
      
      const response = await tourService.updateTour(id, updateData);

      if (response.success) {
        await loadTours(pagination.page, pagination.limit);
        await loadStats();
        return response;
      } else {
        throw new Error(response.message || 'Failed to update tour');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tour');
      console.error('Error updating tour:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTour = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await tourService.deleteTour(id);

      if (response.success) {
        // Reload tours to get the updated list
        await loadTours(pagination.page, pagination.limit);
        await loadStats();
        return response;
      } else {
        throw new Error(response.message || 'Failed to delete tour');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tour');
      console.error('Error deleting tour:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTourById = async (id: string) => {
    try {
      setError(null);
      return await tourService.getTourById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tour');
      console.error('Error fetching tour:', err);
      throw err;
    }
  };

  const getToursByDateRange = async (startDate: string, endDate: string, page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tourService.getToursByDateRange({ startDate, endDate, page, limit });
      setTours(response.data);
      setPagination(response.pagination);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tours by date range');
      console.error('Error fetching tours by date range:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getToursByGuide = async (guideName: string, page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tourService.getToursByGuide({ guideName, page, limit });
      setTours(response.data);
      setPagination(response.pagination);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tours by guide');
      console.error('Error fetching tours by guide:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getToursWithFilters = async (filters: DiveTourFilters & { page?: number; limit?: number }) => {
    try {
      setLoading(true);
      setError(null);

      const apiFilters = {
        date_from: filters.date_from,
        date_to: filters.date_to,
        guide_name: filters.guide_name,
        client_payment_status: filters.client_payment_status,
        guide_payment_status: filters.guide_payment_status,
        page: filters.page || 1,
        limit: filters.limit || 10,
      };

      const response = await tourService.getToursWithFilters(apiFilters);
      setTours(response.data);
      setPagination(response.pagination);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tours with filters');
      console.error('Error fetching tours with filters:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const goToPage = async (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      await loadTours(page, pagination.limit);
    }
  };

  const changePageSize = async (newLimit: number) => {
    await loadTours(1, newLimit);
  };

  const filterTours = (filters: DiveTourFilters) => {
    return tours.filter(tour => {
      if (filters.date_from && tour.tour_date < filters.date_from) return false;
      if (filters.date_to && tour.tour_date > filters.date_to) return false;

      if (filters.client_name && !tour.client_name.toLowerCase().includes(filters.client_name.toLowerCase())) {
        return false;
      }

      if (filters.guide_name && !tour.guide_name.toLowerCase().includes(filters.guide_name.toLowerCase())) {
        return false;
      }

      if (filters.client_payment_status && filters.client_payment_status !== 'all' && tour.client_payment_status !== filters.client_payment_status) {
        return false;
      }

      if (filters.guide_payment_status && filters.guide_payment_status !== 'all' && tour.guide_payment_status !== filters.guide_payment_status) {
        return false;
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return tour.client_name.toLowerCase().includes(searchTerm) ||
          tour.client_contact.toLowerCase().includes(searchTerm) ||
          tour.guide_name.toLowerCase().includes(searchTerm);
      }

      return true;
    });
  };

  const calculateCommissionValue = (tour: DiveTour) => {
    if (tour.commission_type === 'percentage') {
      return Number((tour.total_value * tour.guide_commission) / 100);
    }
    return Number(tour.guide_commission);
  };

  const refreshData = useCallback(async () => {
    await loadTours(pagination.page, pagination.limit);
    await loadStats();
  }, [loadTours, loadStats, pagination.page, pagination.limit]);

  const clearError = () => {
    setError(null);
  };

  return {
    tours,
    loading,
    error,
    stats,
    pagination,

    addTour,
    updateTour,
    deleteTour,
    getTourById,
    getToursByDateRange,
    getToursByGuide,
    getToursWithFilters,
    filterTours,
    calculateCommissionValue,
    goToPage,
    changePageSize,
    refreshData,
    clearError,
  };
};