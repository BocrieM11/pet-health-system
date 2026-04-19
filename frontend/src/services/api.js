import axios from 'axios';

// 根据环境自动切换API地址
// 开发环境: http://localhost:3001/api
// 生产环境: 从环境变量读取（Vercel部署时配置）
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 自动添加Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理401错误（未登录）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 可以在这里跳转到登录页
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 用户认证API
export const authAPI = {
  // 注册
  register: (userData) => api.post('/auth/register', userData),

  // 登录
  login: (credentials) => api.post('/auth/login', credentials),

  // 获取当前用户信息
  getCurrentUser: () => api.get('/auth/me'),

  // 保存Token和用户信息到本地
  saveAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // 获取本地保存的用户信息
  getLocalUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // 退出登录
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // 检查是否已登录
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// 宠物相关API
export const petAPI = {
  // 获取所有宠物
  getAllPets: () => api.get('/pets'),

  // 获取单个宠物
  getPetById: (id) => api.get(`/pets/${id}`),

  // 添加宠物
  addPet: (petData) => api.post('/pets', petData),

  // 更新宠物信息
  updatePet: (id, petData) => api.put(`/pets/${id}`, petData),

  // 删除宠物
  deletePet: (id) => api.delete(`/pets/${id}`),
};

// 健康记录相关API
export const healthAPI = {
  // 获取宠物的健康记录
  getHealthRecords: (petId) => api.get(`/health/pet/${petId}`),

  // 添加健康记录
  addHealthRecord: (recordData) => api.post('/health', recordData),

  // 获取疫苗记录
  getVaccinations: (petId) => api.get(`/health/vaccinations/${petId}`),

  // 添加疫苗记录
  addVaccination: (vaccinationData) => api.post('/health/vaccinations', vaccinationData),
};

// 文件上传API
export const uploadAPI = {
  // 上传宠物头像
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    return api.post('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// 统计数据API
export const statisticsAPI = {
  // 获取健康趋势数据
  getHealthTrend: (petId, period = 'week') =>
    api.get(`/statistics/health-trend/${petId}?period=${period}`),

  // 获取活动量统计
  getActivity: (petId, period = 'week') =>
    api.get(`/statistics/activity/${petId}?period=${period}`),

  // 获取健康概览
  getOverview: (petId) =>
    api.get(`/statistics/overview/${petId}`),

  // 获取体重变化趋势
  getWeightTrend: (petId, period = 'month') =>
    api.get(`/statistics/weight-trend/${petId}?period=${period}`),
};

export default api;
