import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Reminders() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, sent, dismissed
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    pet_id: '',
    reminder_type: 'custom',
    title: '',
    description: '',
    scheduled_time: '',
    notification_methods: 'app'
  });

  useEffect(() => {
    fetchReminders();
    fetchPets();
  }, [filter]);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = filter !== 'all' ? { status: filter } : {};

      const response = await axios.get('http://localhost:3001/api/reminders', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setReminders(response.data.reminders || []);
    } catch (error) {
      console.error('获取提醒失败:', error);
      alert('获取提醒失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchPets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/pets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPets(response.data.pets || []);
    } catch (error) {
      console.error('获取宠物列表失败:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.scheduled_time) {
      alert('请填写标题和提醒时间');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/api/reminders', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('提醒创建成功');
      setShowAddForm(false);
      setFormData({
        pet_id: '',
        reminder_type: 'custom',
        title: '',
        description: '',
        scheduled_time: '',
        notification_methods: 'app'
      });
      fetchReminders();
    } catch (error) {
      console.error('创建提醒失败:', error);
      alert(error.response?.data?.error || '创建提醒失败');
    }
  };

  const handleUpdateStatus = async (reminderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3001/api/reminders/${reminderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchReminders();
    } catch (error) {
      console.error('更新提醒失败:', error);
      alert('更新提醒失败');
    }
  };

  const handleDelete = async (reminderId) => {
    if (!window.confirm('确定要删除这个提醒吗？')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/reminders/${reminderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('提醒删除成功');
      fetchReminders();
    } catch (error) {
      console.error('删除提醒失败:', error);
      alert('删除提醒失败');
    }
  };

  const getReminderTypeLabel = (type) => {
    const types = {
      vaccine: '疫苗接种',
      checkup: '定期体检',
      medication: '用药提醒',
      custom: '自定义',
      alert: '健康预警'
    };
    return types[type] || type;
  };

  const getReminderTypeIcon = (type) => {
    const icons = {
      vaccine: '💉',
      checkup: '🏥',
      medication: '💊',
      custom: '📌',
      alert: '⚠️'
    };
    return icons[type] || '📌';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      sent: '#10b981',
      dismissed: '#6b7280',
      completed: '#3b82f6'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: '待发送',
      sent: '已发送',
      dismissed: '已忽略',
      completed: '已完成'
    };
    return labels[status] || status;
  };

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (scheduledTime, status) => {
    if (status !== 'pending') return false;
    return new Date(scheduledTime) < new Date();
  };

  const pendingReminders = reminders.filter(r => r.status === 'pending');
  const overdueReminders = pendingReminders.filter(r => isOverdue(r.scheduled_time, r.status));

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2>🔔 提醒管理</h2>
            {overdueReminders.length > 0 && (
              <p style={{ color: '#ef4444', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                ⚠️ 有 {overdueReminders.length} 个逾期的提醒
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn" onClick={() => setShowAddForm(true)}>
              + 新建提醒
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              返回首页
            </button>
          </div>
        </div>

        {/* 筛选器 */}
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {['all', 'pending', 'sent', 'dismissed', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                border: `2px solid ${filter === status ? '#667eea' : '#e5e7eb'}`,
                background: filter === status ? '#667eea' : 'white',
                color: filter === status ? 'white' : '#333',
                cursor: 'pointer',
                fontWeight: filter === status ? 'bold' : 'normal'
              }}
            >
              {status === 'all' ? '全部' : getStatusLabel(status)}
            </button>
          ))}
        </div>

        {/* 添加提醒表单 */}
        {showAddForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h3>新建提醒</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>宠物（可选）</label>
                  <select
                    value={formData.pet_id}
                    onChange={(e) => setFormData({ ...formData, pet_id: e.target.value })}
                  >
                    <option value="">不关联宠物</option>
                    {pets.map(pet => (
                      <option key={pet.id} value={pet.id}>{pet.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>提醒类型 *</label>
                  <select
                    value={formData.reminder_type}
                    onChange={(e) => setFormData({ ...formData, reminder_type: e.target.value })}
                    required
                  >
                    <option value="custom">自定义</option>
                    <option value="vaccine">疫苗接种</option>
                    <option value="checkup">定期体检</option>
                    <option value="medication">用药提醒</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>标题 *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="例如：小白疫苗接种"
                  />
                </div>

                <div className="form-group">
                  <label>描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    placeholder="提醒详情..."
                  />
                </div>

                <div className="form-group">
                  <label>提醒时间 *</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn" style={{ flex: 1 }}>
                    创建提醒
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddForm(false)}
                    style={{ flex: 1 }}
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 提醒列表 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            加载中...
          </div>
        ) : reminders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
            <p>还没有提醒</p>
            <button className="btn" onClick={() => setShowAddForm(true)} style={{ marginTop: '1rem' }}>
              创建第一个提醒
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reminders.map(reminder => {
              const isReminderOverdue = isOverdue(reminder.scheduled_time, reminder.status);

              return (
                <div
                  key={reminder.id}
                  style={{
                    padding: '1.5rem',
                    border: `2px solid ${isReminderOverdue ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    background: isReminderOverdue ? '#fef2f2' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{getReminderTypeIcon(reminder.reminder_type)}</span>
                        <h3 style={{ margin: 0 }}>{reminder.title}</h3>
                        {reminder.pet_name && (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            background: '#667eea22',
                            color: '#667eea',
                            borderRadius: '12px',
                            fontSize: '0.85rem'
                          }}>
                            {reminder.pet_name}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.9rem', color: '#666' }}>
                        <span>📅 {formatDateTime(reminder.scheduled_time)}</span>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: getStatusColor(reminder.status) + '22',
                            color: getStatusColor(reminder.status),
                            borderRadius: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {getStatusLabel(reminder.status)}
                        </span>
                        {isReminderOverdue && (
                          <span style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ 已逾期</span>
                        )}
                      </div>

                      {reminder.description && (
                        <p style={{ margin: '0.5rem 0', color: '#666', lineHeight: 1.6 }}>
                          {reminder.description}
                        </p>
                      )}

                      <div style={{ fontSize: '0.85rem', color: '#999' }}>
                        类型: {getReminderTypeLabel(reminder.reminder_type)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                      {reminder.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(reminder.id, 'completed')}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
                          >
                            ✓ 完成
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(reminder.id, 'dismissed')}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#6b7280',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
                          >
                            忽略
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(reminder.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reminders;
