import React from 'react';

function Settings() {
  return (
    <div>
      <h2>App Settings</h2>
      <p style={{marginBottom:'25px'}}>Customize your weather app</p >

      <div style={{marginBottom:'20px'}}>
        <div style={{
          border:'1px solid #ccc',
          borderRadius:'6px',
          padding:'15px',
          marginBottom:'10px'
        }}>
          <h4 style={{margin:'0 0 8px'}}>Theme Mode</h4>
          <button style={{marginRight:'10px', padding:'6px 12px'}}>Light</button>
          <button style={{padding:'6px 12px'}}>Dark</button>
        </div>

        <div style={{
          border:'1px solid #ccc',
          borderRadius:'6px',
          padding:'15px',
          marginBottom:'10px'
        }}>
          <h4 style={{margin:'0 0 8px'}}>Temperature Unit</h4>
          <button style={{marginRight:'10px', padding:'6px 12px'}}>Celsius</button>
          <button style={{padding:'6px 12px'}}>Fahrenheit</button>
        </div>

        <div style={{
          border:'1px solid #ccc',
          borderRadius:'6px',
          padding:'15px'
        }}>
          <h4 style={{margin:'0 0 8px'}}>Notification</h4>
          <input type="checkbox" /> Enable daily weather alert
        </div>
      </div>
    </div>
  );
}

export default Settings;