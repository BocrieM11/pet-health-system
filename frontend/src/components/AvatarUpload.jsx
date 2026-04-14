import React, { useState } from 'react';
import { uploadAPI } from '../services/api';

function AvatarUpload({ currentAvatar, onUploadSuccess }) {
  const [preview, setPreview] = useState(currentAvatar || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过5MB');
      return;
    }

    setError('');

    // 创建预览
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // 上传到服务器
    setUploading(true);
    try {
      const response = await uploadAPI.uploadAvatar(file);
      const { url } = response.data;

      // 通知父组件上传成功
      if (onUploadSuccess) {
        onUploadSuccess(url);
      }
    } catch (err) {
      setError(err.response?.data?.error || '上传失败，请重试');
      setPreview(currentAvatar || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="avatar-upload">
      <label htmlFor="avatar-input" style={{ cursor: 'pointer' }}>
        <div className="avatar-preview">
          {preview ? (
            <img
              src={preview.startsWith('http') ? preview : `http://localhost:3001${preview}`}
              alt="宠物头像"
              style={{
                width: '150px',
                height: '150px',
                objectFit: 'cover',
                borderRadius: '10px',
                border: '3px solid #667eea'
              }}
            />
          ) : (
            <div
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '10px',
                border: '3px dashed #667eea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#667eea',
                fontSize: '3rem'
              }}
            >
              📷
            </div>
          )}
        </div>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          {uploading ? (
            <span style={{ color: '#667eea' }}>上传中...</span>
          ) : (
            <span style={{ color: '#667eea', textDecoration: 'underline' }}>
              {preview ? '更换头像' : '点击上传头像'}
            </span>
          )}
        </div>
      </label>
      <input
        id="avatar-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={uploading}
      />
      {error && (
        <div className="error" style={{ marginTop: '1rem' }}>
          {error}
        </div>
      )}
      <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.5rem', textAlign: 'center' }}>
        支持 JPG、PNG、GIF，最大5MB
      </div>
    </div>
  );
}

export default AvatarUpload;
