import { UserRole } from './userManagementService';
import { apiClient } from '../api-client';

// Invitation Types
export interface UserInvitation {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  department_id: string;
  department_name?: string;
  invited_by: string;
  invited_by_name?: string;
  invitation_token: string;
  status: InvitationStatus;
  expires_at: Date;
  sent_at: Date;
  accepted_at?: Date;
  declined_at?: Date;
  reminder_count: number;
  last_reminder_sent?: Date;
  custom_message?: string;
  onboarding_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export enum InvitationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export interface CreateInvitationRequest {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  department_id: string;
  custom_message?: string;
  expires_in_days?: number;
}

export interface BulkInvitationRequest {
  invitations: CreateInvitationRequest[];
  send_immediately?: boolean;
}

export interface InvitationResponse {
  invitation: UserInvitation;
  invitation_url: string;
}

export interface BulkInvitationResponse {
  successful: InvitationResponse[];
  failed: {
    invitation: CreateInvitationRequest;
    error: string;
  }[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface AcceptInvitationRequest {
  token: string;
  password: string;
  confirm_password: string;
  phone?: string;
  profile_picture?: File;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  theme: 'light' | 'dark' | 'auto';
}



export interface InvitationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  is_default: boolean;
  created_by: string;
  created_at: Date;
}

export interface InvitationStats {
  total_sent: number;
  pending: number;
  accepted: number;
  declined: number;
  expired: number;
  acceptance_rate: number;
  average_response_time: number; // in hours
  by_role: Record<UserRole, {
    sent: number;
    accepted: number;
    acceptance_rate: number;
  }>;
  by_department: Record<string, {
    sent: number;
    accepted: number;
    acceptance_rate: number;
  }>;
}



class InvitationService {
  // Create single invitation
  async createInvitation(request: CreateInvitationRequest): Promise<InvitationResponse> {
    try {
      const response = await apiClient.post('/invitations', request);
      return response.data;
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      throw new Error(error.response?.data?.message || 'Failed to create invitation');
    }
  }

  // Create bulk invitations
  async createBulkInvitations(request: BulkInvitationRequest): Promise<BulkInvitationResponse> {
    try {
      const response = await apiClient.post('/invitations/bulk', request);
      return response.data;
    } catch (error: any) {
      console.error('Error creating bulk invitations:', error);
      throw new Error(error.response?.data?.message || 'Failed to create bulk invitations');
    }
  }

