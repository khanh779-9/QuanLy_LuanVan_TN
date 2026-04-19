// Import danh sách giảng viên từ file
export async function importTeachers(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/giang-vien/import', formData, {
    headers: { 'Content-Type': undefined },
  });
  return res.data;
}
import api from './api';

export async function getLecturers() {
  return (await api.get('/giang-vien')).data;
}
export async function createLecturer(data) {
  // Đúng chuẩn backend: maGV, tenGV, matKhau...
  return (await api.post('/giang-vien', {
    maGV: data.maGV,
    tenGV: data.tenGV,
    email: data.email,
    soDienThoai: data.soDienThoai,
    hocVi: data.hocVi,
    password: data.password,
  })).data;
}
export async function updateLecturer(maGV, data) {
  return (await api.put(`/giang-vien/${maGV}`, {
    tenGV: data.tenGV,
    email: data.email,
    soDienThoai: data.soDienThoai,
    hocVi: data.hocVi,
    password: data.password,
  })).data;
}
export async function deleteLecturer(maGV) {
  return (await api.delete(`/giang-vien/${maGV}`)).data;
}
