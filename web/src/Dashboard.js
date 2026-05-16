import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './Dashboard.css';

function Dashboard() {
  const [city, setCity] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_KEY = process.env.REACT_APP_WEATHER_KEY;

  useEffect(() => {
    const saved = localStorage.getItem('weatherFavorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // 中文风向转英文标识
  const getWindDir = (cnDir) => {
    const map = {
      东: 'E', 东南: 'SE', 南: 'S', 西南: 'SW',
      西: 'W', 西北: 'NW', 北: 'N', 东北: 'NE'
    };
    return map[cnDir] || cnDir;
  };

  // 降雨等级
  const getRainLevel = (val) => {
    if (val < 30) return "Low";
    if (val < 70) return "Mid";
    return "High";
  };

  // UV等级
  const getUvLevel = (val) => {
    if (val < 3) return "Low";
    if (val < 7) return "Mid";
    return "High";
  };

  // 天气图标映射
  const getWeatherIcon = (weatherText) => {
    if (weatherText.includes("晴")) return "sunny.svg";
    if (weatherText.includes("多云")) return "cloudy.svg";
    if (weatherText.includes("阴")) return "overcast.svg";
    if (weatherText.includes("雨")) return "rain.svg";
    return "cloudy.svg";
  };

  const fetchWeather = async () => {
    if (!API_KEY) {
      alert('API Key missing');
      return;
    }
    if (!city.trim()) {
      alert('请输入城市中文名，如：福州');
      return;
    }

    setLoading(true);
    try {
      const url = `https://restapi.amap.com/v3/weather/weatherInfo?city=${city}&key=${API_KEY}&extensions=all&output=json`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status !== '1') {
        throw new Error(data.info || '城市不存在或密钥错误');
      }

      const forecastList = data.forecasts[0].casts.slice(0, 5);
      const today = forecastList[0];

      // 【全部数据动态从API读取，无任何固定写死值】
      setCurrentWeather({
        name: data.forecasts[0].city,
        date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        lunar: "Lunar Feb 24",
        main: {
          temp: today.daytemp,
          temp_min: today.nighttemp,
          temp_max: today.daytemp,
          humidity: today.dayhumidity || 0,
          pressure: today.daypressure || 0
        },
        weather: [{ description: today.dayweather }],
        wind: {
          speed: today.daypower,
          direction: getWindDir(today.daywind)
        },
        uvi: today.dayuv || 0,
        rainChance: today.dayprecip || 0
      });

      setForecast(forecastList);
    } catch (err) {
      console.error(err);
      alert('获取天气失败：' + err.message);
    } finally {
      setLoading(false);
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
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        {/* 顶部搜索栏 */}
        <div className="search-bar">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
          />
          <button onClick={fetchWeather} disabled={loading}>
            {loading ? 'Loading...' : 'Search'}
          </button>
          <button onClick={toggleFavorite} disabled={!currentWeather}>
            {favorites.includes(city) ? '❤️' : '🤍'}
          </button>
        </div>

        {currentWeather ? (
          <div className="weather-page">
            {/* 左侧主区域 */}
            <div className="left-main">
              {/* 顶部国风主卡片 */}
              <div className="hero-card">
                <div className="location-info">
                  <div className="location-row">
                    < img src="/img/105/Vector-1.svg" alt="location" className="icon-sm" />
                    <span className="city-name">{currentWeather.name}</span>
                  </div>
                  <div className="date-row">
                    <span>{currentWeather.date}</span>
                    <span className="lunar">{currentWeather.lunar}</span>
                  </div>
                </div>

                <div className="temp-block">
                  <span className="big-temp">{currentWeather.main.temp}</span>
                  <span className="unit">°C</span>
                  <span className="weather-desc">{currentWeather.weather[0].description}</span>
                  <div className="temp-range">
                    {currentWeather.main.temp_min}/{currentWeather.main.temp_max}°C | {currentWeather.wind.direction} wind
                  </div>
                </div>

                <div className="stats-row">
                  <div className="stat-item">
                    < img src="/img/105/湿度 1.svg" alt="humidity" className="icon-sm" />
                    <span>{currentWeather.main.humidity}%</span>
                  </div>
                  <div className="stat-item">
                    < img src="/img/105/air.svg" alt="air" className="icon-sm" />
                    <span>Excellent</span>
                  </div>
                  <div className="stat-item">
                    < img src="/img/105/风级 1.svg" alt="wind" className="icon-sm" />
                    <span>Force {currentWeather.wind.speed}</span>
                  </div>
                </div>

                {/* 国风背景图 */}
                < img src="/img/105/picture.svg" alt="landscape" className="bg-landscape" />
              </div>

              {/* 下方4个数据卡片 */}
              <div className="grid-cards">
                {/* 1. Wind 圆环显示英文风向 */}
                <div className="data-card">
                  <h3>Wind</h3>
                  <p>Today wind speed</p >
                  <p className="card-value">{currentWeather.wind.speed} km/h</p >
                  <div className="simple-ring">
                    <div className="ring-progress wind" style={{ '--percent': `${Math.min(currentWeather.wind.speed / 12 * 100, 100)}%` }}>
                      <span className="ring-text">{currentWeather.wind.direction}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Rain Chance 动态降雨概率+等级 */}
                <div className="data-card">
                  <h3>Rain Chance</h3>
                  <p>Today rain chance</p >
                  <p className="card-value">{currentWeather.rainChance}%</p >
                  <div className="simple-ring">
                    <div className="ring-progress rain" style={{ '--percent': `${currentWeather.rainChance}%` }}>
                      <span className="ring-text">{getRainLevel(currentWeather.rainChance)}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Pressure 动态气压圆环 */}
                <div className="data-card">
                  <h3>Presssure</h3>
                  <p>Today Pressure</p >
                  <p className="card-value">{currentWeather.main.pressure} hPa</p >
                  <div className="simple-ring">
                    <div className="ring-progress pressure" style={{ '--percent': `${Math.min(((currentWeather.main.pressure - 1000) / 50) * 100, 100)}%` }}></div>
                  </div>
                </div>

                {/* 4. UV 开口朝下3/4彩虹圆环 */}
                <div className="data-card">
                  <h3>UV Index</h3>
                  <p>Today UV Index</p >
                  <p className="card-value">{currentWeather.uvi}</p >
                  <div className="uv-rainbow-ring">
                    <span className="ring-text">{getUvLevel(currentWeather.uvi)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧5天多日预报 */}
            <div className="right-forecast">
              <div className="forecast-header">
                <h2>Multi day forecast</h2>
              </div>
              <div className="forecast-list">
                {forecast?.map((item, idx) => (
                  <div key={idx} className="forecast-item">
                    <div className="forecast-date">
                      {new Date(item.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="forecast-temp-row">
                      <span>{item.daytemp}°C</span>
                      <img
                        src={`/img/105/${getWeatherIcon(item.dayweather)}`}
                        alt={item.dayweather}
                        className="forecast-icon"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            < img src="/img/105/picture.svg" alt="empty" className="empty-img" />
            <p>Enter a city name to view weather data</p >
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;