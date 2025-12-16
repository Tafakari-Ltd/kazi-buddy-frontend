// src/types/auth.types.ts

export interface RegisterFormData {
  [key: string]: any;
  profile_photo?: File;
  password?: string;
  confirm_password?: string;
}

export interface VerifyEmailData {
  user_id: string;
  otp_code: string;
}

export interface ApproveUserData {
  profile_photo?: File;
  username: string;
  phone_number: string;
  email: string;
  full_name: string;
  password: string;
  user_type: string;
}