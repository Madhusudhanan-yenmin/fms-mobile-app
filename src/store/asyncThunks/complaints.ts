import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  ComplaintService,
  FetchComplaintsParams,
} from '../../services/complaintService';
import { LocationService } from '../../services/locationService';
import {
  ComplaintFeedbackPayload,
  CreateComplaintPayload,
  PublicQrComplaintPayload,
} from '../../types/complaint.types';

/**
 * 1. Fetch complaints for the logged-in requester / user
 */
export const fetchMyComplaintsThunk = createAsyncThunk(
  'complaints/fetchMyComplaints',
  async (params: FetchComplaintsParams | undefined, { rejectWithValue }) => {
    try {
      return await ComplaintService.getComplaints(params);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch complaints');
    }
  }
);

/**
 * 2. Fetch full complaint details (with timeline, comments, evidence)
 */
export const fetchComplaintDetailThunk = createAsyncThunk(
  'complaints/fetchDetail',
  async (idOrTicketNumber: string, { rejectWithValue }) => {
    try {
      return await ComplaintService.getComplaintById(idOrTicketNumber);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to load complaint details');
    }
  }
);

/**
 * 3. Fetch master complaint categories
 */
export const fetchComplaintCategoriesThunk = createAsyncThunk(
  'complaints/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await ComplaintService.getCategories();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to load categories');
    }
  }
);

/**
 * 4. Fetch 4-tier Campus -> Building -> Floor -> Room location hierarchy
 */
export const fetchLocationsTreeThunk = createAsyncThunk(
  'complaints/fetchLocationsTree',
  async (_, { rejectWithValue }) => {
    try {
      return await LocationService.getLocationsTree();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to load campus locations');
    }
  }
);

/**
 * 5. Create new complaint (authenticated manual reporting)
 */
export const createComplaintThunk = createAsyncThunk(
  'complaints/createComplaint',
  async (payload: CreateComplaintPayload, { rejectWithValue }) => {
    try {
      return await ComplaintService.createComplaint(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to submit complaint');
    }
  }
);

/**
 * 6. Resolve scanned QR code / Asset Code
 */
export const scanAssetQrThunk = createAsyncThunk(
  'complaints/scanAssetQr',
  async (codeOrPayload: string, { rejectWithValue }) => {
    try {
      return await ComplaintService.scanAssetByQr(codeOrPayload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Asset QR code could not be resolved');
    }
  }
);

/**
 * 7. Submit breakdown report directly from scanned QR asset
 */
export const submitQrComplaintThunk = createAsyncThunk(
  'complaints/submitQrComplaint',
  async (payload: PublicQrComplaintPayload, { rejectWithValue }) => {
    try {
      return await ComplaintService.submitPublicQrReport(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to submit QR complaint');
    }
  }
);

/**
 * 8. Submit CSAT 1-5 star rating & feedback comment
 */
export const submitComplaintFeedbackThunk = createAsyncThunk(
  'complaints/submitFeedback',
  async (
    {
      complaintId,
      payload,
    }: { complaintId: string; payload: ComplaintFeedbackPayload },
    { rejectWithValue }
  ) => {
    try {
      return await ComplaintService.submitFeedback(complaintId, payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to submit rating feedback');
    }
  }
);

