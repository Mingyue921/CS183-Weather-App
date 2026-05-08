import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [city, setCity] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const API_KEY = process.env.REACT_APP_WEATHER_KEY;

  useEffect(() => {
    const saved = localStorage.getItem('weatherFavorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const fetchWeather = async () => {
    if (!API_KEY) {
      alert('API Key missing in .env file');
      return;
    }
    if (!city.trim()) {
      alert('请输入城市名');
      return;
    }
    try {
      let res1 = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=en`
      );
      let data1 = await res1.json();
      setCurrentWeather(data1);

      let res2 = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=en`
      );
      let data2 = await res2.json();
      setForecast(data2.list.filter((_, idx) => idx % 8 === 0));
    } catch (err) {
      console.log(err);
      alert('获取天气失败，请检查城市名');
    }
  };

  const toggleFavorite = () => {
    if (!city) return;
    if (favorites.includes(city)) {
      setFavorites(favorites.filter(x => x !== city));
    } else {
      setFavorites([...favorites, city]);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* 左侧主天气区域 */}
      <div style={{ flex: 3 }}>
        {/* 主天气卡片 */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>
                {currentWeather ? currentWeather.name : ''}
              </p >
              {currentWeather && (
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p >
              )}
            </div>
            {currentWeather && (
              <p style={{ fontSize: '12px', color: '#666' }}>
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p >
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
            <div>
              <p style={{ fontSize: '48px', fontWeight: 'bold', margin: 0 }}>
                {currentWeather ? `${Math.round(currentWeather.main.temp)}°C` : ''}
              </p >
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                {currentWeather ? currentWeather.weather[0].description : ''}
              </p >
              {currentWeather && (
                <p style={{ fontSize: '12px', color: '#666' }}>
                  {Math.round(currentWeather.main.temp_min)}/{Math.round(currentWeather.main.temp_max)}°C | {currentWeather.wind.deg}° wind
                </p >
              )}
            </div>

            <div style={{ 
              width: '120px', 
              height: '120px', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {currentWeather && (
                < img 
                  src={`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@4x.png`}
                  alt="weather icon"
                  style={{ width: '100%', height: 'auto' }}
                />
              )}
            </div>
          </div>

          {currentWeather && (
            <div style={{ display: 'flex', gap: '30px', fontSize: '12px', color: '#666' }}>
              <p>💧 {currentWeather.main.humidity}% Excellent</p >
              <p>🍃 Force {Math.round(currentWeather.wind.speed)}</p >
            </div>
          )}
        </div>

        {/* 下方四个数据卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
            <p style={{ margin: '0 0 10px', fontWeight: 'bold' }}>Wind</p >
            <p style={{ fontSize: '12px', color: '#666' }}>Today wind speed</p >
            <p style={{ fontSize: '18px', fontWeight: '500', margin: '10px 0' }}>
              {currentWeather ? `${currentWeather.wind.speed} km/h` : ''}
            </p >
          </div>

          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
            <p style={{ margin: '0 0 10px', fontWeight: 'bold' }}>Rain Chance</p >
            <p style={{ fontSize: '12px', color: '#666' }}>Today rain chance</p >
            <p style={{ fontSize: '18px', fontWeight: '500', margin: '10px 0' }}>
              {currentWeather ? `${currentWeather.rain?.['1h'] || 0}%` : ''}
            </p >
          </div>

          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
            <p style={{ margin: '0 0 10px', fontWeight: 'bold' }}>Pressure</p >
            <p style={{ fontSize: '12px', color: '#666' }}>Today Pressure</p >
            <p style={{ fontSize: '18px', fontWeight: '500', margin: '10px 0' }}>
              {currentWeather ? `${currentWeather.main.pressure} hPa` : ''}
            </p >
          </div>

          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
            <p style={{ margin: '0 0 10px', fontWeight: 'bold' }}>UV Index</p >
            <p style={{ fontSize: '12px', color: '#666' }}>Today UV Index</p >
            <p style={{ fontSize: '18px', fontWeight: '500', margin: '10px 0' }}>
              {currentWeather ? currentWeather.uvi : ''}
            </p >
            {currentWeather && (
              <p style={{ fontSize: '12px', color: '#666' }}>
                {currentWeather.uvi < 3 ? 'Low' : currentWeather.uvi < 6 ? 'Moderate' : 'High'}
              </p >
            )}
          </div>
        </div>
      </div>

      {/* 右侧区域（包含搜索框+预报） */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 搜索框固定在顶部 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
            style={{ padding: '8px', flex: 1 }}
          />
          <button onClick={fetchWeather} style={{ padding: '8px 12px' }}>Search</button>
          <button onClick={toggleFavorite} style={{ padding: '8px 12px' }}>
            {favorites.includes(city) ? '❤️' : '🤍'}
          </button>
        </div>

        {/* 多日预报区域 */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ margin: 0 }}>Multi day forecast</h4>
            <span>›</span>
          </div>

          {forecast ? (
            <div>
              {forecast.map((item, index) => (
                <div key={index} style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                    {new Date(item.dt_txt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    < img 
                      src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                      alt="forecast icon"
                      style={{ width: '30px', height: 'auto' }}
                    />
                    <p style={{ margin: 0 }}>{Math.round(item.main.temp)}°C</p >
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#999', fontSize: '12px' }}>Search for a city to see forecast</p >
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;