  // Get all invitations with filtering
  async getInvitations(params?: {
    status?: InvitationStatus;
    role?: UserRole;
    department_id?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<{
    invitations: UserInvitation[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> {
    try {
      const response = await apiClient.get('/invitations', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch invitations');
    }
  }

  // Get invitation by ID
  async getInvitation(id: string): Promise<UserInvitation> {
    try {
      const response = await apiClient.get(`/invitations/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching invitation:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch invitation');
    }
  }

  // Get invitation by token (for public access)
  async getInvitationByToken(token: string): Promise<UserInvitation> {
    try {
      const response = await apiClient.get(`/invitations/token/${token}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching invitation by token:', error);
      throw new Error(error.response?.data?.message || 'Invalid or expired invitation');
    }
  }

  // Send invitation email
  async sendInvitation(id: string): Promise<void> {
    try {
      await apiClient.post(`/invitations/${id}/send`);
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      throw new Error(error.response?.data?.message || 'Failed to send invitation');
    }
  }

  // Send reminder
  async sendReminder(id: string): Promise<void> {
    try {
      await apiClient.post(`/invitations/${id}/remind`);
    } catch (error: any) {
      console.error('Error sending reminder:', error);
      throw new Error(error.response?.data?.message || 'Failed to send reminder');
    }
  }

  // Cancel invitation
  async cancelInvitation(id: string): Promise<void> {
    try {
      await apiClient.patch(`/invitations/${id}/cancel`);
    } catch (error: any) {
      console.error('Error cancelling invitation:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel invitation');
    }
  }

  // Resend invitation
  async resendInvitation(id: string): Promise<InvitationResponse> {
    try {
      const response = await apiClient.post(`/invitations/${id}/resend`);
      return response.data;
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      throw new Error(error.response?.data?.message || 'Failed to resend invitation');
    }
  }

  // Accept invitation
  async acceptInvitation(request: AcceptInvitationRequest): Promise<{
    user: any;
    access_token: string;
    refresh_token: string;
    onboarding_required: boolean;
  }> {
    try {
      const formData = new FormData();
      
      // Add basic fields
      formData.append('token', request.token);
      formData.append('password', request.password);
      formData.append('confirm_password', request.confirm_password);
      
      if (request.phone) {
        formData.append('phone', request.phone);
      }
      
      if (request.profile_picture) {
        formData.append('profile_picture', request.profile_picture);
      }
      
      if (request.preferences) {
        formData.append('preferences', JSON.stringify(request.preferences));
      }

      const response = await apiClient.post('/invitations/accept', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      throw new Error(error.response?.data?.message || 'Failed to accept invitation');
    }
  }

  // Decline invitation
  async declineInvitation(token: string, reason?: string): Promise<void> {
    try {
      await apiClient.post('/invitations/decline', { token, reason });
    } catch (error: any) {
      console.error('Error declining invitation:', error);
      throw new Error(error.response?.data?.message || 'Failed to decline invitation');
    }
  }



  // Template management
  async getInvitationTemplates(): Promise<InvitationTemplate[]> {
    try {
      const response = await apiClient.get('/invitations/templates');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching invitation templates:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch invitation templates');
    }
  }

  async createInvitationTemplate(template: Omit<InvitationTemplate, 'id' | 'created_by' | 'created_at'>): Promise<InvitationTemplate> {
    try {
      const response = await apiClient.post('/invitations/templates', template);
      return response.data;
    } catch (error: any) {
      console.error('Error creating invitation template:', error);
      throw new Error(error.response?.data?.message || 'Failed to create invitation template');
    }
  }

  async updateInvitationTemplate(id: string, template: Partial<InvitationTemplate>): Promise<InvitationTemplate> {
    try {
      const response = await apiClient.patch(`/invitations/templates/${id}`, template);
      return response.data;
    } catch (error: any) {
      console.error('Error updating invitation template:', error);
      throw new Error(error.response?.data?.message || 'Failed to update invitation template');
    }
  }

  async deleteInvitationTemplate(id: string): Promise<void> {
    try {
      await apiClient.delete(`/invitations/templates/${id}`);
    } catch (error: any) {
      console.error('Error deleting invitation template:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete invitation template');
    }
  }

  // Statistics and analytics
  async getInvitationStats(params?: {
    start_date?: string;
    end_date?: string;
    department_id?: string;
    role?: UserRole;
  }): Promise<InvitationStats> {
    try {
      const response = await apiClient.get('/invitations/stats', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching invitation stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch invitation stats');
    }
  }

  // Utility methods
  isInvitationExpired(invitation: UserInvitation): boolean {
    return new Date(invitation.expires_at) < new Date();
  }

  canSendReminder(invitation: UserInvitation): boolean {
    if (invitation.status !== InvitationStatus.SENT) return false;
    if (this.isInvitationExpired(invitation)) return false;
    
    // Allow reminder if no reminder sent yet, or last reminder was sent more than 24 hours ago
    if (!invitation.last_reminder_sent) return true;
    
    const lastReminderDate = new Date(invitation.last_reminder_sent);
    const now = new Date();
    const hoursSinceLastReminder = (now.getTime() - lastReminderDate.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceLastReminder >= 24;
  }

  getInvitationStatusColor(status: InvitationStatus): string {
    switch (status) {
      case InvitationStatus.PENDING:
        return 'orange';
      case InvitationStatus.SENT:
        return 'blue';
      case InvitationStatus.ACCEPTED:
        return 'green';
      case InvitationStatus.DECLINED:
        return 'red';
      case InvitationStatus.EXPIRED:
        return 'gray';
      case InvitationStatus.CANCELLED:
        return 'gray';
      default:
        return 'default';
    }
  }

  getInvitationStatusText(status: InvitationStatus): string {
    switch (status) {
      case InvitationStatus.PENDING:
        return 'Pending';
      case InvitationStatus.SENT:
        return 'Sent';
      case InvitationStatus.ACCEPTED:
        return 'Accepted';
      case InvitationStatus.DECLINED:
        return 'Declined';
      case InvitationStatus.EXPIRED:
        return 'Expired';
      case InvitationStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  }

  generateInvitationUrl(token: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    return `${baseUrl}/invitation/accept/${token}`;
  }

  // CSV import/export utilities
  async exportInvitations(params?: {
    status?: InvitationStatus;
    role?: UserRole;
    department_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Blob> {
    try {
      const response = await apiClient.get('/invitations/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error('Error exporting invitations:', error);
      throw new Error(error.response?.data?.message || 'Failed to export invitations');
    }
  }

  async importInvitations(file: File): Promise<BulkInvitationResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/invitations/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error importing invitations:', error);
      throw new Error(error.response?.data?.message || 'Failed to import invitations');
    }
  }

  // Validation utilities
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const invitationService = new InvitationService();
export default invitationService;