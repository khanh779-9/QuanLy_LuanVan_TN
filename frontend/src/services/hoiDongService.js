import api from "../services/api";

const endpoint = "/hoi-dong";

const getAllHoiDong = () => api.get(endpoint);
const getHoiDongById = (id) => api.get(`${endpoint}/${id}`);
const createHoiDong = (data) => api.post(endpoint, data);
const updateHoiDong = (id, data) => api.put(`${endpoint}/${id}`, data);
const deleteHoiDong = (id) => api.delete(`${endpoint}/${id}`);

export default {
  getAllHoiDong,
  getHoiDongById,
  createHoiDong,
  updateHoiDong,
  deleteHoiDong,
};
