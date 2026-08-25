import api from './axios';

export const parentService = {
  getProfile: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (data: { name?: string; email?: string }) => {
    try {
      const response = await api.patch('/users/me', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  uploadAvatar: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // 1. Fazer o upload do ficheiro para o Cloudinary (como configurado no backend)
      const uploadResponse = await api.post('/uploads/cloudinary', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // O backend retorna um objeto com 'path' sendo a URL (seja Cloudinary ou local)
      const avatarUrl = uploadResponse.data.path || uploadResponse.data.url || (typeof uploadResponse.data === 'string' ? uploadResponse.data : null);
      
      if (!avatarUrl) {
        throw new Error('Falha ao obter URL da imagem após o upload.');
      }
      
      // 2. Atualizar o utilizador
      const updateResponse = await api.patch('/users/me', { avatar: avatarUrl });
      
      return updateResponse.data;
    } catch (error) {
      throw error;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.patch('/users/me/password', { currentPassword, newPassword });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getStudentGrades: async (studentId: string, classId: string) => {
    try {
      const response = await api.get(`/grades/student/${studentId}/class/${classId}`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  getStudentPayments: async (studentId: string) => {
    try {
      const response = await api.get(`/finance/payments/student/${studentId}`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  createPayment: async (data: any) => {
    try {
      const response = await api.post('/finance/payments', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  uploadPaymentProof: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  submitPaymentProof: async (paymentId: string, proofUrl: string, paymentMethod: string) => {
    try {
      const response = await api.patch(`/finance/payments/${paymentId}/submit-proof`, {
        proofUrl,
        paymentMethod
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getEvents: async () => {
    try {
      const response = await api.get('/events');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      return [];
    }
  },
  markNotificationAsRead: async (id: string) => {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      const response = await api.patch('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getContacts: async () => {
    try {
      const response = await api.get('/users');
      // Filtrar professores, secretaria, admin, etc. que o encarregado pode contactar
      return response.data.filter((u: any) => 
        ['TEACHER', 'ADMIN', 'SECRETARY'].includes(u.role)
      );
    } catch (error) {
      return [];
    }
  },

  getConversation: async (userId: string) => {
    try {
      const response = await api.get(`/messages/conversation/${userId}`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  sendMessage: async (receiverId: string, content: string) => {
    try {
      const response = await api.post('/messages', { receiverId, content });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUnreadMessages: async () => {
    try {
      const response = await api.get('/messages/unread');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  markConversationAsRead: async (userId: string) => {
    try {
      const response = await api.patch(`/messages/conversation/${userId}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getStudentAttendance: async (studentId: string, classId: string) => {
    try {
      const response = await api.get(`/attendance/student/${studentId}/class/${classId}`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  getStudentAnalysis: async (studentId: string) => {
    try {
      const response = await api.get(`/ai/student-analysis/${studentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  chatWithAi: async (question: string, studentId?: string) => {
    try {
      const response = await api.post('/ai/chat', { question, studentId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAiSuggestions: async () => {
    try {
      const response = await api.get('/ai/suggestions');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  getAiResources: async () => {
    try {
      const response = await api.get('/ai/resources');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  getInstitutionInfo: async () => {
    try {
      const response = await api.get('/institutions/current');
      return response.data;
    } catch (error) {
      return null;
    }
  }
};
