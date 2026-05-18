import React from 'react';
import Sidebar from './Sidebar';
import './Setting.css';

export default function Setting() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="setting-page">
          {/* 顶部栏 */}
          <div className="page-header">
  < img src="/img/105/setting.svg" alt="setting" className="header-icon" />
  <div className="header-right">
    < img src="/img/105/bell.svg" alt="bell" className="header-icon" />
    < img src="/img/105/avatar.svg" alt="avatar" className="avatar-icon" />
  </div>
</div>

          {/* 用户信息区域 */}
          <div className="user-card">
            < img src="/img/105/avatar.svg" alt="user avatar" className="user-avatar" />
            <div className="user-info">
              <div className="user-name-row">
                <h2 className="user-name">Sunny</h2>
                <span className="vip-tag">VIP member</span>
              </div>
              <p className="user-id">ID: 2847391 · Used for 247 days</p >
              <div className="progress-bar">
                <div className="progress-fill"></div>
                <span className="progress-text">63%</span>
              </div>
              <p className="expire-text">Membership expires: 2026.05.12</p >
            </div>
          </div>

          {/* 左右双栏布局 —— 全部保留 emoji 不动 */}
          <div className="two-column-container">
            <div className="left-column">
              <div className="section-title">Living Index</div>
              <div className="index-grid">
                <div className="index-item">
                  <span className="item-icon">⚠️</span>
                  <span>Early Warning</span>
                </div>
                <div className="index-item">
                  <span className="item-icon">🍽️</span>
                  <span>Dietary Recommendations</span>
                </div>
                <div className="index-item">
                  <span className="item-icon">🚗</span>
                  <span>Travel Advice</span>
                </div>
                <div className="index-item">
                  <span className="item-icon">👕</span>
                  <span>Dressing Advice</span>
                </div>
                <div className="index-item">
                  <span className="item-icon">🏃</span>
                  <span>Outdoor Activities</span>
                </div>
              </div>
            </div>
            <div className="right-column">
              <div className="section-title">My Service</div>
              <div className="service-grid">
                <div className="service-item">
                  <span className="item-icon">🌱</span>
                  <span>Solar Terms</span>
                </div>
                <div className="service-item">
                  <span className="item-icon">📖</span>
                  <span>Weather Wiki</span>
                </div>
                <div className="service-item">
                  <span className="item-icon">📍</span>
                  <span>City Management</span>
                </div>
                <div className="service-item">
                  <span className="item-icon">☁️</span>
                  <span>Offline Data</span>
                </div>
              </div>
            </div>
          </div>

          {/* 设置列表 —— 仅这里改成你的SVG图标 */}
          <div className="section-title">Settings and Help</div>
          <div className="setting-list">
            <div className="setting-row">
              < img src="/img/105/account.svg" alt="" className="row-icon" />
              <span>Account Information</span>
              <span className="arrow">></span>
            </div>
            <div className="setting-row">
              < img src="/img/105/theme.svg" alt="" className="row-icon" />
              <span>Themed Appearance</span>
              <span className="arrow">></span>
            </div>
            <div className="setting-row">
              < img src="/img/105/lock.svg" alt="" className="row-icon" />
              <span>Privacy Security</span>
              <span className="arrow">></span>
            </div>
            <div className="setting-row">
              < img src="/img/105/help.svg" alt="" className="row-icon" />
              <span>Help and Feedback</span>
              <span className="arrow">></span>
            </div>
            <div className="setting-row">
              < img src="/img/105/about.svg" alt="" className="row-icon" />
              <span>About us</span>
              <span className="arrow">></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}