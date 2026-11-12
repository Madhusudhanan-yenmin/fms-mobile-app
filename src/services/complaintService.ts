import { apiClient } from './apiClient';
import { API_CONFIG } from '../config/api.config';
import { ApiResponse } from '../types/auth.types';
import {
  ComplaintCategoryItem,
  ComplaintCommentItem,
  ComplaintEvidence,
  ComplaintFeedbackPayload,
  ComplaintItem,
  ComplaintTimelineEvent,
  CreateComplaintPayload,
  PublicQrComplaintPayload,
  PublicQrComplaintResponse,
  ScannedAssetInfo,
} from '../types/complaint.types';
import { PriorityLevel, TicketLifecycleStatus } from '../types';

export const DEFAULT_COMPLAINT_CATEGORIES: ComplaintCategoryItem[] = [
  { id: 'cat-classroom', name: 'Classroom', code: 'CLASSROOM' },
  { id: 'cat-it', name: 'IT', code: 'IT' },
  { id: 'cat-electrical', name: 'Electrical', code: 'ELECTRICAL' },
  { id: 'cat-plumbing', name: 'Water & Plumbing', code: 'WATER_PLUMBING' },
  { id: 'cat-washroom', name: 'Washroom', code: 'WASHROOM' },
  { id: 'cat-housekeeping', name: 'Housekeeping', code: 'HOUSEKEEPING' },
  { id: 'cat-safety', name: 'Safety', code: 'SAFETY' },
  { id: 'cat-general', name: 'General Facility', code: 'GENERAL_FACILITY' },
];

const formatComplaintDate = (val?: string | Date | null): string => {
  if (!val) return '';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return String(val);
  }
};

const extractErrorMsg = (error: any, fallback: string): string => {
  const msg =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback;
  return Array.isArray(msg) ? msg.join(', ') : String(msg);
};

export const normalizeComplaint = (raw: any): ComplaintItem => {
  if (!raw) return {} as ComplaintItem;

  const rawTimeline = Array.isArray(raw.timeline) ? raw.timeline : [];
  const timeline: ComplaintTimelineEvent[] = rawTimeline.map((item: any) => ({
    id: item.id || `tl-${Math.random().toString(36).slice(2)}`,
    status: item.status || 'Raised',
    title: item.title || 'Status updated',
    description: item.description || '',
    performedBy: item.performedBy || 'System User',
    timestamp: formatComplaintDate(item.createdAt || item.timestamp),
  }));

  const rawEvidence = Array.isArray(raw.evidence) ? raw.evidence : [];
  const evidence: ComplaintEvidence[] = rawEvidence.map((evi: any) => ({
    id: evi.id || `evi-${Math.random().toString(36).slice(2)}`,
    type: evi.type || 'Supporting',
    url: evi.url || '',
    caption: evi.caption || '',
    fileName: evi.fileName || '',
    fileSize: evi.fileSize || '',
    uploadedBy: evi.uploadedBy || 'User',
    uploadedAt: formatComplaintDate(evi.createdAt || evi.uploadedAt),
  }));

  const rawComments = Array.isArray(raw.comments) ? raw.comments : [];
  const comments: ComplaintCommentItem[] = rawComments
    .filter((cmt: any) => !cmt.isInternalOnly)
    .map((cmt: any) => ({
      id: cmt.id || `cmt-${Math.random().toString(36).slice(2)}`,
      complaintId: cmt.complaintId || raw.id,
      comment: cmt.comment || '',
      isInternalOnly: Boolean(cmt.isInternalOnly),
      authorName: cmt.authorName || 'Staff',
      createdAt: formatComplaintDate(cmt.createdAt),
    }));

  const validPriorities: PriorityLevel[] = ['Low', 'Medium', 'High', 'Critical'];
  const priority: PriorityLevel = validPriorities.includes(raw.priority)
    ? raw.priority
    : 'Medium';

  const validStatuses: TicketLifecycleStatus[] = [
    'Raised',
    'Assigned',
    'In Progress',
    'Resolved',
    'Verified',
    'Closed',
  ];
  const status: TicketLifecycleStatus = validStatuses.includes(raw.status)
    ? raw.status
    : 'Raised';

  return {
    id: raw.id || '',
    ticketNumber: raw.ticketNumber || `TKT-${raw.id || '0000'}`,
    title: raw.title || '',
    description: raw.description || '',
    category: raw.category || 'General Facility',
    priority,
    status,

    campusId: raw.campusId || '',
    campusName: raw.campusName || 'Main Campus',
    buildingId: raw.buildingId || '',
    buildingName: raw.buildingName || '',
    floorId: raw.floorId || '',
    floorName: raw.floorName || '',
    roomId: raw.roomId || '',
    roomName: raw.roomName || '',

    assetId: raw.assetId || '',
    assetName: raw.assetName || '',

    requesterName: raw.requesterName || '',
    requesterRole: raw.requesterRole || 'Staff',
    requesterEmail: raw.requesterEmail || '',
    requesterPhone: raw.requesterPhone || '',

    reportedAt: formatComplaintDate(raw.reportedAt || raw.createdAt),
    slaTargetHours: Number(raw.slaTargetHours) || 24,
    slaDueAt: formatComplaintDate(raw.slaDueAt),
    slaBreached: Boolean(raw.slaBreached),

    assignedTo: raw.assignedTo || '',
    assignedToName: raw.assignedToName || '',
    assignedDepartment: raw.assignedDepartment || '',
    assignedAt: formatComplaintDate(raw.assignedAt),

    resolvedAt: formatComplaintDate(raw.resolvedAt),
    resolutionNotes: raw.resolutionNotes || '',
    rootCause: raw.rootCause || '',

    verifiedBy: raw.verifiedBy || '',
    verifiedAt: formatComplaintDate(raw.verifiedAt),
    closedAt: formatComplaintDate(raw.closedAt),

    rating: typeof raw.rating === 'number' ? raw.rating : undefined,
    feedbackComment: raw.feedbackComment || '',

    evidence,
    timeline,
    comments,
  };
};

