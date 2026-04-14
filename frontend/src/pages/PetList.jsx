import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { petAPI, authAPI } from '../services/api';

function PetList() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const response = await petAPI.getAllPets();
      setPets(response.data.pets);
      setLoading(false);
    } catch (err) {
      setError('获取宠物列表失败');
      setLoading(false);
    }
  };

  const handlePetClick = (petId) => {
    navigate(`/pet/${petId}`);
  };

  const handleEdit = (e, petId) => {
    e.stopPropagation(); // 阻止触发父元素的点击事件
    navigate(`/pet/${petId}/edit`);
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  const isLoggedIn = authAPI.isAuthenticated();

  return (
    <div>
      <div className="card">
        <h2>我的宠物</h2>
        {error && <div className="error">{error}</div>}

        {!isLoggedIn && (
          <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '5px', marginBottom: '1rem' }}>
            💡 提示：请先<a href="/login" style={{ color: '#667eea' }}>登录</a>以管理您的宠物
          </div>
        )}

        {pets.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
            {isLoggedIn ? '还没有添加宠物，点击"添加宠物"开始吧！' : '请先登录查看您的宠物'}
          </p>
        ) : (
          <div className="pet-grid">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="pet-card"
                onClick={() => handlePetClick(pet.id)}
              >
                {pet.avatar && (
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <img
                      src={`http://localhost:3001${pet.avatar}`}
                      alt={pet.name}
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        border: '2px solid #667eea'
                      }}
                    />
                  </div>
                )}
                <h3>{pet.name}</h3>
                <div className="pet-info">
                  <p><strong>品种：</strong>{pet.species} {pet.breed && `- ${pet.breed}`}</p>
                  <p><strong>性别：</strong>{pet.gender}</p>
                  <p><strong>出生日期：</strong>{pet.birth_date || '未填写'}</p>
                  {pet.weight && <p><strong>体重：</strong>{pet.weight} kg</p>}
                  {pet.owner_name && <p><strong>主人：</strong>{pet.owner_name}</p>}
                </div>
                {isLoggedIn && (
                  <button
                    className="btn btn-secondary"
                    style={{ marginTop: '1rem', width: '100%' }}
                    onClick={(e) => handleEdit(e, pet.id)}
                  >
                    编辑
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PetList;
