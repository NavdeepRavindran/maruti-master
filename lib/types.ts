// Database types matching Supabase schema

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: "Agent" | "Client";
  phone?: string;
  created_at: string;
}

export interface Client {
  id: string;
  agent_id: string;
  name: string;
  surname?: string;
  alternateMobile?: string;
  anniversaryDate?: string;
  gender?: "Male" | "Female" | "Other" | "Prefer not to say";
  maritalStatus?: "Single" | "Married" | "Divorced" | "Widowed";
  occupation?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  notes?: string;
  clientLoginId?: string;
  temporaryPassword?: string;
  isAnniversaryWished?: boolean;
  phone: string;
  email?: string;
  date_of_birth: string;
  address?: string;
  status: "Active" | "Pending" | "Inactive";
  login_email?: string;
  login_password_hash?: string;
  created_at: string;
  updated_at: string;
  // Computed/joined fields
  family_count?: number;
  document_count?: number;
}

export interface FamilyMember {
  id: string;
  client_id: string;
  name: string;
  date_of_birth: string;
  relationship: string;
  phone?: string;
  created_at: string;
}

export interface Document {
  id: string;
  client_id: string;
  family_member_id?: string | null;
  name: string;
  category?: "policy" | "kyc" | "claims" | "other";
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

export interface BirthdayEntry {
  name: string;
  date_of_birth: string;
  relationship: string;
  phone?: string;
  client_name?: string;
  client_id: string;
  family_member_id?: string;
  type: "client" | "family_member";
}

export interface AnniversaryEntry {
  name: string;
  anniversaryDate: string;
  relationship: string;
  phone?: string;
  client_name?: string;
  client_id: string;
  type: "client";
}

export interface BirthdayWish {
  id: string;
  recipient_name: string;
  recipient_type: "client" | "family_member";
  recipient_id: string;
  sent_at: string;
  message: string;
  sent_by: string;
}
