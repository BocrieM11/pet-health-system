import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import PetList from './pages/PetList';
import PetDetail from './pages/PetDetail';
import AddPet from './pages/AddPet';
import Login from './pages/Login';
import Register from './pages/Register';
import Statistics from './pages/Statistics';
import HealthRecordForm from './pages/HealthRecordForm';
import AIAnalysis from './pages/AIAnalysis';
import Reminders from './pages/Reminders';
import { authAPI } from './services/api';
import './App.css';

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 获取本地用户信息
    const localUser = authAPI.getLocalUser();
    setUser(localUser);
  }, [location]); // 路由变化时重新检查用户状态

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <h1>🐾 宠物健康检测系统</h1>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/">我的宠物</Link>
            <Link to="/add">添加宠物</Link>
            <Link to="/health-record">📝 健康记录</Link>
            <Link to="/reminders">🔔 提醒</Link>
            <Link to="/ai-analysis">🤖 AI分析</Link>
            <Link to="/statistics">📊 数据分析</Link>
            <span style={{ color: 'white', opacity: 0.9 }}>
              👤 {user.username}
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem' }}
            >
              退出
            </button>
          </>
        ) : (
          <>
            <Link to="/login">登录</Link>
            <Link to="/register">注册</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<PetList />} />
            <Route path="/pet/:id" element={<PetDetail />} />
            <Route path="/pet/:id/edit" element={<AddPet />} />
            <Route path="/add" element={<AddPet />} />
            <Route path="/health-record" element={<HealthRecordForm />} />
            <Route path="/health-record/:petId" element={<HealthRecordForm />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/ai-analysis" element={<AIAnalysis />} />
            <Route path="/ai-analysis/:petId" element={<AIAnalysis />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
