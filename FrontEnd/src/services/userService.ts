import api from './api';

export interface UserProfile {
  id: string;
  username: string;
  roles: string[];
  activeRole: string;
  profilePhoto: string;
  fullName: string;
  dateOfBirth: string | null;
  gender: 'Male' | 'Female' | 'Prefer not to say';
  phoneNumber: string;
  isEmailVerified: boolean;
}

export interface UpdateProfilePayload {
  fullName?: string;
  dateOfBirth?: string | null;
  gender?: 'Male' | 'Female' | 'Prefer not to say';
  phoneNumber?: string;
}

export const userService = {
  /** GET /api/users/me — full profile for the logged-in user */
  getMe: () => api.get<{ success: boolean; data: UserProfile }>('/users/me'),

  /** PUT /api/users/me — update bio fields (name, dob, gender, phone) */
  updateProfile: (data: UpdateProfilePayload) =>
    api.put<{ success: boolean; data: UserProfile }>('/users/me', data),

  /** PUT /api/users/me/photo — accepts a public URL or base64 data URI */
  updatePhoto: (photoUrl: string) =>
    api.put<{ success: boolean; data: UserProfile }>('/users/me/photo', { photoUrl }),
};
