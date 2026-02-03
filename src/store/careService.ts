import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CareServiceRequest,
  CareServiceStatus,
  ServicePackageType,
  ServiceProgressLog,
  AddOnService,
  CaretakerInfo,
  CaretakerStatus,
} from '@/types';
import { MOCK_CARE_SERVICE_REQUESTS, MOCK_CARETAKERS } from '@/mock-data';

interface CareServiceStore {
  requests: CareServiceRequest[];
  caretakers: CaretakerInfo[];

  // Customer Actions
  createRequest: (request: Omit<CareServiceRequest, 'id' | 'createdAt' | 'updatedAt' | 'progressLogs' | 'addOnServices'>) => CareServiceRequest;
  
  // Support/Admin Actions
  confirmRequest: (requestId: string, confirmedBy: string) => void;
  assignCaretaker: (requestId: string, caretakerId: string, caretakerName: string) => void;
  cancelRequest: (requestId: string) => void;
  
  // Caretaker Actions
  checkIn: (requestId: string, caretakerId: string, caretakerName: string) => void;
  addProgressLog: (requestId: string, log: Omit<ServiceProgressLog, 'id' | 'timestamp'>) => void;
  updateEstimatedCompletion: (requestId: string, date: Date) => void;
  completeService: (requestId: string) => void;
  
  // Add-on Services
  suggestAddOn: (requestId: string, addOn: Omit<AddOnService, 'id' | 'createdAt' | 'status'>) => void;
  approveAddOn: (requestId: string, addOnId: string) => void;
  rejectAddOn: (requestId: string, addOnId: string) => void;
  
  // Handover Logic
  handoverToCaretaker: (requestId: string, newCaretakerId: string, newCaretakerName: string) => void;
  reclaimTask: (requestId: string, mainCaretakerId: string) => void;
  
  // Caretaker Status
  updateCaretakerStatus: (caretakerId: string, status: CaretakerStatus) => void;
  getAvailableCaretakers: (packageType?: ServicePackageType) => CaretakerInfo[];
  
  // Getters
  getRequestById: (id: string) => CareServiceRequest | undefined;
  getRequestsByCustomer: (customerId: string) => CareServiceRequest[];
  getRequestsByStatus: (status: CareServiceStatus) => CareServiceRequest[];
  getRequestsByCaretaker: (caretakerId: string) => CareServiceRequest[];
  getPendingRequests: () => CareServiceRequest[];
  getActiveRequests: () => CareServiceRequest[];
}

export const useCareServiceStore = create<CareServiceStore>()(
  persist(
    (set, get) => ({
      requests: MOCK_CARE_SERVICE_REQUESTS,
      caretakers: MOCK_CARETAKERS,

      createRequest: (requestData) => {
        const newRequest: CareServiceRequest = {
          ...requestData,
          id: `service-${Date.now()}`,
          progressLogs: [],
          addOnServices: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          requests: [...state.requests, newRequest],
        }));

        return newRequest;
      },

      confirmRequest: (requestId, confirmedBy) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  status: CareServiceStatus.CONFIRMED,
                  confirmedBy,
                  confirmedAt: new Date(),
                  updatedAt: new Date(),
                }
              : r
          ),
        }));
      },

      assignCaretaker: (requestId, caretakerId, caretakerName) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  status: CareServiceStatus.ASSIGNED,
                  mainCaretakerId: caretakerId,
                  mainCaretakerName: caretakerName,
                  currentCaretakerId: caretakerId,
                  currentCaretakerName: caretakerName,
                  updatedAt: new Date(),
                }
              : r
          ),
        }));
      },

      cancelRequest: (requestId) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  status: CareServiceStatus.CANCELLED,
                  updatedAt: new Date(),
                }
              : r
          ),
        }));
      },

      checkIn: (requestId, caretakerId, caretakerName) => {
        const log: ServiceProgressLog = {
          id: `log-${Date.now()}`,
          serviceRequestId: requestId,
          caretakerId,
          caretakerName,
          action: 'Check-in',
          description: 'Đã đến địa điểm, bắt đầu công việc',
          timestamp: new Date(),
        };

        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  status: CareServiceStatus.IN_PROGRESS,
                  checkInTime: new Date(),
                  progressLogs: [...r.progressLogs, log],
                  updatedAt: new Date(),
                }
              : r
          ),
        }));
      },

      addProgressLog: (requestId, logData) => {
        const log: ServiceProgressLog = {
          ...logData,
          id: `log-${Date.now()}`,
          serviceRequestId: requestId,
          timestamp: new Date(),
        };

        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  progressLogs: [...r.progressLogs, log],
                  updatedAt: new Date(),
                }
              : r
          ),
        }));
      },

      updateEstimatedCompletion: (requestId, date) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  estimatedCompletionDate: date,
                  updatedAt: new Date(),
                }
              : r
          ),
        }));
      },

      completeService: (requestId) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  status: CareServiceStatus.COMPLETED,
                  checkOutTime: new Date(),
                  actualCompletionDate: new Date(),
                  updatedAt: new Date(),
                }
              : r
          ),
        }));

        // Set caretaker to buffer status
        const request = get().requests.find((r) => r.id === requestId);
        if (request?.currentCaretakerId) {
          get().updateCaretakerStatus(request.currentCaretakerId, CaretakerStatus.BUFFER);
          
          // After 30 mins buffer, set to available
          setTimeout(() => {
            get().updateCaretakerStatus(request.currentCaretakerId!, CaretakerStatus.AVAILABLE);
          }, 30 * 60 * 1000);
        }
      },

      suggestAddOn: (requestId, addOnData) => {
        const addOn: AddOnService = {
          ...addOnData,
          id: `addon-${Date.now()}`,
          serviceRequestId: requestId,
          status: 'pending',
          createdAt: new Date(),
        };

        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  addOnServices: [...r.addOnServices, addOn],
                  updatedAt: new Date(),
                }
              : r
          ),
        }));
      },

      approveAddOn: (requestId, addOnId) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  addOnServices: r.addOnServices.map((a) =>
                    a.id === addOnId
                      ? { ...a, status: 'approved' as const, approvedAt: new Date() }
                      : a
                  ),
                  addOnTotal: r.addOnServices
                    .filter((a) => a.id === addOnId || a.status === 'approved')
                    .reduce((sum, a) => sum + a.price, 0),
                  totalPrice:
                    r.basePrice +
                    r.addOnServices
                      .filter((a) => a.id === addOnId || a.status === 'approved')
                      .reduce((sum, a) => sum + a.price, 0),
                  updatedAt: new Date(),
                }
              : r
          ),
        }));
      },

      rejectAddOn: (requestId, addOnId) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  addOnServices: r.addOnServices.map((a) =>
                    a.id === addOnId ? { ...a, status: 'rejected' as const } : a
                  ),
                  updatedAt: new Date(),
                }
              : r
          ),
        }));
      },

      // Handover Logic - Chuyển quyền cho người khác
      handoverToCaretaker: (requestId, newCaretakerId, newCaretakerName) => {
        const request = get().requests.find((r) => r.id === requestId);
        if (!request) return;

        const log: ServiceProgressLog = {
          id: `log-${Date.now()}`,
          serviceRequestId: requestId,
          caretakerId: newCaretakerId,
          caretakerName: newCaretakerName,
          action: 'Handover',
          description: `Công việc được chuyển giao từ ${request.currentCaretakerName} cho ${newCaretakerName}`,
          timestamp: new Date(),
        };

        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  currentCaretakerId: newCaretakerId,
                  currentCaretakerName: newCaretakerName,
                  progressLogs: [...r.progressLogs, log],
                  updatedAt: new Date(),
                }
              : r
          ),
        }));
      },

      // Reclaim Logic - Thu hồi quyền
      reclaimTask: (requestId, mainCaretakerId) => {
        const request = get().requests.find((r) => r.id === requestId);
        if (!request || request.mainCaretakerId !== mainCaretakerId) return;

        const log: ServiceProgressLog = {
          id: `log-${Date.now()}`,
          serviceRequestId: requestId,
          caretakerId: mainCaretakerId,
          caretakerName: request.mainCaretakerName || '',
          action: 'Reclaim',
          description: `${request.mainCaretakerName} đã thu hồi quyền từ ${request.currentCaretakerName}`,
          timestamp: new Date(),
        };

        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  currentCaretakerId: mainCaretakerId,
                  currentCaretakerName: request.mainCaretakerName,
                  progressLogs: [...r.progressLogs, log],
                  updatedAt: new Date(),
                }
              : r
          ),
        }));
      },

      updateCaretakerStatus: (caretakerId, status) => {
        set((state) => ({
          caretakers: state.caretakers.map((c) =>
            c.userId === caretakerId ? { ...c, status } : c
          ),
        }));
      },

      getAvailableCaretakers: (packageType) => {
        return get().caretakers.filter(
          (c) =>
            c.status === CaretakerStatus.AVAILABLE &&
            (!packageType || c.skills.includes(packageType))
        );
      },

      getRequestById: (id) => {
        return get().requests.find((r) => r.id === id);
      },

      getRequestsByCustomer: (customerId) => {
        return get().requests.filter((r) => r.customerId === customerId);
      },

      getRequestsByStatus: (status) => {
        return get().requests.filter((r) => r.status === status);
      },

      getRequestsByCaretaker: (caretakerId) => {
        return get().requests.filter(
          (r) =>
            r.currentCaretakerId === caretakerId ||
            r.mainCaretakerId === caretakerId
        );
      },

      getPendingRequests: () => {
        return get().requests.filter(
          (r) =>
            r.status === CareServiceStatus.PENDING ||
            r.status === CareServiceStatus.CONFIRMED
        );
      },

      getActiveRequests: () => {
        return get().requests.filter(
          (r) =>
            r.status === CareServiceStatus.ASSIGNED ||
            r.status === CareServiceStatus.IN_PROGRESS
        );
      },
    }),
    {
      name: 'plant-decor-care-service',
    }
  )
);
