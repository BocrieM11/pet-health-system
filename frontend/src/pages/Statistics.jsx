import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { petAPI, statisticsAPI, authAPI } from '../services/api';
import HealthTrendChart from '../components/HealthTrendChart';
import ActivityChart from '../components/ActivityChart';

function Statistics() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [period, setPeriod] = useState('week');
  const [healthData, setHealthData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 检查是否登录
    if (!authAPI.isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadPets();
  }, []);

  useEffect(() => {
    if (selectedPet) {
      loadStatistics();
    }
  }, [selectedPet, period]);

  const loadPets = async () => {
    try {
      const response = await petAPI.getAllPets();
      const petsData = response.data.pets;
      setPets(petsData);

      if (petsData.length > 0) {
        setSelectedPet(petsData[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError('获取宠物列表失败');
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    setLoading(true);
    setError('');

    try {
      const [healthRes, activityRes, overviewRes] = await Promise.all([
        statisticsAPI.getHealthTrend(selectedPet, period),
        statisticsAPI.getActivity(selectedPet, period),
        statisticsAPI.getOverview(selectedPet)
      ]);

      setHealthData(healthRes.data.data);
      setActivityData(activityRes.data.data);
      setOverview(overviewRes.data);
    } catch (err) {
      setError(err.response?.data?.error || '获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePetChange = (e) => {
    setSelectedPet(parseInt(e.target.value));
  };

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  if (pets.length === 0 && !loading) {
    return (
      <div className="card">
        <p style={{ textAlign: 'center', color: '#999', padding: '3rem' }}>
          还没有宠物，请先<a href="/add" style={{ color: '#667eea' }}>添加宠物</a>
        </p>
      </div>
    );
  }

  const currentPet = pets.find(p => p.id === selectedPet);

  return (
    <div>
      {/* 控制面板 */}
      <div className="card">
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
            <label>选择宠物</label>
            <select value={selectedPet || ''} onChange={handlePetChange}>
              {pets.map(pet => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} ({pet.species})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
            <label>时间范围</label>
            <select value={period} onChange={handlePeriodChange}>
              <option value="day">今日</option>
              <option value="week">本周</option>
              <option value="month">本月</option>
            </select>
          </div>

          {currentPet && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {currentPet.avatar && (
                <img
                  src={`http://localhost:3001${currentPet.avatar}`}
                  alt={currentPet.name}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    border: '3px solid #667eea'
                  }}
                />
              )}
              <div>
                <h3 style={{ margin: 0, color: '#667eea' }}>{currentPet.name}</h3>
                <p style={{ margin: 0, color: '#999', fontSize: '0.9rem' }}>
                  {currentPet.species} - {currentPet.breed || '未知品种'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {/* 概览卡片 */}
      {overview && (
        <div className="card">
          <h3 style={{ color: '#667eea', marginBottom: '1.5rem' }}>健康概览</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-value">{overview.totalRecords}</div>
              <div className="stat-label">总记录数</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {overview.latestWeight ? `${overview.latestWeight} kg` : '-'}
              </div>
              <div className="stat-label">最新体重</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {overview.latestTemp ? `${overview.latestTemp} °C` : '-'}
              </div>
              <div className="stat-label">最新体温</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{overview.vaccineCount}</div>
              <div className="stat-label">疫苗接种</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{overview.recentRecords}</div>
              <div className="stat-label">近7天记录</div>
            </div>
          </div>
        </div>
      )}

      {/* 健康趋势图 */}
      <div className="card">
        <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>
          健康趋势 - {period === 'day' ? '今日' : period === 'week' ? '本周' : '本月'}
        </h3>
        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <HealthTrendChart data={healthData} period={period} />
        )}
      </div>

      {/* 活动量分布图 */}
      <div className="card">
        <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>
          活动量分布 - {period === 'day' ? '今日' : period === 'week' ? '本周' : '本月'}
        </h3>
        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <ActivityChart data={activityData} period={period} />
        )}
      </div>

      {/* 提示信息 */}
      {!loading && healthData.length === 0 && activityData.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#999', marginBottom: '1rem' }}>
            暂无{period === 'day' ? '今日' : period === 'week' ? '本周' : '本月'}健康数据
          </p>
          <p style={{ color: '#999' }}>
            前往<a href={`/pet/${selectedPet}`} style={{ color: '#667eea' }}>宠物详情</a>添加健康记录
          </p>
        </div>
      )}
    </div>
  );
}

export default Statistics;
