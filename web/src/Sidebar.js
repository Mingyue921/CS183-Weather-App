import React from 'react';
import './Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  // 获取当前页面路径，用来自动高亮
  const location = useLocation();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        < img src="/img/105/Ellipse 3.svg" alt="Logo" className="logo-icon" />
        <span className="logo-text">Climate</span>
      </div>

      <nav className="sidebar-menu">
        {/* 自动判断是否当前页，自动加 active 高亮 */}
        <div 
          className={`menu-item ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          < img src="/img/105/dashboard 1.svg" alt="icon" />
          <span>Dashboard</span>
        </div>

        <div 
          className={`menu-item ${location.pathname === '/aihelper' ? 'active' : ''}`}
          onClick={() => navigate('/aihelper')}
        >
          < img src="\img\105\AI助手@2x 1.svg" alt="icon" />
          <span>AI Helper</span>
        </div>

        <div 
          className={`menu-item ${location.pathname === '/savedlocation' ? 'active' : ''}`}
          onClick={() => navigate('/savedlocation')}
        >
          < img src="\img\105\收藏 (2) 1.svg" alt="icon" />
          <span>Saved Location</span>
        </div>

        <div 
          className={`menu-item ${location.pathname === '/calendar' ? 'active' : ''}`}
          onClick={() => navigate('/calendar')}
        >
          < img src="\img\105\日历 1.svg" alt="icon" />
          <span>Calendar</span>
        </div>

        <div 
          className={`menu-item ${location.pathname === '/setting' ? 'active' : ''}`}
          onClick={() => navigate('/setting')}
        >
          < img src="/img/105/vector-2.svg" alt="icon" />
          <span>Setting</span>
        </div>
      </nav>

      <div className="sidebar-logout">
        < img src="/img/105/退出登录 (2) 1.svg" alt="Logout" />
        <span>Log Out</span>
      </div>
    </div>
  );
};

export default Sidebar;