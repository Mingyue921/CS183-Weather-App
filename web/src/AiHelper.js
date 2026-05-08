import React, { useState } from 'react';

function AiHelper() {
  const [msg, setMsg] = useState('');

  return (
    <div>
      <h2>AI Weather Helper</h2>
      <p style={{marginBottom:'20px'}}>Ask anything about weather</p >

      <div style={{marginBottom:'30px'}}>
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Type your question here..."
          style={{
            width:'100%',
            height:'120px',
            padding:'10px',
            borderRadius:'6px',
            border:'1px solid #ccc'
          }}
        />
      </div>

      <button
        style={{
          padding:'10px 25px',
          border:'none',
          borderRadius:'6px',
          backgroundColor:'#ddd',
          cursor:'pointer'
        }}
      >
        Send to AI
      </button>

      <div style={{marginTop:'30px'}}>
        <h4>AI Reply</h4>
        <div style={{
          border:'1px solid #ccc',
          borderRadius:'6px',
          padding:'15px',
          minHeight:'80px'
        }}>
          AI answer will show here...
        </div>
      </div>
    </div>
  );
}

export default AiHelper;