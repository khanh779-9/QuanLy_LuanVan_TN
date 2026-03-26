import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThesisTable from '../../components/ThesisTable';
import ThesisFormModal from '../../components/ThesisFormModal';
import { fetchTheses, createThesis, updateThesis, deleteThesis } from '../../services/thesisApi';

const ThesisList = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const theses = await fetchTheses();
      setData(theses);
    } catch (e) {
      alert(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = () => {
    setEditData(null);
    setModalOpen(true);
  };
  const handleEdit = (row) => {
    setEditData(row);
    setModalOpen(true);
  };
  const handleDelete = async (row) => {
    if (window.confirm('Xóa luận văn này?')) {
      await deleteThesis(row.maDeTai);
      loadData();
    }
  };
  const handleDetail = (row) => {
    // TODO: Show detail modal or navigate
    alert('Chi tiết: ' + row.tenDeTai);
  };
  const handleSubmit = async (form) => {
    if (editData) await updateThesis(editData.maDeTai, form);
    else await createThesis(form);
    setModalOpen(false);
    loadData();
  };

  const filtered = data.filter(row =>
    row.tenDeTai?.toLowerCase().includes(search.toLowerCase()) ||
    row.maDeTai?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="thesis-list-page">
      <h2>Danh sách Luận văn/Đề tài</h2>
      <div className="toolbar">
        <button className="btn btn-primary" onClick={handleAdd}>Thêm mới</button>
        <input type="text" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} style={{marginLeft: 16}} />
      </div>
      {loading ? <div>Đang tải...</div> : <ThesisTable data={filtered} onDetail={handleDetail} onEdit={handleEdit} onDelete={handleDelete} />}
      <ThesisFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} initialData={editData} />
    </div>
  );
};

export default ThesisList;
