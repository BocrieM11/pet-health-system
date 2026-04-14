import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { petAPI, authAPI } from '../services/api';
import AvatarUpload from '../components/AvatarUpload';

function AddPet() {
  const navigate = useNavigate();
  const { id } = useParams(); // 如果有ID则是编辑模式
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    species: '狗',
    breed: '',
    gender: '公',
    birth_date: '',
    weight: '',
    avatar: '',
    owner_name: '',
    owner_phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 检查是否登录
    if (!authAPI.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // 编辑模式：加载宠物数据
    if (isEditMode) {
      loadPetData();
    }
  }, [id]);

  const loadPetData = async () => {
    try {
      const response = await petAPI.getPetById(id);
      const pet = response.data.pet;
      setFormData({
        name: pet.name || '',
        species: pet.species || '狗',
        breed: pet.breed || '',
        gender: pet.gender || '公',
        birth_date: pet.birth_date || '',
        weight: pet.weight || '',
        avatar: pet.avatar || '',
        owner_name: pet.owner_name || '',
        owner_phone: pet.owner_phone || '',
      });
    } catch (err) {
      setError('加载宠物信息失败');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = (avatarUrl) => {
    setFormData(prev => ({
      ...prev,
      avatar: avatarUrl
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name) {
      setError('请输入宠物名字');
      return;
    }

    setLoading(true);

    try {
      if (isEditMode) {
        await petAPI.updatePet(id, formData);
        setSuccess('宠物信息更新成功！');
      } else {
        await petAPI.addPet(formData);
        setSuccess('宠物信息添加成功！');
      }

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || (isEditMode ? '更新失败' : '添加失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>{isEditMode ? '编辑宠物信息' : '添加新宠物'}</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>宠物头像</label>
          <AvatarUpload
            currentAvatar={formData.avatar}
            onUploadSuccess={handleAvatarUpload}
          />
        </div>

        <div className="form-group">
          <label>宠物名字 *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="例如：旺财"
            required
          />
        </div>

        <div className="form-group">
          <label>宠物种类 *</label>
          <select name="species" value={formData.species} onChange={handleChange}>
            <option value="狗">狗</option>
            <option value="猫">猫</option>
            <option value="兔子">兔子</option>
            <option value="仓鼠">仓鼠</option>
            <option value="鸟">鸟</option>
            <option value="其他">其他</option>
          </select>
        </div>

        <div className="form-group">
          <label>品种</label>
          <input
            type="text"
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            placeholder="例如：金毛、英短"
          />
        </div>

        <div className="form-group">
          <label>性别</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="公">公</option>
            <option value="母">母</option>
          </select>
        </div>

        <div className="form-group">
          <label>出生日期</label>
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>体重 (kg)</label>
          <input
            type="number"
            step="0.1"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="例如：5.5"
          />
        </div>

        <div className="form-group">
          <label>主人姓名</label>
          <input
            type="text"
            name="owner_name"
            value={formData.owner_name}
            onChange={handleChange}
            placeholder="您的姓名"
          />
        </div>

        <div className="form-group">
          <label>联系电话</label>
          <input
            type="tel"
            name="owner_phone"
            value={formData.owner_phone}
            onChange={handleChange}
            placeholder="您的手机号"
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '保存中...' : (isEditMode ? '保存修改' : '添加宠物')}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddPet;
