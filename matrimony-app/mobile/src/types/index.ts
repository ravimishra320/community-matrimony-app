// Type definitions

export type AccountStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type MembershipTier = 'FREE' | 'PREMIUM' | 'GOLD';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type ConnectionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';

export interface User {
  userId: string;
  phoneNumber: string;
  accountStatus: AccountStatus;
  membershipTier: MembershipTier;
  createdAt: string;
}

export interface CommunityData {
  gotra: string;
  caste?: string;
  subCaste?: string;
  religion?: string;
  motherTongue?: string;
  [key: string]: any;
}

export interface Preferences {
  ageRange?: [number, number];
  heightRange?: [number, number];
  cities?: string[];
  education?: string[];
  [key: string]: any;
}

export interface Profile {
  profileId: string;
  userId: string;
  displayName: string;
  gender: Gender;
  dob: string;
  city?: string;
  state?: string;
  country: string;
  heightCm?: number;
  education?: string;
  occupation?: string;
  bio?: string;
  communityData: CommunityData;
  preferences: Preferences;
  photos: string[];
  isVerified: boolean;
  profileCompletion: number;
}

export interface VerificationTicket {
  ticketId: number;
  userId: string;
  idProofS3Key: string;
  selfieS3Key?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_INFO';
  adminNotes?: string;
}

export interface Connection {
  connectionId: string;
  initiatorId: string;
  receiverId: string;
  status: ConnectionStatus;
  createdAt: string;
}

export interface RecommendedProfile extends Profile {
  distance?: number;
  matchScore?: number;
}
