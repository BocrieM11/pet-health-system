import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { petAPI } from '../services/api';
import axios from 'axios';

function AIAnalysis() {
  const navigate = useNavigate();
  const { petId: urlPetId } = useParams();
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(urlPetId || '');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    if (urlPetId && urlPetId !== selectedPetId) {
      setSelectedPetId(urlPetId);
      handleAnalyze(urlPetId);
    }
  }, [urlPetId]);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const res = await petAPI.getAllPets();
      const petList = res.data.pets || [];
      setPets(petList);

      if (petList.length > 0 && !selectedPetId) {
        setSelectedPetId(petList[0].id.toString());
      }
    } catch (err) {
      setError('获取宠物列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (petId = selectedPetId) => {
    if (!petId) {
      setError('请选择宠物');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('请先登录后再使用AI分析功能');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await axios.post(
        `http://localhost:3001/api/ai/analyze/${petId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setAnalysis(response.data.analysis);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'AI分析失败，请重试';
      if (err.response?.status === 401) {
        setError('登录已过期，请重新登录');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }, 2000);
      } else if (err.response?.status === 404) {
        setError('宠物未找到或无权访问。请确保使用添加该宠物的账号登录。');
      } else {
        setError(errorMsg);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const selectedPet = pets.find(p => p.id.toString() === selectedPetId);

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>🤖 AI健康分析</h2>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            返回首页
          </button>
        </div>

        {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div style={{ marginBottom: '2rem' }}>
          <div className="form-group">
            <label>选择宠物</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <select
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
                disabled={loading || analyzing}
                style={{ flex: 1 }}
              >
                <option value="">请选择宠物</option>
                {pets.map(pet => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} ({pet.species})
                  </option>
                ))}
              </select>
              <button
                className="btn"
                onClick={() => handleAnalyze()}
                disabled={!selectedPetId || analyzing}
                style={{ minWidth: '120px' }}
              >
                {analyzing ? '分析中...' : '开始分析'}
              </button>
            </div>
          </div>
        </div>

        {analyzing && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
            <p style={{ color: '#667eea', fontSize: '1.1rem' }}>AI正在分析宠物健康数据...</p>
            <p style={{ color: '#999', marginTop: '0.5rem' }}>这可能需要几秒钟时间</p>
          </div>
        )}

        {!analyzing && analysis && selectedPet && (
          <div>
            {/* 宠物信息卡片 */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '2rem',
              borderRadius: '12px',
              color: 'white',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {selectedPet.avatar && (
                  <img
                    src={`http://localhost:3001${selectedPet.avatar}`}
                    alt={selectedPet.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid white'
                    }}
                  />
                )}
                <div>
                  <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{selectedPet.name}</h3>
                  <p style={{ margin: 0, opacity: 0.9 }}>
                    {selectedPet.species} · {selectedPet.breed || '未知品种'} · {selectedPet.gender}
                  </p>
                </div>
              </div>
            </div>

            {/* 健康评分 */}
            {analysis.healthScore !== null && (
              <div style={{
                background: `linear-gradient(135deg, ${getHealthScoreColor(analysis.healthScore)}22 0%, ${getHealthScoreColor(analysis.healthScore)}11 100%)`,
                padding: '2rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: 0, marginBottom: '1rem', color: '#333' }}>健康评分</h3>
                <div style={{
                  fontSize: '4rem',
                  fontWeight: 'bold',
                  color: getHealthScoreColor(analysis.healthScore),
                  marginBottom: '0.5rem'
                }}>
                  {analysis.healthScore}
                </div>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                  {analysis.healthScore >= 80 && '健康状况良好'}
                  {analysis.healthScore >= 60 && analysis.healthScore < 80 && '健康状况一般'}
                  {analysis.healthScore < 60 && '需要关注'}
                </p>
              </div>
            )}

            {/* 总结 */}
            <div style={{
              background: '#f8f9ff',
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '2rem'
            }}>
              <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>📊 健康状况总结</h3>
              <p style={{ lineHeight: 1.6, color: '#333', margin: 0 }}>{analysis.summary}</p>
            </div>

            {/* 健康趋势 */}
            {analysis.trends && analysis.trends.length > 0 && (
              <div style={{
                background: '#fff',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>📈 健康趋势</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {analysis.trends.map((trend, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '1rem',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${getSeverityColor(trend.severity)}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#333' }}>{trend.type}</strong>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          background: getSeverityColor(trend.severity),
                          color: 'white'
                        }}>
                          {trend.severity === 'high' && '高'}
                          {trend.severity === 'medium' && '中'}
                          {trend.severity === 'low' && '低'}
                        </span>
                      </div>
                      <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>{trend.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 健康预警 */}
            {analysis.warnings && analysis.warnings.length > 0 && (
              <div style={{
                background: '#fef2f2',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                border: '1px solid #fecaca'
              }}>
                <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>⚠️ 健康预警</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {analysis.warnings.map((warning, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '1rem',
                        background: 'white',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${getUrgencyColor(warning.urgency)}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#333' }}>{warning.title}</strong>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          background: getUrgencyColor(warning.urgency),
                          color: 'white'
                        }}>
                          {warning.urgency === 'high' && '紧急'}
                          {warning.urgency === 'medium' && '注意'}
                          {warning.urgency === 'low' && '提醒'}
                        </span>
                      </div>
                      <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>{warning.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 健康建议 */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div style={{
                background: '#f0fdf4',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #bbf7d0'
              }}>
                <h3 style={{ color: '#10b981', marginBottom: '1rem' }}>💡 健康建议</h3>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} style={{ marginBottom: '0.75rem', color: '#333', lineHeight: 1.6 }}>
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 重新分析按钮 */}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button
                className="btn"
                onClick={() => handleAnalyze()}
                style={{ minWidth: '150px' }}
              >
                重新分析
              </button>
            </div>
          </div>
        )}

        {!analyzing && !analysis && pets.length > 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <p>选择宠物后点击"开始分析"，AI将为您分析宠物的健康状况</p>
          </div>
        )}

        {!loading && pets.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐾</div>
            <p>还没有添加宠物</p>
            <button className="btn" onClick={() => navigate('/add-pet')} style={{ marginTop: '1rem' }}>
              添加宠物
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIAnalysis;
