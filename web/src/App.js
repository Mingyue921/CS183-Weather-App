import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // 状态管理
  const [city, setCity] = useState('Fuzhou');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // --- 修改在这里！从 .env 文件读取 API Key ---
  const API_KEY = process.env.REACT_APP_WEATHER_KEY;

  // 页面加载时，读取本地存储的收藏城市
  useEffect(() => {
    const saved = localStorage.getItem('weatherFavorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  // 保存收藏城市到本地存储
  useEffect(() => {
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // 获取实时天气和预报
  const fetchWeather = async () => {
    if (!API_KEY) {
      alert('API Key 未设置，请检查 .env 文件');
      return;
    }
    try {
      // 实时天气
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=zh_cn`
      );
      const currentData = await currentRes.json();
      setCurrentWeather(currentData);

      // 5天预报（取每天中午的数据当预报）
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=zh_cn`
      );
      const forecastData = await forecastRes.json();
      setForecast(forecastData.list.filter((_, index) => index % 8 === 0));
    } catch (error) {
      alert('获取天气失败，请检查城市名或网络');
      console.error(error);
    }
  };

  // 添加/移除收藏城市
  const toggleFavorite = () => {
    if (favorites.includes(city)) {
      setFavorites(favorites.filter(item => item !== city));
    } else {
      setFavorites([...favorites, city]);
    }
  };

  return (
    <div className="page-container">
      {/* 左边：实时天气 */}
      <div className="weather-left">
        <h2>{currentWeather?.name || '请查询城市'}</h2>
        {currentWeather && (
          <>
            <p className="temp">{Math.round(currentWeather.main.temp)}°C</p >
            <p className="desc">{currentWeather.weather[0].description}</p >
            <p>湿度：{currentWeather.main.humidity}%</p >
            <p>风速：{currentWeather.wind.speed} m/s</p >
            <button className="favorite-btn" onClick={toggleFavorite}>
              {favorites.includes(city) ? '取消收藏' : '收藏城市'}
            </button>
          </>
        )}
      </div>

      {/* 右边：7天预报 + 搜索 */}
      <div className="forecast-right">
        <div className="search-box">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="输入城市名（如 Beijing）"
          />
          <button onClick={fetchWeather}>查询天气</button>
        </div>

        <h2>未来预报</h2>
        <div className="forecast-list">
          {forecast?.map((day, index) => (
            <div key={index} className="day">
              <p>第{index + 1}天</p >
              <img
                src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                alt={day.weather[0].description}
              />
              <p>{Math.round(day.main.temp)}°C</p >
            </div>
          ))}
        </div>

        {/* 收藏列表 */}
        {favorites.length > 0 && (
          <div className="favorites">
            <h3>收藏的城市</h3>
            <div className="fav-list">
              {favorites.map((fav, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCity(fav);
                    fetchWeather();
                  }}
                >
                  {fav}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;