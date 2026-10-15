// API client for Print-Fy authentication & student services
// Uses cookie-based authentication (Laravel Sanctum SPA mode)
// No auth tokens are stored in localStorage or sessionStorage.

import { DEMO_MODE } from './config';
import { QueueJob } from './queueOrder';
import { getMockQueue, mockChangeSlot } from '../mocks/queue';

/**
 * BACKEND TODOs:
 * The Laravel backend endpoints don't exist yet:
 *
 * Auth & Sanctum:
 * - GET /sanctum/csrf-cookie: Sets CSRF cookie (XSRF-TOKEN) before stateful actions.
 * - POST /login: Accepts { email, password }, establishes session cookie.
 * - POST /logout: Invalidates session cookie.
 * - GET /me: Returns authenticated student details { id, name, email, student_id, role, title? }.
 * - POST /me/password: Accepts { current_password, password, password_confirmation }.
 *
 * Queue & Desk Operations:
 * - GET /queue: Returns pre-sorted queue rows with 1-based sequential `position`.
 *   CRITICAL PRIVACY: The Laravel API must NEVER send other students' personal names,
 *   student IDs, avatar images, or file names. Only position, slot time, and generic status.
 * - POST /jobs/{id}/slot: Updates student arrival slot, recalculates queue positions,
 *   and returns { job, queue }. Client applies server response with NO optimistic reorder.
 * - POST /jobs/{id}/check-in: "I'm Here - Start My Print" button action at the desk.
 * - GET /desk: Returns desk status { printer_status?: string, notice?: string, location?: string }.
 *
 * University Forms:
 * - GET /forms: Returns list of official printable university forms.
 * - POST /forms/{id}/print-job: Dispatches selected form to print pipeline, returns { jobId }.
 *
 * Support:
 * - GET /my-jobs?limit=10: Returns current student's recent jobs for support ticket reference.
 * - POST /support-tickets: Accepts { topic, job_id?, message }. Backend must rate-limit and validate.
 * - DELETE /saved-documents: Deletes all saved documents for authenticated user.
 */

function getXsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  code: string;
}

export interface ResetPasswordPayload {
  reset_token: string;
  password: string;
  password_confirmation: string;
}

export interface UserProfile {
  id?: string | number;
  name: string;
  email: string;
  studentId?: string;
  role?: string;
  title?: string;
  initials?: string;
}

export interface DeskInfo {
  printerStatus?: string | null;
  notice?: string | null;
  location?: string | null;
  queueTrafficCount?: number;
  estimatedWaitMinutes?: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  user?: UserProfile;
  message?: string;
  reset_token?: string;
  errors?: Record<string, string[] | string>;
}