export interface FetchComplaintsParams {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
  requesterEmail?: string;
}

export const ComplaintService = {
  /**
   * Fetch complaints list (backend isolates automatically for non-admin requesters,
   * and supports requesterEmail filter when needed).
   */
  async getComplaints(params?: FetchComplaintsParams): Promise<{
    items: ComplaintItem[];
    total: number;
  }> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(
        API_CONFIG.ENDPOINTS.COMPLAINTS,
        {
          params: {
            page: params?.page ?? 1,
            limit: params?.limit ?? 50,
            ...(params?.status ? { status: params.status } : {}),
            ...(params?.q ? { q: params.q } : {}),
            ...(params?.requesterEmail ? { requesterEmail: params.requesterEmail } : {}),
          },
        }
      );

      const responseData = response.data;
      if (!responseData.status) {
        throw new Error(responseData.message || 'Failed to fetch complaints.');
      }

      const rawList = Array.isArray(responseData.data) ? responseData.data : [];
      return {
        items: rawList.map(normalizeComplaint),
        total: Number(responseData.meta?.total ?? rawList.length),
      };
    } catch (error: any) {
      throw new Error(extractErrorMsg(error, 'Failed to load complaints.'));
    }
  },

  /**
   * Fetch full complaint detail (including timeline, comments, evidence)
   */
  async getComplaintById(idOrTicketNumber: string): Promise<ComplaintItem> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        `${API_CONFIG.ENDPOINTS.COMPLAINTS}/${encodeURIComponent(idOrTicketNumber)}`
      );

      const responseData = response.data;
      if (!responseData.status || !responseData.data) {
        throw new Error(responseData.message || 'Failed to fetch ticket details.');
      }

      return normalizeComplaint(responseData.data);
    } catch (error: any) {
      throw new Error(extractErrorMsg(error, 'Failed to fetch ticket details.'));
    }
  },

  /**
   * Fetch master complaint categories
   */
  async getCategories(): Promise<ComplaintCategoryItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<ComplaintCategoryItem[]>>(
        API_CONFIG.ENDPOINTS.COMPLAINT_CATEGORIES
      );

      const responseData = response.data;
      const list = Array.isArray(responseData.data) ? responseData.data : [];
      if (list.length === 0) {
        return DEFAULT_COMPLAINT_CATEGORIES;
      }
      return list.filter((c) => c.isActive !== false);
    } catch {
      return DEFAULT_COMPLAINT_CATEGORIES;
    }
  },

  /**
   * Create a standard authenticated complaint (manual location hierarchy)
   */
  async createComplaint(payload: CreateComplaintPayload): Promise<ComplaintItem> {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        API_CONFIG.ENDPOINTS.COMPLAINTS,
        payload
      );

      const responseData = response.data;
      if (!responseData.status || !responseData.data) {
        throw new Error(responseData.message || 'Failed to submit complaint.');
      }

      return normalizeComplaint(responseData.data);
    } catch (error: any) {
      throw new Error(extractErrorMsg(error, 'Failed to submit complaint.'));
    }
  },

  /**
   * Resolve a scanned QR code or raw payload (handles raw URLs, FMS://AST/..., or asset codes)
   */
  async scanAssetByQr(codeOrPayload: string): Promise<ScannedAssetInfo> {
    try {
      const response = await apiClient.get<ApiResponse<ScannedAssetInfo>>(
        API_CONFIG.ENDPOINTS.ASSET_SCAN,
        {
          params: { code: codeOrPayload.trim() },
        }
      );

      const responseData = response.data;
      if (!responseData.status || !responseData.data) {
        throw new Error(responseData.message || 'Asset QR code not recognized.');
      }

      return responseData.data;
    } catch (error: any) {
      throw new Error(
        extractErrorMsg(error, 'Could not find an equipment asset matching this QR code.')
      );
    }
  },

  /**
   * Submit a complaint directly from scanned asset QR code
   */
  async submitPublicQrReport(
    payload: PublicQrComplaintPayload
  ): Promise<PublicQrComplaintResponse> {
    try {
      const response = await apiClient.post<ApiResponse<PublicQrComplaintResponse>>(
        API_CONFIG.ENDPOINTS.PUBLIC_QR_REPORT,
        payload
      );

      const responseData = response.data;
      if (!responseData.status || !responseData.data) {
        throw new Error(responseData.message || 'Failed to submit QR breakdown report.');
      }

      return responseData.data;
    } catch (error: any) {
      throw new Error(extractErrorMsg(error, 'Failed to submit QR breakdown report.'));
    }
  },

  /**
   * Submit 1-5 Star CSAT feedback rating for a ticket
   */
  async submitFeedback(
    complaintId: string,
    payload: ComplaintFeedbackPayload
  ): Promise<{ id: string; rating: number; feedbackComment?: string }> {
    try {
      const response = await apiClient.post<
        ApiResponse<{ id: string; rating: number; feedbackComment?: string }>
      >(`${API_CONFIG.ENDPOINTS.COMPLAINTS}/${encodeURIComponent(complaintId)}/feedback`, payload);

      const responseData = response.data;
      if (!responseData.status || !responseData.data) {
        throw new Error(responseData.message || 'Failed to submit feedback.');
      }

      return responseData.data;
    } catch (error: any) {
      throw new Error(extractErrorMsg(error, 'Failed to submit rating feedback.'));
    }
  },
};

