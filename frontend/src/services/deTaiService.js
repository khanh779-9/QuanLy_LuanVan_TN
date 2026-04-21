
import api from './api';

export async function getDeTais(params) {
  return (await api.get('/de-tai', { params })).data;
}

export async function createDeTai(data) {
  return (await api.post('/de-tai', data)).data;
}

export async function updateDeTai(id, data) {
  return (await api.put(`/de-tai/${id}`, data)).data;
}

export async function deleteDeTai(id) {
  return (await api.delete(`/de-tai/${id}`)).data;
}

export async function getStudentsByDeTai(id) {
  return (await api.get(`/de-tai/${id}/sinh-vien`)).data;
}

// Chấm điểm hướng dẫn
export async function chamDiemHD(id, data) {
  // Đảm bảo gửi data_json nếu có
  const payload = { ...data };
  if (data.data_json) {
    payload.data_json = data.data_json;
  }
  return (await api.put(`/de-tai/${id}/cham-diem-hd`, payload)).data;
}

// Chấm điểm phản biện
export async function chamDiemPB(id, data) {
  return (await api.put(`/de-tai/${id}/cham-diem-pb`, data)).data;
}

// Xuất Word GVHD
export async function exportWordGVHD(id) {
  const res = await api.get(`/de-tai/${id}/export/gvhd`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Phieu_cham_HD_${id}.docx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// Xuất Word GVPB
export async function exportWordGVPB(id) {
  const res = await api.get(`/de-tai/${id}/export/gvpb`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Phieu_cham_PB_${id}.docx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// Xuất Word Nhiệm vụ
export async function exportWordNhiemVu(id) {
  const res = await api.get(`/de-tai/${id}/export/nhiem-vu`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Phieu_giao_de_tai_${id}.docx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