export const api = {
  async getCsrfCookie(): Promise<void> {
    try {
      await fetch('/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });
    } catch {
      // Backend endpoint may not be reached yet in local dev environment
    }
  },

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const xsrfToken = getXsrfToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (xsrfToken) {
      headers['X-XSRF-TOKEN'] = xsrfToken;
    }

    const res = await fetch(`/api${endpoint}`, {
      method: 'GET',
      credentials: 'include',
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const error: any = new Error(data?.message || 'Request failed');
      error.status = res.status;
      error.errors = data?.errors;
      throw error;
    }

    return data;
  },

  async post<T = any>(endpoint: string, payload: any): Promise<ApiResponse<T>> {
    const xsrfToken = getXsrfToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (xsrfToken) {
      headers['X-XSRF-TOKEN'] = xsrfToken;
    }

    const res = await fetch(`/api${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const error: any = new Error(data?.message || 'Request failed');
      error.status = res.status;
      error.errors = data?.errors;
      throw error;
    }

    return data;
  },

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const xsrfToken = getXsrfToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (xsrfToken) {
      headers['X-XSRF-TOKEN'] = xsrfToken;
    }

    const res = await fetch(`/api${endpoint}`, {
      method: 'DELETE',
      credentials: 'include',
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const error: any = new Error(data?.message || 'Delete failed');
      error.status = res.status;
      error.errors = data?.errors;
      throw error;
    }

    return data;
  },

  // -------------------------------------------------------------
  // Auth Services
  // -------------------------------------------------------------
  async login(payload: LoginPayload): Promise<ApiResponse> {
    await this.getCsrfCookie();
    return this.post('/login', payload);
  },

  async logout(): Promise<void> {
    if (DEMO_MODE) {
      return;
    }
    await this.getCsrfCookie();
    await this.post('/logout', {});
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse> {
    await this.getCsrfCookie();
    return this.post('/forgot-password', payload);
  },

  async verifyOtp(payload: VerifyOtpPayload): Promise<ApiResponse> {
    await this.getCsrfCookie();
    return this.post('/verify-otp', payload);
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse> {
    await this.getCsrfCookie();
    return this.post('/reset-password', payload);
  },

  async getMe(): Promise<UserProfile> {
    if (DEMO_MODE) {
      return {
        id: 'usr-101',
        name: 'Faiqa Arooj',
        email: 'faiqa@campus.edu',
        studentId: 'STU-884920',
        initials: 'FA',
        // role / title is omitted if backend does not send it
      };
    }
    const response = await this.get<UserProfile>('/me');
    const u = response.data || response.user;
    if (!u) throw new Error('User data not found');
    const initials = (u.name || '')
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
    return {
      ...u,
      initials: initials || 'U',
    };
  },

  // -------------------------------------------------------------
  // Queue Services
  // -------------------------------------------------------------
  async getQueue(userJob?: Partial<QueueJob> | null): Promise<QueueJob[]> {
    if (DEMO_MODE) {
      return getMockQueue(userJob);
    }
    // Real mode: Laravel returns queue pre-sorted by slot -> submitted_at -> id with `position`
    const res = await this.get<QueueJob[]>('/queue');
    return res.data || [];
  },

  async changeSlot(
    jobId: string | number,
    newSlot: string,
    userJob?: Partial<QueueJob> | null
  ): Promise<{ job: QueueJob; queue: QueueJob[] }> {
    if (DEMO_MODE) {
      return mockChangeSlot(jobId, newSlot, userJob);
    }
    // Real mode: Apply server response directly with no optimistic client reordering
    const res = await this.post<{ job: QueueJob; queue: QueueJob[] }>(`/jobs/${jobId}/slot`, {
      slot: newSlot,
    });
    if (!res.data) throw new Error('Invalid response from slot update endpoint');
    return res.data;
  },

  // TODO: The server must reject early arrival (e.g. 422 Unprocessable Entity) if canArrive is false or position > ARRIVAL_WINDOW_POSITION.
  async checkInAtDesk(
    jobId: string | number
  ): Promise<{ success: boolean; job: QueueJob; queue: QueueJob[] }> {
    if (DEMO_MODE) {
      const { mockCheckInAtDesk } = await import('../mocks/queue');
      return mockCheckInAtDesk(jobId);
    }
    const res = await this.post<{ success: boolean; job: QueueJob; queue: QueueJob[] }>(
      `/jobs/${jobId}/check-in`,
      {}
    );
    return res.data!;
  },

  async cancelJob(
    jobId: string | number
  ): Promise<{ success: boolean; message: string; queue?: QueueJob[] }> {
    if (DEMO_MODE) {
      const { mockCancelJob } = await import('../mocks/queue');
      return mockCancelJob(jobId);
    }
    const res = await this.post<{ success: boolean; message: string; queue?: QueueJob[] }>(
      `/jobs/${jobId}/cancel`,
      {}
    );
    return res.data!;
  },


  // -------------------------------------------------------------
  // University Forms
  // -------------------------------------------------------------
  async getForms() {
    if (DEMO_MODE) {
      const { sampleUniversityForms } = await import('../mocks/forms');
      return sampleUniversityForms;
    }
    const res = await this.get('/forms');
    return res.data || [];
  },

  async createFormPrintJob(formId: string | number) {
    if (DEMO_MODE) {
      return { jobId: `job-form-${Date.now()}` };
    }
    const res = await this.post(`/forms/${formId}/print-job`, {});
    return res.data;
  },

  // -------------------------------------------------------------
  // Desk Services
  // -------------------------------------------------------------
  async getDeskInfo(): Promise<DeskInfo> {
    if (DEMO_MODE) {
      const q = getMockQueue();
      const count = q.length;
      return {
        printerStatus: 'Online',
        notice: null, // Operator notice: shown in orange banner only when not null
        location: 'Central Library Desk A',
        deskName: 'Central Library · Desk A',
        queueTrafficCount: count,
        estimatedWaitMinutes: count > 0 ? count * 3 : 0,
      };
    }
    const res = await this.get<DeskInfo>('/desk');
    return res.data || {};
  },
};
