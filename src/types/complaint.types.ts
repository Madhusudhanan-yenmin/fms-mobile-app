import { PriorityLevel, TicketLifecycleStatus } from './index';

export interface ComplaintEvidence {
  id: string;
  type: 'Before' | 'After' | 'Supporting';
  url: string;
  caption?: string;
  fileName?: string;
  fileSize?: string;
  uploadedBy?: string;
  uploadedAt: string;
}

export interface ComplaintTimelineEvent {
  id: string;
  status: TicketLifecycleStatus | string;
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
}

export interface ComplaintCommentItem {
  id: string;
  complaintId?: string;
  comment: string;
  isInternalOnly?: boolean;
  authorName: string;
  createdAt: string;
}

export interface ComplaintCategoryItem {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}

export interface ComplaintItem {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: PriorityLevel;
  status: TicketLifecycleStatus;

  // Location Hierarchy
  campusId: string;
  campusName: string;
  buildingId: string;
  buildingName: string;
  floorId?: string;
  floorName?: string;
  roomId?: string;
  roomName?: string;

  // Linked Asset
  assetId?: string;
  assetName?: string;

  // Requester
  requesterName: string;
  requesterRole: string;
  requesterEmail: string;
  requesterPhone: string;

  // SLA & Dates
  reportedAt: string;
  slaTargetHours: number;
  slaDueAt: string;
  slaBreached: boolean;

  // Assignment
  assignedTo?: string;
  assignedToName?: string;
  assignedDepartment?: string;
  assignedAt?: string;

  // Resolution
  resolvedAt?: string;
  resolutionNotes?: string;
  rootCause?: string;

  // Verification & CSAT Feedback
  verifiedBy?: string;
  verifiedAt?: string;
  closedAt?: string;
  rating?: number;
  feedbackComment?: string;

  // Nested details
  evidence?: ComplaintEvidence[];
  timeline?: ComplaintTimelineEvent[];
  comments?: ComplaintCommentItem[];
}

export interface CreateComplaintPayload {
  title: string;
  description: string;
  category: string;
  priority: PriorityLevel;
  campusId: string;
  buildingId: string;
  floorId?: string;
  roomId?: string;
  assetId?: string;
  requesterName: string;
  requesterRole: string;
  requesterEmail: string;
  requesterPhone: string;
}

export interface PublicQrComplaintPayload {
  assetCode: string;
  issueCategory: string;
  priority?: PriorityLevel;
  title: string;
  description: string;
  requesterName: string;
  requesterRole?: string;
  requesterPhone: string;
  requesterEmail?: string;
}

export interface PublicQrComplaintResponse {
  id: string;
  ticketNumber: string;
  trackingUrl: string;
  assetCode: string;
  assetName: string;
  location: string;
}

export interface ComplaintFeedbackPayload {
  rating: number;
  comment?: string;
}

export interface ScannedAssetInfo {
  assetId: string;
  assetCode: string;
  name: string;
  location: string;
  status?: string;
  condition?: string;
  responsiblePerson?: string;
}

export type ScannedLocationType = 'Campus' | 'Building' | 'Floor' | 'Room';

export interface ScannedLocationInfo {
  locationType: ScannedLocationType;
  id: string;
  name: string;
  code?: string;
  roomNumber?: string;
  type?: string;
  capacity?: number;
  readinessStatus?: string;
  readinessReason?: string;
  inCharge?: string;
  supervisor?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: string;
  floorNumber?: number;
  totalBuildings?: number;
  totalFloors?: number;
  totalRooms?: number;
  totalAssets?: number;
  qrCodeString?: string;
  latitude?: number | null;
  longitude?: number | null;
  geofenceRadiusMeters?: number;
  breadcrumb?: string;
  hierarchy?: {
    campus?: { id?: string; name?: string; code?: string };
    building?: { id?: string; name?: string; code?: string };
    floor?: { id?: string; floorName?: string; floorNumber?: number };
  };
}

export interface LocationRoomNode {
  id: string;
  roomNumber?: string;
  name: string;
  readinessStatus?: string;
}

export interface LocationFloorNode {
  id: string;
  floorName: string;
  rooms: LocationRoomNode[];
}

export interface LocationBuildingNode {
  id: string;
  name: string;
  floors: LocationFloorNode[];
}

export interface LocationCampusNode {
  id: string;
  name: string;
  buildings: LocationBuildingNode[];
}

