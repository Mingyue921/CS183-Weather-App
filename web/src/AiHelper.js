import React, { useState } from 'react';
import { apiRequest } from './api';
import './AiHelper.css';

const iconBase = '/img/105';

/**
 * Author: Huang Yichen
 */
function AiHelper() {
  const [msg, setMsg] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const suggestions = [
    'What is suitable to wear today?',
    'Will it rain in the next few hours?',
    'Help me compare the weather between A and B.',
  ];

  /**
   * Author: Huang Yichen
   */
  const sendMessage = async () => {
    const text = msg.trim();
    if (!text || loading) return;

    const nextHistory = [...history, { role: 'user', content: text }];
    setHistory(nextHistory);
    setLoading(true);
    setReply('');

    try {
      const data = await apiRequest('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          city: 'Fuzhou',
          messages: nextHistory,
        }),
      });
      const assistantReply = data.reply || 'No reply returned.';
      setReply(assistantReply);
      setHistory([...nextHistory, { role: 'assistant', content: assistantReply }]);
      setMsg('');
    } catch (err) {
      setReply(err.message || 'AI request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ai-helper-page">
      <header className="ai-helper-topbar">
        <button className="ai-icon-button" aria-label="Notifications">
          <img src={`${iconBase}/%E9%93%83%E9%93%9B%20(3)%201.svg`} alt="" />
        </button>
        <div className="ai-avatar" aria-label="User avatar" />
      </header>

      <section className="ai-hero">
        <div className="ai-hero-copy">
          <h1>
            Hello,
            <span>How Can I Assist You Today?</span>
          </h1>

          <div className="ai-suggestions" aria-label="Suggested questions">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setMsg(suggestion)}
              >
                <span>{suggestion}</span>
                <span className="ai-arrow">&gt;</span>
              </button>
            ))}
          </div>
        </div>

        <div className="ai-robot-area" aria-hidden="true">
          <div className="ai-speech-bubble">You can ask me like this!</div>
          <img className="ai-robot" src={`${iconBase}/robot.svg`} alt="" />
        </div>
      </section>

      <section className="ai-input-panel" aria-label="AI command input">
        <textarea
          value={msg}
          onChange={(event) => setMsg(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Initiate a query or send a command to the AI ......"
        />

        {reply && (
          <div className="ai-reply-box">
            {reply}
          </div>
        )}

        <div className="ai-input-actions">
          <button type="button" className="ai-link-button" aria-label="Attach a link">
            <img src={`${iconBase}/link.svg`} alt="" />
          </button>

          <div className="ai-send-actions">
            <button type="button" className="ai-sound-button" aria-label="Voice input">
              <img src={`${iconBase}/sound.svg`} alt="" />
            </button>
            <button type="button" className="ai-send-button" aria-label="Send message" onClick={sendMessage} disabled={loading}>
              <img src={`${iconBase}/send.svg`} alt="" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AiHelper;
