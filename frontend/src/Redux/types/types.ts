export interface WorkerData {
    profile_photo_url?: string;
    username: string;
    phone_number: string;
    email: string;
    full_name: string;
    user_type?: string;
}

export interface WorkerState {
    worker: WorkerData | null;
    loading: boolean;
    error: string | null;
    successMessage: string | null;
    verified: boolean;
}

export interface RegisterFormData {
    profile_photo?: File;
    username: string;
    phone_number: string;
    email: string;
    full_name: string;
    password: string;
    user_type: string;
}

export interface VerifyEmailData {
    user_id: string;
    otp_code: string;
}