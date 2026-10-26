// API client for Print-Fy authentication & student services
// Uses cookie-based authentication (Laravel Sanctum SPA mode)
// No auth tokens are stored in localStorage or sessionStorage.

import { DEMO_MODE } from './config';
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

function getXsrfToken() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export const api = {
  async getCsrfCookie() {
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

  async get(endpoint) {
    const xsrfToken = getXsrfToken();
    const headers = {
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
      const error = new Error(data?.message || 'Request failed');
      error.status = res.status;
      error.errors = data?.errors;
      throw error;
    }

    return data;
  },

  async post(endpoint, payload) {
    const xsrfToken = getXsrfToken();
    const headers = {
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
      const error = new Error(data?.message || 'Request failed');
      error.status = res.status;
      error.errors = data?.errors;
      throw error;
    }

    return data;
  },

  async delete(endpoint) {
    const xsrfToken = getXsrfToken();
    const headers = {
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
      const error = new Error(data?.message || 'Delete failed');
      error.status = res.status;
      error.errors = data?.errors;
      throw error;
    }

    return data;
  },

  // -------------------------------------------------------------
  // Auth Services
  // -------------------------------------------------------------
  async login(payload) {
    if (DEMO_MODE) {
      const email = String(payload?.email || '').trim().toLowerCase();
      const isOperator = email.includes('operator');
      const user = {
        id: isOperator ? 'op-101' : 'usr-101',
        name: isOperator ? 'Print Desk Operator' : 'Faiqa Arooj',
        email: payload?.email || (isOperator ? 'operator@campus.edu' : 'faiqa@campus.edu'),
        studentId: isOperator ? undefined : 'STU-884920',
        role: isOperator ? 'operator' : 'student',
        initials: isOperator ? 'OP' : 'FA',
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('printfy_current_user', JSON.stringify(user));
          localStorage.setItem('printfy_user_role', user.role);
        } catch {
          // ignore local storage errors in demo mode
        }
      }
      return { user };
    }
    await this.getCsrfCookie();
    return this.post('/login', payload);
  },

  async logout() {
    if (DEMO_MODE) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('printfy_current_user');
          localStorage.removeItem('printfy_user_role');
        } catch {
          // ignore local storage errors in demo mode
        }
      }
      return;
    }
    await this.getCsrfCookie();
    await this.post('/logout', {});
  },

  async forgotPassword(payload) {
    await this.getCsrfCookie();
    return this.post('/forgot-password', payload);
  },

  async verifyOtp(payload) {
    await this.getCsrfCookie();
    return this.post('/verify-otp', payload);
  },

  async resetPassword(payload) {
    await this.getCsrfCookie();
    return this.post('/reset-password', payload);
  },

  async getMe() {
    if (DEMO_MODE) {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('printfy_current_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.role) return parsed;
          }
        } catch {
          // ignore parse errors
        }
      }
      return {
        id: 'usr-101',
        name: 'Faiqa Arooj',
        email: 'faiqa@campus.edu',
        studentId: 'STU-884920',
        initials: 'FA',
        role: 'student',
      };
    }
    const response = await this.get('/me');
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
  async getQueue(userJob = null) {
    if (DEMO_MODE) {
      return getMockQueue(userJob);
    }
    const res = await this.get('/queue');
    return res.data || [];
  },

  async changeSlot(jobId, newSlot, userJob = null) {
    if (DEMO_MODE) {
      return mockChangeSlot(jobId, newSlot, userJob);
    }
    const res = await this.post(`/jobs/${jobId}/slot`, {
      slot: newSlot,
    });
    if (!res.data) throw new Error('Invalid response from slot update endpoint');
    return res.data;
  },

  // TODO: The server must reject early arrival (e.g. 422 Unprocessable Entity) if canArrive is false or position > ARRIVAL_WINDOW_POSITION.
  async checkInAtDesk(jobId) {
    if (DEMO_MODE) {
      const { mockCheckInAtDesk } = await import('../mocks/queue');
      return mockCheckInAtDesk(jobId);
    }
    const res = await this.post(`/jobs/${jobId}/check-in`, {});
    return res.data;
  },

  async cancelJob(jobId) {
    if (DEMO_MODE) {
      const { mockCancelJob } = await import('../mocks/queue');
      return mockCancelJob(jobId);
    }
    const res = await this.post(`/jobs/${jobId}/cancel`, {});
    return res.data;
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

  async createFormPrintJob(formId) {
    if (DEMO_MODE) {
      return { jobId: `job-form-${Date.now()}` };
    }
    const res = await this.post(`/forms/${formId}/print-job`, {});
    return res.data;
  },

  // -------------------------------------------------------------
  // Desk Services
  // -------------------------------------------------------------
  async getDeskInfo() {
    if (DEMO_MODE) {
      const q = getMockQueue();
      const count = q.length;
      return {
        printerStatus: 'Online',
        notice: null,
        location: 'Central Library Desk A',
        deskName: 'Central Library · Desk A',
        queueTrafficCount: count,
        estimatedWaitMinutes: count > 0 ? count * 3 : 0,
      };
    }
    const res = await this.get('/desk');
    return res.data || {};
  },

  // -------------------------------------------------------------
  // AI Print Studio & Hackathon Copilot
  // -------------------------------------------------------------
  async analyzeDocument(params) {
    const res = await this.post('/ai/analyze-document', {
      file_name: params.fileName,
      pages: params.pages,
      color_mode: params.colorMode || 'B&W',
      duplex: params.duplex || 'Single-sided',
    });
    return res.data;
  },

  async askStudyCopilot(prompt, contextFile) {
    const res = await this.post('/ai/study-copilot', {
      prompt,
      context_file: contextFile || 'Document.pdf',
    });
    return res.data;
  },

  async getRushPrediction() {
    const res = await this.get('/ai/rush-prediction');
    return res.data;
  },
};
