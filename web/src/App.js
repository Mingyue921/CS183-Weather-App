import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import SavedLocation from './SavedLocation';
import Calendar from './Calendar';
import AiHelper from './AiHelper';
import Settings from './Settings';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div style={{ flex: 1, padding: '20px', backgroundColor: '#f9f9f9' }}>
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'saved' && <SavedLocation />}
        {currentPage === 'calendar' && <Calendar />}
        {currentPage === 'ai' && <AiHelper />}
        {currentPage === 'settings' && <Settings />}
      </div>
    </div>
  );
}

export default App;