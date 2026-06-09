import React from 'react';
import './Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';

const iconBase = '/img/105';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: `${iconBase}/dashboard 1.svg` },
  { path: '/aihelper', label: 'AI Helper', icon: `${iconBase}/AI%E5%8A%A9%E6%89%8B@2x%201.svg` },
  { path: '/savedlocation', label: 'Saved Location', icon: `${iconBase}/%E6%94%B6%E8%97%8F%20(2)%201.svg` },
  { path: '/calendar', label: 'Solar Terms', icon: `${iconBase}/%E6%97%A5%E5%8E%86%201.svg` },
  { path: '/setting', label: 'Setting', icon: `${iconBase}/Vector-2.svg` },
];

// 关键：接收 isLogin、user、onLogout 三个 props
/**
 * Author: Huang Yichen
 */
const Sidebar = ({ isLogin, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="sidebar">
      <div
        className="sidebar-header"
        onClick={() => {
          // 关键：只有未登录时点击才跳登录页
          if (!isLogin) navigate('/login');
        }}
        style={{ cursor: !isLogin ? 'pointer' : 'default' }}
      >
        <img
          src={
            isLogin
              ? user?.avatar || `${iconBase}/Ellipse 3.svg`
              : `${iconBase}/Ellipse 3.svg`
          }
          alt="Logo"
          className="logo-icon"
        />
        <span className="logo-text">
          {isLogin ? user?.nickname || 'User' : 'Click to Log In'}
        </span>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <div
            key={item.path}
            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <img src={item.icon} alt="" />
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* 关键：只有已登录时才显示 Log Out 按钮 */}
      {isLogin && (
        <div className="sidebar-logout" onClick={onLogout}>
          <img src={`${iconBase}/%E9%80%80%E5%87%BA%E7%99%BB%E5%BD%95%20(2)%201.svg`} alt="" />
          <span>Log Out</span>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
