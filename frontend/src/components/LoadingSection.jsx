import React from 'react';

const LoadingSection = () => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px'
    }}>
        <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid #ccc',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '16px', color: '#555' }}>Đang tải dữ liệu. Vui lòng chờ đợi ...</p>
        <style>
            {`
                @keyframes spin {
                    0% { transform: rotate(0deg);}
                    100% { transform: rotate(360deg);}
                }
            `}
        </style>
    </div>
);

export default LoadingSection;