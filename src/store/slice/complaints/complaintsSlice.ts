import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ComplaintCategoryItem,
  ComplaintItem,
  LocationCampusNode,
  ScannedAssetInfo,
} from '../../../types/complaint.types';
import { DEFAULT_COMPLAINT_CATEGORIES } from '../../../services/complaintService';
import {
  createComplaintThunk,
  fetchComplaintCategoriesThunk,
  fetchComplaintDetailThunk,
  fetchLocationsTreeThunk,
  fetchMyComplaintsThunk,
  scanAssetQrThunk,
  submitComplaintFeedbackThunk,
  submitQrComplaintThunk,
} from '../../asyncThunks/complaints';

export interface ComplaintsState {
  items: ComplaintItem[];
  total: number;
  selectedComplaint: ComplaintItem | null;
  categories: ComplaintCategoryItem[];
  locationsTree: LocationCampusNode[];
  scannedAsset: ScannedAssetInfo | null;

  loadingList: boolean;
  loadingDetail: boolean;
  loadingLocations: boolean;
  scanningQr: boolean;
  submitting: boolean;
  submittingFeedback: boolean;

  error: string | null;
  submitError: string | null;
  scanError: string | null;
}

const initialState: ComplaintsState = {
  items: [],
  total: 0,
  selectedComplaint: null,
  categories: DEFAULT_COMPLAINT_CATEGORIES,
  locationsTree: [],
  scannedAsset: null,

  loadingList: false,
  loadingDetail: false,
  loadingLocations: false,
  scanningQr: false,
  submitting: false,
  submittingFeedback: false,

  error: null,
  submitError: null,
  scanError: null,
};

export const complaintsSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {
    clearComplaintErrors: (state) => {
      state.error = null;
      state.submitError = null;
      state.scanError = null;
    },
    clearScannedAsset: (state) => {
      state.scannedAsset = null;
      state.scanError = null;
    },
    setScannedAsset: (state, action: PayloadAction<ScannedAssetInfo | null>) => {
      state.scannedAsset = action.payload;
      state.scanError = null;
    },
    clearSelectedComplaint: (state) => {
      state.selectedComplaint = null;
    },
  },
  extraReducers: (builder) => {
    // 1. Fetch My Complaints
    builder
      .addCase(fetchMyComplaintsThunk.pending, (state) => {
        state.loadingList = true;
        state.error = null;
      })
      .addCase(fetchMyComplaintsThunk.fulfilled, (state, action) => {
        state.loadingList = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchMyComplaintsThunk.rejected, (state, action) => {
        state.loadingList = false;
        state.error = (action.payload as string) || 'Failed to fetch complaints';
      });

    // 2. Fetch Complaint Detail
    builder
      .addCase(fetchComplaintDetailThunk.pending, (state) => {
        state.loadingDetail = true;
        state.error = null;
      })
      .addCase(fetchComplaintDetailThunk.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.selectedComplaint = action.payload;
        // Also update item in list if present
        const idx = state.items.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      })
      .addCase(fetchComplaintDetailThunk.rejected, (state, action) => {
        state.loadingDetail = false;
        state.error = (action.payload as string) || 'Failed to load ticket details';
      });

    // 3. Fetch Categories
    builder.addCase(fetchComplaintCategoriesThunk.fulfilled, (state, action) => {
      if (action.payload && action.payload.length > 0) {
        state.categories = action.payload;
      }
    });

    // 4. Fetch Locations Tree
    builder
      .addCase(fetchLocationsTreeThunk.pending, (state) => {
        state.loadingLocations = true;
      })
      .addCase(fetchLocationsTreeThunk.fulfilled, (state, action) => {
        state.loadingLocations = false;
        state.locationsTree = action.payload;
      })
      .addCase(fetchLocationsTreeThunk.rejected, (state) => {
        state.loadingLocations = false;
      });

    // 5. Create Standard Complaint
    builder
      .addCase(createComplaintThunk.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(createComplaintThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.items = [action.payload, ...state.items];
        state.total = state.total + 1;
      })
      .addCase(createComplaintThunk.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = (action.payload as string) || 'Failed to submit complaint';
      });

    // 6. Scan Asset QR
    builder
      .addCase(scanAssetQrThunk.pending, (state) => {
        state.scanningQr = true;
        state.scanError = null;
      })
      .addCase(scanAssetQrThunk.fulfilled, (state, action) => {
        state.scanningQr = false;
        state.scannedAsset = action.payload;
      })
      .addCase(scanAssetQrThunk.rejected, (state, action) => {
        state.scanningQr = false;
        state.scannedAsset = null;
        state.scanError = (action.payload as string) || 'Asset QR could not be resolved';
      });

    // 7. Submit QR Complaint
    builder
      .addCase(submitQrComplaintThunk.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(submitQrComplaintThunk.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(submitQrComplaintThunk.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = (action.payload as string) || 'Failed to submit QR complaint';
      });

    // 8. Submit CSAT Feedback
    builder
      .addCase(submitComplaintFeedbackThunk.pending, (state) => {
        state.submittingFeedback = true;
      })
      .addCase(submitComplaintFeedbackThunk.fulfilled, (state, action) => {
        state.submittingFeedback = false;
        const { id, rating, feedbackComment } = action.payload;
        if (state.selectedComplaint && state.selectedComplaint.id === id) {
          state.selectedComplaint = {
            ...state.selectedComplaint,
            rating,
            feedbackComment,
          };
        }
        state.items = state.items.map((item) =>
          item.id === id ? { ...item, rating, feedbackComment } : item
        );
      })
      .addCase(submitComplaintFeedbackThunk.rejected, (state, action) => {
        state.submittingFeedback = false;
        state.error = (action.payload as string) || 'Failed to submit rating';
      });
  },
});

export const {
  clearComplaintErrors,
  clearScannedAsset,
  setScannedAsset,
  clearSelectedComplaint,
} = complaintsSlice.actions;

export default complaintsSlice.reducer;

