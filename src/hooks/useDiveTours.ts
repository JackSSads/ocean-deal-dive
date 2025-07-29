import { useState, useEffect, useCallback } from 'react';
import { DiveTour, DiveTourFilters } from '@/types/dive';
import { tourService, CreateTourRequest, UpdateTourRequest } from '@/service/tour/TourService';

export const useDiveTours = () => {
  const [tours, setTours] = useState<DiveTour[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const loadTours = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tourService.getAllTours();
      setTours(data);
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
        await loadTours();
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
        ...(updates.client_name && { client_name: updates.client_name }),
        ...(updates.client_contact && { client_contact: updates.client_contact }),
        ...(updates.contact_type && { contact_type: updates.contact_type }),
        ...(updates.tour_date && { date: updates.tour_date }),
        ...(updates.guide_name && { guide_name: updates.guide_name }),
        ...(updates.total_value !== undefined && { total_value: updates.total_value }),
        ...(updates.guide_commission !== undefined && { guide_commission: updates.guide_commission }),
        ...(updates.commission_type && { commission_type: updates.commission_type }),
        ...(updates.client_payment_status && { client_payment_status: updates.client_payment_status }),
        ...(updates.guide_payment_status && { guide_payment_status: updates.guide_payment_status }),
      };

      const response = await tourService.updateTour(id, updateData);

      if (response.success) {
        await loadTours();
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
        await loadTours();
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

  const getToursByDateRange = async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await tourService.getToursByDateRange({ startDate, endDate });
      setTours(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tours by date range');
      console.error('Error fetching tours by date range:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getToursByGuide = async (guideName: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await tourService.getToursByGuide(guideName);
      setTours(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tours by guide');
      console.error('Error fetching tours by guide:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getToursWithFilters = async (filters: DiveTourFilters) => {
    try {
      setLoading(true);
      setError(null);

      const apiFilters = {
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        guideName: filters.guideName,
        clientPaymentStatus: filters.clientPaymentStatus,
        guidePaymentStatus: filters.guidePaymentStatus,
      };

      const data = await tourService.getToursWithFilters(apiFilters);
      setTours(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tours with filters');
      console.error('Error fetching tours with filters:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const filterTours = (filters: DiveTourFilters) => {
    return tours.filter(tour => {
      if (filters.dateFrom && tour.tour_date < filters.dateFrom) return false;
      if (filters.dateTo && tour.tour_date > filters.dateTo) return false;

      if (filters.clientName && !tour.client_name.toLowerCase().includes(filters.clientName.toLowerCase())) {
        return false;
      }

      if (filters.guideName && !tour.guide_name.toLowerCase().includes(filters.guideName.toLowerCase())) {
        return false;
      }

      if (filters.clientPaymentStatus && filters.clientPaymentStatus !== 'all' && tour.client_payment_status !== filters.clientPaymentStatus) {
        return false;
      }

      if (filters.guidePaymentStatus && filters.guidePaymentStatus !== 'all' && tour.guide_payment_status !== filters.guidePaymentStatus) {
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
      return (tour.total_value * tour.guide_commission) / 100;
    }
    return tour.guide_commission;
  };

  const refreshData = useCallback(async () => {
    await loadTours();
    await loadStats();
  }, [loadTours, loadStats]);

  const clearError = () => {
    setError(null);
  };

  return {
    tours,
    loading,
    error,
    stats,

    addTour,
    updateTour,
    deleteTour,
    getTourById,
    getToursByDateRange,
    getToursByGuide,
    getToursWithFilters,
    filterTours,
    calculateCommissionValue,
    refreshData,
    clearError,
  };
};