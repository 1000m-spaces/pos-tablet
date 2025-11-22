import { useQuery } from '@tanstack/react-query';
import HttpClient from 'http/HttpClient';
import { UrlApi } from 'http/UrlApi';

/**
 * Fetches WiFi information for a given restaurant ID
 * @param {number} restid - Restaurant ID
 * @returns {Promise<Object>} WiFi info object with wifi_name and wifi_password
 */
const fetchWifiInfo = async (restid) => {
    if (!restid) {
        throw new Error('Restaurant ID is required');
    }
    try {
        const { data } = await HttpClient.post(UrlApi.getWifi, { restid });
        console.log('WiFi info fetched:', data);
        return data || null;
    } catch (error) {
        console.error('Error fetching WiFi info:', error);
        throw error;
    }
};

/**
 * React Query hook to fetch and cache WiFi information
 * @param {number} restid - Restaurant ID
 * @param {Object} options - Additional React Query options
 * @returns {Object} Query result with WiFi data, loading state, and error
 */
export const useWifiInfo = (restid, options = {}) => {
    return useQuery({
        queryKey: ['wifi', restid],
        queryFn: () => fetchWifiInfo(restid),
        enabled: !!restid, // Only run query if restid is provided
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
        retry: 2, // Retry failed requests twice
        ...options,
    });
};
