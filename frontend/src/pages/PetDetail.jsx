import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { petAPI, healthAPI } from '../services/api';

function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPetData();
  }, [id]);

  const fetchPetData = async () => {
    try {
      const [petRes, healthRes, vaccRes] = await Promise.all([
        petAPI.getPetById(id),
        healthAPI.getHealthRecords(id),
        healthAPI.getVaccinations(id)
      ]);

      setPet(petRes.data.pet);
      setHealthRecords(healthRes.data.records);
      setVaccinations(vaccRes.data.vaccinations);
      setLoading(false);
    } catch (err) {
      setError('获取宠物信息失败');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('确定要删除这只宠物的所有信息吗？')) {
      try {
        await petAPI.deletePet(id);
        navigate('/');
      } catch (err) {
        setError('删除失败');
      }
    }
  };

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/export/${format}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('导出失败');
      }

      // 获取文件名
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `pet-export-${pet.name}.${format}`;
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      // 下载文件
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert(`${format.toUpperCase()}文件导出成功！`);
    } catch (err) {
      console.error('导出失败:', err);
      alert('导出失败，请重试');
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!pet) {
    return <div className="error">宠物未找到</div>;
  }

  return (
    <div>
      {error && <div className="error">{error}</div>}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>🐾 {pet.name}</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                className="btn"
                onClick={() => {
                  const menu = document.getElementById('export-menu');
                  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                }}
              >
                📥 导出报告
              </button>
              <div
                id="export-menu"
                style={{
                  display: 'none',
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  minWidth: '150px'
                }}
              >
                <button
                  onClick={() => {
                    handleExport('pdf');
                    document.getElementById('export-menu').style.display = 'none';
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: '8px 8px 0 0'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  📄 PDF报告
                </button>
                <button
                  onClick={() => {
                    handleExport('excel');
                    document.getElementById('export-menu').style.display = 'none';
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  📊 Excel表格
                </button>
                <button
                  onClick={() => {
                    handleExport('csv');
                    document.getElementById('export-menu').style.display = 'none';
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  📋 CSV文件
                </button>
                <button
                  onClick={() => {
                    handleExport('json');
                    document.getElementById('export-menu').style.display = 'none';
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: '0 0 8px 8px'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  💾 JSON数据
                </button>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              返回列表
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              删除宠物
            </button>
          </div>
        </div>

        <div className="pet-info" style={{ marginTop: '2rem' }}>
          <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>基本信息</h3>
          <p><strong>种类：</strong>{pet.species}</p>
          <p><strong>品种：</strong>{pet.breed || '未填写'}</p>
          <p><strong>性别：</strong>{pet.gender}</p>
          <p><strong>出生日期：</strong>{pet.birth_date || '未填写'}</p>
          <p><strong>体重：</strong>{pet.weight ? `${pet.weight} kg` : '未填写'}</p>
          <p><strong>主人：</strong>{pet.owner_name || '未填写'}</p>
          <p><strong>联系电话：</strong>{pet.owner_phone || '未填写'}</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ color: '#667eea' }}>疫苗接种记录</h3>
        {vaccinations.length === 0 ? (
          <p style={{ color: '#999', padding: '1rem 0' }}>暂无疫苗记录</p>
        ) : (
          <div style={{ marginTop: '1rem' }}>
            {vaccinations.map((vac) => (
              <div key={vac.id} style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}>
                <p><strong>{vac.vaccine_name}</strong></p>
                <p>接种日期：{vac.vaccination_date}</p>
                {vac.next_due_date && <p>下次接种：{vac.next_due_date}</p>}
                {vac.veterinarian && <p>兽医：{vac.veterinarian}</p>}
                {vac.notes && <p>备注：{vac.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ color: '#667eea' }}>健康记录</h3>
        {healthRecords.length === 0 ? (
          <p style={{ color: '#999', padding: '1rem 0' }}>暂无健康记录</p>
        ) : (
          <div style={{ marginTop: '1rem' }}>
            {healthRecords.map((record) => (
              <div key={record.id} style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}>
                <p><strong>{record.record_type}</strong> - {record.record_date}</p>
                {record.description && <p>描述：{record.description}</p>}
                {record.weight && <p>体重：{record.weight} kg</p>}
                {record.temperature && <p>体温：{record.temperature} °C</p>}
                {record.notes && <p>备注：{record.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PetDetail;
