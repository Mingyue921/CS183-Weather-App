import React from 'react';

function Sidebar({ currentPage, setCurrentPage }) {
  const menuList = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'ai', name: 'AI Helper' },
    { id: 'saved', name: 'Saved Location' },
    { id: 'calendar', name: 'Calendar' },
    { id: 'settings', name: 'Settings' }
  ];

  return (
    <div style={{
      width: '200px',
      background: '#f5f5f5',
      height: '100vh',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <h3>Weather App</h3>
      {menuList.map(item => (
        <div
          key={item.id}
          onClick={() => setCurrentPage(item.id)}
          style={{
            padding: '10px 12px',
            margin: '8px 0',
            borderRadius: '6px',
            cursor: 'pointer',
            background: currentPage === item.id ? '#ddd' : 'transparent'
          }}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}

export default Sidebar;