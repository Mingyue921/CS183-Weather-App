import React, { useState, useEffect } from 'react';

function SavedLocation() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('weatherFavorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  return (
    <div>
      <h2>Saved Location</h2>
      {favorites.length === 0 ? (
        <p>No favorite cities yet</p >
      ) : (
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
          {favorites.map((city, idx) => (
            <div key={idx} style={{ border:'1px solid #ccc', padding:'12px', borderRadius:'8px' }}>
              <p>{city}</p >
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedLocation;