import { apiClient } from './client';
import { Profile, User, RecommendedProfile, VerificationTicket } from '../types';

export const api = {
  // Auth endpoints
  auth: {
    register: (phoneNumber: string) => 
      apiClient.post('/auth/register', { phoneNumber }),
    
    verifyOtp: (phoneNumber: string, code: string) =>
      apiClient.post('/auth/verify-otp', { phoneNumber, code }),
  },

  // Profile endpoints
  profile: {
    getMe: () => 
      apiClient.get<Profile>('/profile/me'),
    
    updateMe: (data: Partial<Profile>) =>
      apiClient.put<Profile>('/profile/me', data),
    
    getById: (profileId: string) =>
      apiClient.get<Profile>(`/profile/${profileId}`),
  },

  // Recommendations
  recommendations: {
    get: (limit: number = 10) =>
      apiClient.get<RecommendedProfile[]>('/recommendations', { params: { limit } }),
    
    swipe: (targetUserId: string, action: 'PASS' | 'CONNECT') =>
      apiClient.post('/recommendations/swipe', { targetUserId, action }),
  },

  // Upload
  upload: {
    getPresignedUrl: (fileType: string, purpose: 'PHOTO' | 'ID_PROOF') =>
      apiClient.post<{ uploadUrl: string; key: string }>('/upload/presigned-url', {
        fileType,
        purpose,
      }),
  },

  // Verification
  verification: {
    getStatus: () =>
      apiClient.get<VerificationTicket>('/verification/status'),
    
    submit: (idProofKey: string, selfieKey?: string) =>
      apiClient.post('/verification/submit', { idProofKey, selfieKey }),
  },

  // Connections
  connections: {
    list: () =>
      apiClient.get('/connections'),
    
    accept: (connectionId: string) =>
      apiClient.post(`/connections/${connectionId}/accept`),
    
    reject: (connectionId: string) =>
      apiClient.post(`/connections/${connectionId}/reject`),
  },
};
