import React, { useState } from 'react';
import Sidebar from './Sidebar';
import './Setting.css';

const adviceItems = [
  {
    id: 'warning',
    emoji: '⚠️',
    title: 'Early Warning',
    subtitle: 'Weather alert',
    contentTitle: '预警建议',
    content: '当前天气存在雷暴、大风或强降雨风险。外出请随时关注天气变化，避免河道、空旷地和高树下停留。必要时暂缓出行。',
  },
  {
    id: 'diet',
    emoji: '🍽️',
    title: 'Dietary Recommendations',
    subtitle: 'Eat smart today',
    contentTitle: '饮食建议',
    content: '建议少吃辛辣油腻，选择清淡易消化的蔬菜、水果、粥品与汤类。炎热时多补充水分，湿冷时宜温热养胃。',
  },
  {
    id: 'travel',
    emoji: '🚗',
    title: 'Travel Advice',
    subtitle: 'Go safely',
    contentTitle: '出行建议',
    content: '道路可能湿滑、能见度下降。驾车请减速慢行，骑行佩戴头盔并备雨具。尽量优先选择地铁、公交等公共交通。',
  },
  {
    id: 'dressing',
    emoji: '👕',
    title: 'Dressing Advice',
    subtitle: 'What to wear',
    contentTitle: '穿衣建议',
    content: '早晚温差较大，建议“薄外套 + 长袖内搭”组合。若有降雨，额外带一件轻便雨衣，并注意足部保暖。',
  },
  {
    id: 'activity',
    emoji: '🏃',
    title: 'Outdoor Activities',
    subtitle: 'Exercise tips',
    contentTitle: '活动建议',
    content: '适合进行短时散步、慢跑等轻度户外活动。若出现暴雨或大风天气，应避免登山、露营等高风险活动。',
  },
];

export default function Setting() {
  const [selectedAdvice, setSelectedAdvice] = useState(null);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="setting-page">
          <div className="page-header">
            <img src="/img/105/setting.svg" alt="setting" className="header-icon" />
            <div className="header-right">
              <img src="/img/105/bell.svg" alt="bell" className="header-icon" />
              <img src="/img/105/avatar.svg" alt="avatar" className="avatar-icon" />
            </div>
          </div>

          <div className="user-card">
            <img src="/img/105/avatar.svg" alt="user avatar" className="user-avatar" />
            <div className="user-info">
              <div className="user-name-row">
                <h2 className="user-name">Sunny</h2>
                <span className="vip-tag">VIP member</span>
              </div>
              <p className="user-id">ID: 2847391 · Used for 247 days</p>
              <div className="progress-bar">
                <div className="progress-fill"></div>
                <span className="progress-text">63%</span>
              </div>
              <p className="expire-text">Membership expires: 2026.05.12</p>
            </div>
          </div>

          <div className="two-column-container">
            <div className="left-column">
              <div className="section-title">Living Index</div>
              <div className="index-grid">
                {adviceItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="index-item"
                    onClick={() => setSelectedAdvice(item)}
                  >
                    <span className="item-icon">{item.emoji}</span>
                    <span>{item.title}</span>
                  </button>
                ))}
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

          <div className="section-title">Settings and Help</div>
          <div className="setting-list">
            <div className="setting-row">
              <img src="/img/105/account.svg" alt="" className="row-icon" />
              <span>Account Information</span>
              <span className="arrow">›</span>
            </div>
            <div className="setting-row">
              <img src="/img/105/theme.svg" alt="" className="row-icon" />
              <span>Themed Appearance</span>
              <span className="arrow">›</span>
            </div>
            <div className="setting-row">
              <img src="/img/105/lock.svg" alt="" className="row-icon" />
              <span>Privacy Security</span>
              <span className="arrow">›</span>
            </div>
            <div className="setting-row">
              <img src="/img/105/help.svg" alt="" className="row-icon" />
              <span>Help and Feedback</span>
              <span className="arrow">›</span>
            </div>
            <div className="setting-row">
              <img src="/img/105/about.svg" alt="" className="row-icon" />
              <span>About us</span>
              <span className="arrow">›</span>
            </div>
          </div>

          {selectedAdvice && (
            <div className="advice-modal-overlay" onClick={() => setSelectedAdvice(null)}>
              <div className="advice-modal" onClick={(e) => e.stopPropagation()}>
                <div className="advice-modal-header">
                  <div>
                    <span className="advice-modal-emoji">{selectedAdvice.emoji}</span>
                    <h3>{selectedAdvice.title}</h3>
                  </div>
                  <button
                    type="button"
                    className="advice-modal-close"
                    onClick={() => setSelectedAdvice(null)}
                  >
                    ×
                  </button>
                </div>
                <div className="advice-modal-body">
                  <div className="advice-modal-label">{selectedAdvice.contentTitle}</div>
                  <p>{selectedAdvice.content}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}