import { apiClient } from './apiClient';
import { API_CONFIG } from '../config/api.config';
import { ApiResponse } from '../types/auth.types';
import { LocationCampusNode } from '../types/complaint.types';

export const LocationService = {
  /**
   * Fetch 4-tier campus location hierarchy (Campus -> Building -> Floor -> Room)
   */
  async getLocationsTree(): Promise<LocationCampusNode[]> {
    try {
      const response = await apiClient.get<ApiResponse<LocationCampusNode[]>>(
        API_CONFIG.ENDPOINTS.LOCATIONS_TREE
      );

      const responseData = response.data;
      if (!responseData.status || !Array.isArray(responseData.data)) {
        throw new Error(responseData.message || 'Failed to load campus locations.');
      }

      return responseData.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to load campus locations.';
      throw new Error(Array.isArray(msg) ? msg.join(', ') : String(msg));
    }
  },
};

