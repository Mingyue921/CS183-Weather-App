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

/**
 * Author: Huang Yichen
 */
function App() {
  const [isLogin, setIsLogin] = useState(() => !!localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    /**
     * Author: Huang Yichen
     */
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLogin(false);
        setUser(null);
        return;
      }
      try {
        const data = await apiRequest('/api/auth/me');
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        setUser(data.user);
        setIsLogin(true);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        setIsLogin(false);
        setUser(null);
      }
    };
    restoreSession();
  }, []);

  /**
   * Author: Huang Yichen
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setIsLogin(false);
    setUser(null);
  };

  return (
    <Router>
      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        {/* 关键：把 isLogin 和 user 传给 Sidebar */}
        <Sidebar
          isLogin={isLogin}
          user={user}
          onLogout={handleLogout}
        />
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/aihelper" element={<AiHelper />} />
            <Route path="/savedlocation" element={<SavedLocation />} />
            <Route path="/calendar" element={<Calendar />} />
            {/* 关键：把 isLogin 和 user 传给 Setting */}
            <Route
              path="/setting"
              element={<Setting isLogin={isLogin} user={user} />}
            />
            {/* 关键：把 setIsLogin 和 setUser 传给 Login */}
            <Route path="/login" element={<Login setIsLogin={setIsLogin} setUser={setUser} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;