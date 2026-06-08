import React, { useState } from 'react';
import { apiRequest } from './api';
import { useNavigate } from 'react-router-dom';
import './Login.css';

// 关键：接收 setIsLogin 和 setUser 两个 props
/**
 * Author: Yang Qiyuan
 */
export default function Login({ setIsLogin, setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Author: Yang Qiyuan
   */
  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      alert('Please enter email and password.');
      return;
    }

    if (isRegisterMode && password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiRequest(`/api/auth/${isRegisterMode ? 'register' : 'login'}`, {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          password,
          nickname: nickname.trim() || undefined,
        }),
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      setIsLogin(true);
      setUser(data.user); // 关键：登录成功后更新全局 user 状态
      navigate('/');
    } catch (err) {
      alert(err.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <img src="/img/105/rains.svg" alt="rains-bg" className="bg-rains" />
      <img src="/img/105/sun.svg" alt="sun-cloud" className="bg-sun" />

      <div className="login-card">
        <h1 className="login-title">{isRegisterMode ? 'Sign Up' : 'Log In'}</h1>

        <input
          className="input-field"
          placeholder="Email Address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        {isRegisterMode && (
          <input
            className="input-field"
            placeholder="Nickname"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
          />
        )}

        <div className="password-wrap">
          <input
            type="password"
            className="input-field"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSubmit();
            }}
          />
          <span className="eye">Show</span>
        </div>

        <div className="forgot">Forget Password?</div>
        <button className="login-btn" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting...' : isRegisterMode ? 'Sign Up' : 'Log In'}
        </button>

        <div className="signup">
          {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span onClick={() => setIsRegisterMode((current) => !current)}>
            {isRegisterMode ? 'Log In' : 'Sign Up'}
          </span>
        </div>
      </div>
    </div>
  );
}