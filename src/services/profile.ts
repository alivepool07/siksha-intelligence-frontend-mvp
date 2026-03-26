import { api } from "@/lib/axios";
import type {
  UserProfileUpdateDTO,
  UserProfileDTO,
  ComprehensiveUserProfileResponseDTO,
  AddressDTO,
  StudentMedicalRecordDTO,
  StudentMedicalAllergyDTO,
  GuardianProfileDTO,
} from "./types/profile";
import type {
  ImageUploadInitRequest,
  ImageUploadInstruction,
  ImageUploadCompleteRequest
} from './types/media';

// ── Profile Service ──────────────────────────────────────────────────

export const profileService = {
  /** GET /profile/me */
  getMyProfile() {
    return api.get<ComprehensiveUserProfileResponseDTO>("/profile/me");
  },

  /** PUT /profile/me */
  updateMyProfile(data: UserProfileUpdateDTO) {
    return api.put<UserProfileDTO>("/profile/me", data);
  },

  // --- Profile Image Upload ---
  initProfileImageUpload(data: ImageUploadInitRequest) {
    return api.post<ImageUploadInstruction>('/profile/me/image/upload-init', data);
  },

  completeProfileImageUpload(data: ImageUploadCompleteRequest) {
    return api.post<UserProfileDTO>('/profile/me/image/upload-complete', data);
  },

  /** GET /profile/:userId (admin) */
  getProfileByUserId(userId: number) {
    return api.get<ComprehensiveUserProfileResponseDTO>(`/profile/${userId}`);
  },

  /** PUT /profile/:userId (admin) */
  updateProfileByUserId(userId: number, data: UserProfileUpdateDTO) {
    return api.put<UserProfileDTO>(`/profile/${userId}`, data);
  },

  // ── Address CRUD ───────────────────────────────────────────────────

  /** POST /profile/me/addresses */
  createMyAddress(data: AddressDTO) {
    return api.post<AddressDTO>("/profile/me/addresses", data);
  },

  /** PUT /profile/me/addresses/:id */
  updateMyAddress(id: number, data: AddressDTO) {
    return api.put<AddressDTO>(`/profile/me/addresses/${id}`, data);
  },

  /** DELETE /profile/me/addresses/:id */
  deleteMyAddress(id: number) {
    return api.delete<void>(`/profile/me/addresses/${id}`);
  },

  // ── Medical Records ────────────────────────────────────────────────

  /** PUT /profile/me/medical */
  updateMyMedical(data: StudentMedicalRecordDTO) {
    return api.put<StudentMedicalRecordDTO>("/profile/me/medical", data);
  },

  /** GET /profile/me/medical */
  getMyMedicalRecord() {
    return api.get<StudentMedicalRecordDTO>("/profile/me/medical");
  },

  /** POST /profile/me/medical (create) */
  createMyMedical(data: StudentMedicalRecordDTO) {
    return api.post<StudentMedicalRecordDTO>("/profile/me/medical", data);
  },

  /** POST /profile/me/medical/allergies */
  addMyAllergy(data: StudentMedicalAllergyDTO) {
    return api.post<StudentMedicalAllergyDTO>("/profile/me/medical/allergies", data);
  },

  /** DELETE /profile/me/medical/allergies/:id */
  deleteMyAllergy(id: number) {
    return api.delete<void>(`/profile/me/medical/allergies/${id}`);
  },

  // ── Guardian (View Only) ───────────────────────────────────────────

  /** GET /profile/me/guardians */
  getMyGuardians() {
    return api.get<GuardianProfileDTO[]>("/profile/me/guardians");
  },
};

