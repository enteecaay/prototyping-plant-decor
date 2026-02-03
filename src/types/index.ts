// User & Role Types
export enum UserRole {
  GUEST = 'guest',
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  SUPPORT_STAFF = 'support_staff',
  SHIPPER = 'shipper',
  CARETAKER = 'caretaker',
}

export interface User {
  id: string;
  email: string;
  password: string; // Mock only - DO NOT use in production
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  lastTokenRefresh: number;
}

// Plant Types
export interface PlantCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  category: PlantCategory;
  description: string;
  price: number;
  image: string;
  images?: string[];
  variants?: PlantVariant[];
  careInstructions: CareInstruction;
  stock: number;
  rating: number;
  reviewCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  wateringFrequency: string;
  sunlightRequirement: string;
  humidity: string;
  temperature: string;
  createdAt: Date;
  updatedAt: Date;
}

// Plant Variant - Individual plant instances with unique shapes (e.g., specific bonsai trees)
export interface PlantVariant {
  id: string;
  plantId: string;
  image: string; // Unique photo of this specific plant
  price: number;
  stock: 1; // Each variant is a unique individual plant, so stock is always 1
  isSold?: boolean; // Đã bán hay chưa
}

export interface CareInstruction {
  watering: string;
  sunlight: string;
  humidity: string;
  temperature: string;
  fertilizing: string;
  pruning: string;
  commonPests: string[];
  propagation: string;
}

// Customer Plant Instance (plants customer owns)
export interface PlantInstance {
  id: string;
  customerId: string;
  plantId: string;
  plantName: string;
  plantImage: string;
  location: string;
  purchaseDate: Date;
  quantity: number;
  lastCaredDate?: Date;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  careHistory: CareLog[];
  notes: string;
}

export interface CareLog {
  id: string;
  date: Date;
  action: string;
  notes: string;
  recordedBy: string; // Caretaker name or customer
}

// Order Types
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  shipperId?: string;
  shippingAddress: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
  deliveryDate?: Date;
  trackingNumber?: string;
}

export interface OrderItem {
  id: string;
  plantId: string;
  plantName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

// Care Service Types
export enum CareServiceStatus {
  PENDING = 'pending',                    // Chờ xác nhận
  CONFIRMED = 'confirmed',                // Đã xác nhận (sau khi gọi điện)
  ASSIGNED = 'assigned',                  // Đã phân công
  IN_PROGRESS = 'in_progress',           // Đang thực hiện
  COMPLETED = 'completed',                // Hoàn thành
  CANCELLED = 'cancelled',
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",                // Đã hủy
}

// Service Package Types
export enum ServicePackageType {
  PLANT_DOCTOR = 'plant_doctor',          // Gói Bác sĩ Cây xanh
  PLANT_SPA = 'plant_spa',                // Gói Spa Cây cảnh
  CONSULTATION_SETUP = 'consultation',     // Gói Tư vấn & Setup
}

export interface CarePackage {
  id: string;
  name: string;
  type: ServicePackageType;
  description: string;
  price: number;
  duration: number; // hours
  services: string[];
  createdAt: Date;
}

// Service Progress Log
export interface ServiceProgressLog {
  id: string;
  serviceRequestId: string;
  caretakerId: string;
  caretakerName: string;
  action: string;
  description: string;
  photos?: string[];
  timestamp: Date;
}

// Add-on Service (Phát sinh)
export interface AddOnService {
  id: string;
  serviceRequestId: string;
  name: string;
  description: string;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  suggestedBy: string;
  approvedAt?: Date;
  createdAt: Date;
}

export interface CareServiceRequest {
  id: string;
  // Customer Info
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  workAddress?: string;  // Địa chỉ làm việc (khác địa chỉ nhà)
  
  // Service Info
  packageId: string;
  packageName: string;
  packageType: ServicePackageType;
  plantIds: string[];
  plantNames: string[];
  
  // Status
  status: CareServiceStatus;
  
  // Scheduling
  scheduledDate: Date;           // Ngày hẹn (tối thiểu 48-72h từ thời điểm đặt)
  estimatedCompletionDate?: Date;
  actualCompletionDate?: Date;
  
  // Assignment - QUAN TRỌNG cho logic Handover
  mainCaretakerId?: string;      // Người chịu trách nhiệm chính (không đổi)
  mainCaretakerName?: string;
  currentCaretakerId?: string;   // Người đang thực hiện (có thể thay đổi)
  currentCaretakerName?: string;
  
  // Staff
  confirmedBy?: string;          // Admin/Support đã xác nhận
  confirmedAt?: Date;
  
  // Progress
  checkInTime?: Date;            // Thời gian Caretaker check-in
  checkOutTime?: Date;           // Thời gian hoàn thành
  progressLogs: ServiceProgressLog[];
  addOnServices: AddOnService[];
  
  // Financials
  basePrice: number;
  addOnTotal: number;
  totalPrice: number;
  
  // Notes
  customerNotes?: string;
  internalNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Caretaker Availability
export enum CaretakerStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  ON_LEAVE = 'on_leave',
  BUFFER = 'buffer',  // Thời gian đệm sau hoàn thành (~30 phút)
}

export interface CaretakerInfo {
  userId: string;
  name: string;
  phone: string;
  skills: ServicePackageType[];
  status: CaretakerStatus;
  currentTaskId?: string;
  lastTaskCompletedAt?: Date;
}

export interface CareServiceSession {
  id: string;
  serviceRequestId: string;
  caretakerId: string;
  caretakerName: string;
  plantInstanceId: string;
  plantName: string;
  scheduledDate: Date;
  completedDate?: Date;
  tasks: string[];
  observations: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  photos?: string[];
  createdAt: Date;
}

// Support Ticket (Để lại lời nhắn khi không có nhân viên)
export interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Material Types
export interface Material {
  id: string;
  name: string;
  type: 'pot' | 'soil' | 'fertilizer' | 'pesticide' | 'tool' | 'other';
  description: string;
  price: number;
  stock: number;
  image?: string;
  createdAt: Date;
}

// Shipper Types
export interface Shipment {
  id: string;
  orderId: string;
  shipperId: string;
  shipperName: string;
  currentStatus: OrderStatus;
  location: string;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Staff Schedule Types
export interface StaffSchedule {
  id: string;
  staffId: string;
  staffName: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'shift' | 'day-off' | 'training';
  notes?: string;
}

// Dashboard Analytics
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  totalCustomers: number;
  totalPlants: number;
  activeCareServices: number;
  completedCareServices: number;
}

// Wishlist
export interface Wishlist {
  id: string;
  customerId: string;
  plants: Plant[];
  createdAt: Date;
  updatedAt: Date;
}

// Shopping Cart
export interface CartItem {
  plantId: string;
  variantId?: string; // Selected variant if plant has variants
  quantity: number;
  plant?: Plant;
  variant?: PlantVariant;
}

export interface ShoppingCart {
  customerId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Review Types
export interface PlantReview {
  id: string;
  plantId: string;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: Date;
}

export interface CareServiceReview {
  id: string;
  serviceRequestId: string;
  customerId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

// Chat Types
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: ChatMessage;
  updatedAt: Date;
}

// AI Recommendation (Future feature)
export interface AIRecommendation {
  id: string;
  customerId: string;
  roomImage: string;
  recommendedPlants: string[];
  layoutDesign: string;
  createdAt: Date;
}

// Token Tracking (Zustand subscription)
export interface TokenTrackingState {
  token: string | null;
  expiresAt: number | null;
  refreshedAt: number;
  subscribers: Set<(token: string | null) => void>;
}
