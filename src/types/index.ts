export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketLifecycleStatus = 'Raised' | 'Assigned' | 'In Progress' | 'Resolved' | 'Verified' | 'Closed';

export interface IssueItem {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: PriorityLevel;
  status: TicketLifecycleStatus;
  assetCode?: string;
  assetName?: string;
  campus: string;
  building: string;
  floor: string;
  room: string;
  reportedBy: string;
  reportedPhone: string;
  reportedAt: string;
  assignedTo?: string;
  assignedDepartment?: string;
  targetDeadline?: string;
  resolutionNotes?: string;
  sparesConsumed?: string;
  beforePhotoUri?: string;
  afterPhotoUri?: string;
  checklistCompleted?: boolean;
}

export interface AmcContract {
  id: string;
  contractCode: string;
  vendorName: string;
  vendorContact: string;
  vendorPhone: string;
  coveredAssetsCount: number;
  assetNames: string[];
  startDate: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'Active' | 'Expiring Soon' | 'Expired';
  contractValue: string;
}

export interface ServiceVisit {
  id: string;
  amcCode: string;
  vendorName: string;
  visitDate: string;
  engineerName: string;
  scopeOfService: string;
  status: 'Scheduled' | 'Completed' | 'Pending Report';
  serviceRemarks?: string;
}

export interface CleaningTask {
  id: string;
  roomName: string;
  roomNumber: string;
  building: string;
  floor: string;
  roomType: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  scheduledTime: string;
  completedAt?: string;
  checklist: { id: string; label: string; done: boolean }[];
  photoUploaded?: boolean;
}

export interface SafetyInspection {
  id: string;
  title: string;
  location: string;
  inspectorName: string;
  dueDate: string;
  status: 'Scheduled' | 'Audit in Progress' | 'Action Required' | 'Passed';
  hazardCount: number;
  defects: string[];
  itemsChecked: number;
  totalItems: number;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  quantityOnHand: number;
  minThreshold: number;
  unit: string;
  binLocation: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  unitCost: string;
}

export interface MaterialRequest {
  id: string;
  requestCode: string;
  technicianName: string;
  department: string;
  ticketNumber: string;
  itemsList: { itemName: string; qty: number }[];
  status: 'Pending Approval' | 'Issued' | 'Rejected';
  requestedAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  campus: string;
  avatarInitials: string;
}

