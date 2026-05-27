import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { apiRequest } from './api';
import './Setting.css';

const defaultContext = {
  city: 'Fuzhou',
  lat: 26.08,
  lon: 119.3,
  weather: {
    temp: 24,
    description: 'current weather',
    humidity: 70,
    windSpeed: 3,
    uvi: 0,
  },
};

const adviceItems = [
  { id: 'warning', type: 'warning', icon: '\u26A0\uFE0F', title: 'Early Warning', subtitle: 'Government weather alerts' },
  { id: 'diet', type: 'diet', icon: '\uD83C\uDF7D\uFE0F', title: 'Food Advice', subtitle: 'AI dietary suggestions' },
  { id: 'travel', type: 'travel', icon: '\uD83D\uDE97', title: 'Travel Advice', subtitle: 'AI travel guidance' },
  { id: 'clothing', type: 'clothing', icon: '\uD83D\uDC55', title: 'Clothing Advice', subtitle: 'AI outfit suggestions' },
  { id: 'activity', type: 'activity', icon: '\uD83C\uDFC3', title: 'Activity Advice', subtitle: 'AI exercise suggestions' },
];

const serviceItems = [
  { icon: '\uD83C\uDF24\uFE0F', title: 'Solar Terms' },
  { icon: '\uD83D\uDCD6', title: 'Weather Wiki' },
  { icon: '\uD83D\uDCCD', title: 'City Management' },
  { icon: '\u2601\uFE0F', title: 'Offline Data' },
];

const settingRows = [
  { icon: '/img/105/account.svg', title: 'Account Information' },
  { icon: '/img/105/theme.svg', title: 'Themed Appearance' },
  { icon: '/img/105/lock.svg', title: 'Privacy Security' },
  { icon: '/img/105/help.svg', title: 'Help and Feedback' },
  { icon: '/img/105/about.svg', title: 'About us' },
];

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  } catch {
    return {};
  }
}

function getWeatherContext() {
  try {
    return { ...defaultContext, ...JSON.parse(localStorage.getItem('currentWeatherContext') || '{}') };
  } catch {
    return defaultContext;
  }
}

export default function Setting() {
  const [user, setUser] = useState(getStoredUser);
  const [selectedAdvice, setSelectedAdvice] = useState(null);
  const [modalContent, setModalContent] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      if (!localStorage.getItem('token')) return;
      try {
        const data = await apiRequest('/api/auth/me');
        setUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
      } catch {
        setUser(getStoredUser());
      }
    };
    loadUser();
  }, []);

  const openAdvice = async (item) => {
    const context = getWeatherContext();
    setSelectedAdvice(item);
    setModalContent('');
    setModalLoading(true);

    try {
      if (item.type === 'warning') {
        const data = await apiRequest(`/api/weather/alerts?lat=${encodeURIComponent(context.lat)}&lon=${encodeURIComponent(context.lon)}`);
        if (data.warning) {
          setModalContent(data.warning);
        } else if (data.alerts?.length) {
          setModalContent(data.alerts.map((alert) => `${alert.event}: ${alert.description}`).join('\n\n'));
        } else {
          setModalContent(`No active government weather alerts for ${context.city}.`);
        }
        return;
      }

      const data = await apiRequest('/api/ai/advice', {
        method: 'POST',
        body: JSON.stringify({
          type: item.type,
          city: context.city,
          weather: context.weather,
        }),
      });
      setModalContent(data.reply || 'No advice returned.');
    } catch (err) {
      setModalContent(err.message || 'This service is temporarily unavailable.');
    } finally {
      setModalLoading(false);
    }
  };

  const nickname = user.nickname || 'Sunny Nuan';
  const userId = user.id || '0000001';

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
            <img src={user.avatarUrl || '/img/105/avatar.svg'} alt="user avatar" className="user-avatar" />
            <div className="user-info">
              <h2 className="user-name">{nickname}</h2>
              <p className="user-id">ID: {userId}</p>
              <p className="user-email">{user.email || 'No email available'}</p>
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
                    className="index-item clickable"
                    onClick={() => openAdvice(item)}
                  >
                    <span className="item-icon">{item.icon}</span>
                    <span>{item.title}</span>
                    <small>{item.subtitle}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="right-column">
              <div className="section-title">My Service</div>
              <div className="service-grid">
                {serviceItems.map((item) => (
                  <div className="service-item" key={item.title}>
                    <span className="item-icon">{item.icon}</span>
                    <span>{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="section-title">Settings and Help</div>
          <div className="setting-list">
            {settingRows.map((row) => (
              <div className="setting-row" key={row.title}>
                <img src={row.icon} alt="" className="row-icon" />
                <span>{row.title}</span>
                <span className="arrow">&gt;</span>
              </div>
            ))}
          </div>

          {selectedAdvice && (
            <div className="advice-modal-overlay" onClick={() => setSelectedAdvice(null)}>
              <div className="advice-modal" onClick={(event) => event.stopPropagation()}>
                <div className="advice-modal-header">
                  <div>
                    <span className="advice-modal-emoji">{selectedAdvice.icon}</span>
                    <h3>{selectedAdvice.title}</h3>
                  </div>
                  <button type="button" className="advice-modal-close" onClick={() => setSelectedAdvice(null)}>
                    x
                  </button>
                </div>
                <div className="advice-modal-body">
                  <div className="advice-modal-label">{selectedAdvice.subtitle}</div>
                  <p>{modalLoading ? 'Loading...' : modalContent}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
