import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './Login';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import AiHelper from './AiHelper';
import SavedLocation from './SavedLocation';
import Calendar from './Calendar';
import Setting from './Setting';
import { apiRequest } from './api';

function App() {
  const [isLogin, setIsLogin] = useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const data = await apiRequest('/api/auth/me');
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        setIsLogin(true);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        setIsLogin(false);
      }
    };

    restoreSession();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setIsLogin(false);
  };

  return (
    <Router>
      {/* 用空标签 <> 包裹整个判断，解决JSX语法错误 */}
      <>
        {!isLogin ? (
          <Routes>
            <Route path="/login" element={<Login setIsLogin={setIsLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        ) : (
          <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
            <Sidebar onLogout={handleLogout} style={{ width: '240px', flexShrink: 0 }} />
            <div style={{ flex: 1, overflow: 'auto' }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/aihelper" element={<AiHelper />} />
                <Route path="/savedlocation" element={<SavedLocation />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/setting" element={<Setting />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        )}
      </>
    </Router>
  );
}

export default App;
