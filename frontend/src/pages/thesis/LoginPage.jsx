import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maGV: username, matKhau: password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đăng nhập thất bại');
      // Lưu token vào localStorage/sessionStorage tuỳ ý
      localStorage.setItem('token', data.token);
      // Chuyển hướng sang trang chính hoặc dashboard
      window.location.href = '/thesis';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',background:'#f5f6fa'}}>
      <form onSubmit={handleSubmit} style={{background:'#fff',padding:32,borderRadius:8,boxShadow:'0 2px 8px #0001',minWidth:320}}>
        <h2 style={{marginBottom:24}}>Đăng nhập Giảng viên</h2>
        <div style={{marginBottom:16}}>
          <label>Mã giảng viên</label>
          <input type="text" value={username} onChange={e=>setUsername(e.target.value)} required style={{width:'100%',padding:8,marginTop:4}} />
        </div>
        <div style={{marginBottom:16}}>
          <label>Mật khẩu</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={{width:'100%',padding:8,marginTop:4}} />
        </div>
        {error && <div style={{color:'red',marginBottom:12}}>{error}</div>}
        <button type="submit" className="btn btn-primary" style={{width:'100%'}} disabled={loading}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
      </form>
    </div>
  );
}
