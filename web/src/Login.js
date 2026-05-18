import React from 'react';
import './Login.css';

export default function Login({ setIsLogin }) {
  const handleLogin = () => {
    setIsLogin(true);
  };

  return (
    <div className="login-page">
      {/* 底层：rains 背景图（和你img标签写法完全一致） */}
      < img src="/img/105/rains.svg" alt="rains-bg" className="bg-rains" />

      {/* 上层：太阳云图 */}
      < img src="/img/105/sun.svg" alt="sun-cloud" className="bg-sun" />

      {/* 登录卡片 */}
      <div className="login-card">
        <h1 className="login-title">Log In</h1>
        <input className="input-field" placeholder="Email Adress" />
        <div className="password-wrap">
          <input type="password" className="input-field" placeholder="Password" />
          <span className="eye">👁</span>
        </div>
        <div className="forgot">Forget Password?</div>
        <button className="login-btn" onClick={handleLogin}>Log In</button>
        <div className="signup">
          Don't have an account? <span>Sign Up</span>
        </div>
      </div>
    </div>
  );
}