import axios from 'axios';
import type { DashboardStats, ComplianceReport, MerchantInfo, ProvingKeyInfo, SubmitProofRequest, SubmitProofResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const MerchantAPI = {
  getMerchantInfo: async (merchantId: string): Promise<MerchantInfo> => {
    const response = await api.get(`/merchant/${merchantId}`);
    return response.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  generateComplianceReport: async (): Promise<ComplianceReport> => {
    const response = await api.post('/compliance/report');
    return response.data;
  },

  getBalance: async (merchantId: string): Promise<string> => {
    const response = await api.get(`/balance/${merchantId}`);
    return response.data;
  },

  exportTransactions: async (): Promise<Blob> => {
    const response = await api.get('/export/transactions', {
      responseType: 'blob',
    });
    return response.data;
  },

  generateViewingKey: async (): Promise<string> => {
    const response = await api.post('/compliance/viewing-key');
    return response.data.key;
  },

  getProvingKey: async (seedHex: string): Promise<ProvingKeyInfo> => {
    const response = await api.get(`/merchant/${seedHex}/pk`);
    return response.data;
  },

  submitProof: async (proof: SubmitProofRequest): Promise<SubmitProofResponse> => {
    const response = await api.post('/payment/submit-to-contract', proof);
    return response.data;
  },
};

export default MerchantAPI;
