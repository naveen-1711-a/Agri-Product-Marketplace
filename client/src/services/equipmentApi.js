import api from './api';

// ── Public ───────────────────────────────────────────────────────────────────
export const getEquipmentList = (params = {}) =>
  api.get('/equipment', { params });

export const getEquipment = (id) => api.get(`/equipment/${id}`);

export const getCategories = () => api.get('/equipment/categories');

// ── Reviews ──────────────────────────────────────────────────────────────────
export const addEquipmentReview = (id, data) => api.post(`/equipment/${id}/reviews`, data);

// ── Seller ───────────────────────────────────────────────────────────────────
export const getMyEquipment = () => api.get('/equipment/seller/my');
export const getSellerEquipmentStats = () => api.get('/equipment/seller/stats');

export const createEquipment = (formData) =>
  api.post('/equipment', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const updateEquipment = (id, formData) =>
  api.put(`/equipment/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const deleteEquipment = (id) => api.delete(`/equipment/${id}`);

export const toggleEquipmentAvailability = (id) => api.patch(`/equipment/${id}/availability`);

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminGetAllEquipment = (params = {}) =>
  api.get('/equipment/admin/all', { params });

export const adminGetEquipmentStats = () => api.get('/equipment/admin/stats');

export const adminUpdateEquipmentStatus = (id, data) =>
  api.patch(`/equipment/admin/${id}/status`, data);

export const adminDeleteEquipment = (id) => api.delete(`/equipment/admin/${id}`);
