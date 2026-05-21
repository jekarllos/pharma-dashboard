import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useSalesSummary() {
  return useQuery({
    queryKey: ['sales-summary'],
    queryFn: async () => {
      const response = await api.get('/api/dashboard/sales-summary', {
        withCredentials: true
      });
      return response.data;
    },
    refetchInterval: 30000,
  });
}

export function useSalesTrend() {
  return useQuery({
    queryKey: ['sales-trend'],
    queryFn: async () => {
      const response = await api.get('/api/dashboard/sales-trend', {
        withCredentials: true
      });
      return response.data;
    },
    refetchInterval: 60000,
  });
}

export function useCriticalInventory() {
  return useQuery({
    queryKey: ['critical-inventory'],
    queryFn: async () => {
      const response = await api.get('/api/dashboard/critical-inventory', {
        withCredentials: true
      });
      return response.data;
    },
    refetchInterval: 60000,
  });
}

export function useProducts(page: number, search: string) {
  return useQuery({
    queryKey: ['products', page, search],
    queryFn: async () => {
      const { data } = await api.get(`/api/products?page=${page}&search=${search}`);
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useCompany() {
  return useQuery({
    queryKey: ['company'],
    queryFn: async () => {
      const { data } = await api.get('/api/company');
      return data;
    }
  });
}

export function useSales(startDate: string, endDate: string, page: number) {
  return useQuery({
    queryKey: ['sales', startDate, endDate, page],
    queryFn: async () => {
      const { data } = await api.get(
        `/api/sales?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=10`
      );
      return data;
    },
    enabled: !!startDate && !!endDate
  });
}

export function useSalesPeriodSummary(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['sales-period-summary', startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get(
        `/api/sales/summary?startDate=${startDate}&endDate=${endDate}`
      );
      return data;
    },
    enabled: !!startDate && !!endDate
  });
}