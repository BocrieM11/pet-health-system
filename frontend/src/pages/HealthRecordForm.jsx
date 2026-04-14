import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { petAPI, healthAPI } from '../services/api';

function HealthRecordForm() {
  const navigate = useNavigate();
  const { petId } = useParams();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    pet_id: petId || '',
    record_type: '日常检查',
    record_date: new Date().toISOString().split('T')[0],
    // 基础指标
    weight: '',
    temperature: '',
    // 生命体征
    heart_rate: '',
    respiratory_rate: '',
    blood_pressure_high: '',
    blood_pressure_low: '',
    blood_glucose: '',
    // 状态评估
    activity_level: '正常',
    appetite: '正常',
    mental_state: '良好',
    // 描述
    symptoms: '',
    description: '',
    notes: ''
  });

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const res = await petAPI.getAllPets();
      setPets(res.data.pets || []);
      if (petId) {
        setFormData(prev => ({ ...prev, pet_id: petId }));
      }
    } catch (err) {
      setError('获取宠物列表失败');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.pet_id) {
      setError('请选择宠物');
      return;
    }

    setLoading(true);

    try {
      // 处理数据，将空字符串转换为null
      const submitData = { ...formData };
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          submitData[key] = null;
        }
      });

      await healthAPI.addHealthRecord(submitData);
      setSuccess('健康记录添加成功！');

      // 3秒后跳转
      setTimeout(() => {
        navigate(`/pet/${formData.pet_id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || '添加失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>📝 添加健康记录</h2>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            返回
          </button>
        </div>

        {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}
        {success && <div className="success" style={{ marginBottom: '1rem', padding: '1rem', background: '#d4edda', color: '#155724', borderRadius: '8px' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* 基本信息 */}
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8f9ff', borderRadius: '8px' }}>
            <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>基本信息</h3>

            <div className="form-group">
              <label>选择宠物 *</label>
              <select
                name="pet_id"
                value={formData.pet_id}
                onChange={handleChange}
                required
                disabled={!!petId}
              >
                <option value="">请选择宠物</option>
                {pets.map(pet => (
                  <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>记录类型 *</label>
              <select name="record_type" value={formData.record_type} onChange={handleChange} required>
                <option value="日常检查">日常检查</option>
                <option value="体检">体检</option>
                <option value="就诊">就诊</option>
                <option value="手术">手术</option>
                <option value="紧急情况">紧急情况</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div className="form-group">
              <label>记录日期 *</label>
              <input
                type="date"
                name="record_date"
                value={formData.record_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* 基础生理指标 */}
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#fff5f5', borderRadius: '8px' }}>
            <h3 style={{ color: '#f093fb', marginBottom: '1rem' }}>基础生理指标</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label>体重 (kg)</label>
                <input
                  type="number"
                  name="weight"
                  step="0.1"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="例: 5.5"
                />
              </div>

              <div className="form-group">
                <label>体温 (°C)</label>
                <input
                  type="number"
                  name="temperature"
                  step="0.1"
                  value={formData.temperature}
                  onChange={handleChange}
                  placeholder="例: 38.5"
                />
                <small style={{ color: '#999' }}>正常范围: 猫狗 38-39°C</small>
              </div>
            </div>
          </div>

          {/* 生命体征 */}
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f0fff4', borderRadius: '8px' }}>
            <h3 style={{ color: '#48bb78', marginBottom: '1rem' }}>生命体征</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label>心率 (次/分钟)</label>
                <input
                  type="number"
                  name="heart_rate"
                  value={formData.heart_rate}
                  onChange={handleChange}
                  placeholder="例: 120"
                />
                <small style={{ color: '#999' }}>正常: 狗60-140, 猫120-140</small>
              </div>

              <div className="form-group">
                <label>呼吸频率 (次/分钟)</label>
                <input
                  type="number"
                  name="respiratory_rate"
                  value={formData.respiratory_rate}
                  onChange={handleChange}
                  placeholder="例: 30"
                />
                <small style={{ color: '#999' }}>正常: 10-30次/分</small>
              </div>

              <div className="form-group">
                <label>收缩压 (mmHg)</label>
                <input
                  type="number"
                  name="blood_pressure_high"
                  value={formData.blood_pressure_high}
                  onChange={handleChange}
                  placeholder="例: 120"
                />
              </div>

              <div className="form-group">
                <label>舒张压 (mmHg)</label>
                <input
                  type="number"
                  name="blood_pressure_low"
                  value={formData.blood_pressure_low}
                  onChange={handleChange}
                  placeholder="例: 80"
                />
              </div>

              <div className="form-group">
                <label>血糖 (mmol/L)</label>
                <input
                  type="number"
                  name="blood_glucose"
                  step="0.1"
                  value={formData.blood_glucose}
                  onChange={handleChange}
                  placeholder="例: 5.5"
                />
                <small style={{ color: '#999' }}>正常: 3.9-6.9 mmol/L</small>
              </div>
            </div>
          </div>

          {/* 状态评估 */}
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#fffbeb', borderRadius: '8px' }}>
            <h3 style={{ color: '#f59e0b', marginBottom: '1rem' }}>状态评估</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label>活动量</label>
                <select name="activity_level" value={formData.activity_level} onChange={handleChange}>
                  <option value="非常活跃">非常活跃</option>
                  <option value="活跃">活跃</option>
                  <option value="正常">正常</option>
                  <option value="偏少">偏少</option>
                  <option value="嗜睡">嗜睡</option>
                </select>
              </div>

              <div className="form-group">
                <label>食欲</label>
                <select name="appetite" value={formData.appetite} onChange={handleChange}>
                  <option value="旺盛">旺盛</option>
                  <option value="正常">正常</option>
                  <option value="一般">一般</option>
                  <option value="偏差">偏差</option>
                  <option value="拒食">拒食</option>
                </select>
              </div>

              <div className="form-group">
                <label>精神状态</label>
                <select name="mental_state" value={formData.mental_state} onChange={handleChange}>
                  <option value="极佳">极佳</option>
                  <option value="良好">良好</option>
                  <option value="一般">一般</option>
                  <option value="萎靡">萎靡</option>
                  <option value="昏迷">昏迷</option>
                </select>
              </div>
            </div>
          </div>

          {/* 详细描述 */}
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#fef3f2', borderRadius: '8px' }}>
            <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>详细描述</h3>

            <div className="form-group">
              <label>症状描述</label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                rows="3"
                placeholder="描述观察到的症状，如咳嗽、呕吐、腹泻等"
              />
            </div>

            <div className="form-group">
              <label>检查描述</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="详细描述本次检查的情况"
              />
            </div>

            <div className="form-group">
              <label>其他备注</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                placeholder="其他需要记录的信息"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={loading}>
              取消
            </button>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? '提交中...' : '提交健康记录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HealthRecordForm;
