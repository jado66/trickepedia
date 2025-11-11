// Centralized types for Gym Management domain
// These mirror (and unify) the interfaces that were previously defined individually
// inside each component under components/gym-management/*

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** ISO date string (yyyy-mm-dd) representing the member's date of birth */
  birthDate?: string;
  membershipType: string;
  status: "active" | "inactive" | "suspended";
  joinDate: string; // ISO date string
  lastVisit: string; // human or ISO
  emergencyContact: string;
  medicalNotes: string;
  avatar?: string;
  /** Optionally we may cache a computed age (years); prefer computing on the fly when possible */
  ageYears?: number;
}

export interface ClassItem {
  id: string;
  name: string;
  /** One or more instructor/teacher display names. */
  instructors: string[];
  time: string; // e.g. "9:00 AM - 10:30 AM"
  capacity: number;
  enrolled: number;
  location: string;
  level: string;
  status: string;
  description?: string;
  duration: number; // minutes
  price: number; // currency value
  ageRange: string;
  // Optional list of specific dates (ISO yyyy-mm-dd) when this class occurs
  dates?: string[];
  // Optional list of student member IDs enrolled in the class
  students?: string[];
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  location: string;
  status: "excellent" | "good" | "needs-maintenance" | "out-of-service";
  lastInspection: string; // ISO date
  nextInspection: string; // ISO date
  purchaseDate: string; // ISO date
  warranty: string; // ISO date or label
  notes: string;
}

export interface IncidentItem {
  id: string;
  memberName: string;
  incidentType: string;
  severity: "minor" | "moderate" | "serious";
  status: "reported" | "investigating" | "resolved";
  dateTime: string; // ISO datetime
  location: string;
  description: string;
  injuryDetails?: string;
  witnessName?: string;
  staffMember: string;
  actionTaken: string;
  followUpRequired: boolean;
  parentNotified?: boolean;
}

export interface WaiverItem {
  id: string;
  memberName: string;
  memberEmail: string;
  waiverType: string;
  status: "signed" | "pending" | "expired";
  signedDate?: string;
  expiryDate: string;
  guardianName?: string;
  guardianSignature?: boolean;
  notes: string;
  archived?: boolean; // soft-delete indicator
}

export interface StaffMemberItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  specialties: string[];
  status: string;
  schedule: string; // e.g. "9:00 AM - 5:00 PM"
  classes: number;
  hourlyRate: number;
  certifications: string[];
  emergencyContact: string;
  archived?: boolean; // soft-delete indicator
}

export interface PaymentItem {
  id: string;
  member: string;
  amount: string; // Keep as formatted string for now
  type: string; // e.g. Monthly Membership
  status: "paid" | "pending" | "overdue";
  date: string; // ISO date
  method: string;
}

// Membership plan definition (distinct from individual member records)
export interface MembershipPlan {
  id: string;
  name: string; // Display name (e.g. "Premium Gymnastics")
  price: number; // Price in currency units (raw number, format in UI)
  billingInterval: "monthly" | "yearly" | "session" | "one-time";
  description?: string;
  status: "active" | "inactive";
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export interface DemoLimits {
  classes: number;
  members: number;
  equipment: number;
  incidents: number;
  waivers: number;
  staff: number;
  payments: number;
  membershipPlans: number; // newly added limit
}

export interface OperationResult<T> {
  success: boolean;
  item?: T;
  error?: string;
}
