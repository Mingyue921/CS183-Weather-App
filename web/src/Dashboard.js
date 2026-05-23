import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import './Dashboard.css';

const iconBase = '/img/105';

function readStoredFavorites() {
  try {
    const saved = localStorage.getItem('weatherFavorites');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function Dashboard() {
  const [city, setCity] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [favorites, setFavorites] = useState(readStoredFavorites);
  const [loading, setLoading] = useState(false);

  const API_KEY = process.env.REACT_APP_WEATHER_KEY;
  const favoriteCity = currentWeather?.name || city.trim();
  const isFavorite = Boolean(favoriteCity && favorites.includes(favoriteCity));

  useEffect(() => {
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    window.dispatchEvent(new Event('weatherFavoritesChanged'));
  }, [favorites]);

  const getWindDir = (windDir) => {
    const map = {
      东: 'E',
      东南: 'SE',
      南: 'S',
      西南: 'SW',
      西: 'W',
      西北: 'NW',
      北: 'N',
      东北: 'NE',
    };
    return map[windDir] || windDir;
  };

  const getRainLevel = (val) => {
    if (val < 30) return 'Low';
    if (val < 70) return 'Mid';
    return 'High';
  };

  const getUvLevel = (val) => {
    if (val < 3) return 'Low';
    if (val < 7) return 'Mid';
    return 'High';
  };

  const getWeatherIcon = (weatherText = '') => {
    if (weatherText.includes('晴') || weatherText.toLowerCase().includes('sun')) return 'sunny.svg';
    if (weatherText.includes('云') || weatherText.toLowerCase().includes('cloud')) return 'cloudy.svg';
    if (weatherText.includes('阴') || weatherText.toLowerCase().includes('overcast')) return 'overcast.svg';
    if (weatherText.includes('雨') || weatherText.toLowerCase().includes('rain')) return 'rain.svg';
    return 'cloudy.svg';
  };

  const fetchWeather = async () => {
    const trimmedCity = city.trim();
    if (!API_KEY) {
      alert('API Key missing');
      return;
    }
    if (!trimmedCity) {
      alert('Please enter a city name.');
      return;
    }

    setLoading(true);
    try {
      const url = `https://restapi.amap.com/v3/weather/weatherInfo?city=${encodeURIComponent(trimmedCity)}&key=${API_KEY}&extensions=all&output=json`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status !== '1' || !data.forecasts?.[0]) {
        throw new Error(data.info || 'City not found');
      }

      const forecastList = data.forecasts[0].casts.slice(0, 5);
      const today = forecastList[0];
      const weatherCity = data.forecasts[0].city || trimmedCity;

      setCurrentWeather({
        name: weatherCity,
        date: new Date().toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        lunar: 'Lunar Feb 24',
        main: {
          temp: today.daytemp,
          temp_min: today.nighttemp,
          temp_max: today.daytemp,
          humidity: today.dayhumidity || 0,
          pressure: today.daypressure || 0,
        },
        weather: [{ description: today.dayweather }],
        wind: {
          speed: today.daypower,
          direction: getWindDir(today.daywind),
        },
        uvi: today.dayuv || 0,
        rainChance: today.dayprecip || 0,
      });

      setForecast(forecastList);
    } catch (err) {
      alert(`Failed to fetch weather: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    if (!favoriteCity) return;

    setFavorites((current) => {
      if (current.includes(favoriteCity)) {
        return current.filter((item) => item !== favoriteCity);
      }
      return [...current, favoriteCity];
    });
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="search-bar">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
            onKeyDown={(event) => {
              if (event.key === 'Enter') fetchWeather();
            }}
          />
          <button onClick={fetchWeather} disabled={loading}>
            {loading ? 'Loading...' : 'Search'}
          </button>
          <button
            className={`favorite-toggle ${isFavorite ? 'active' : ''}`}
            onClick={toggleFavorite}
            disabled={!currentWeather}
            aria-label={isFavorite ? 'Remove from saved locations' : 'Save location'}
          >
            {isFavorite ? '\u2665' : '\u2661'}
          </button>
        </div>

        {currentWeather ? (
          <div className="weather-page">
            <div className="left-main">
              <div className="hero-card">
                <div className="location-info">
                  <div className="location-row">
                    <img src={`${iconBase}/Vector-1.svg`} alt="location" className="icon-sm" />
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
                    <img src={`${iconBase}/%E6%B9%BF%E5%BA%A6%201.svg`} alt="humidity" className="icon-sm" />
                    <span>{currentWeather.main.humidity}%</span>
                  </div>
                  <div className="stat-item">
                    <img src={`${iconBase}/air.svg`} alt="air" className="icon-sm" />
                    <span>Excellent</span>
                  </div>
                  <div className="stat-item">
                    <img src={`${iconBase}/%E9%A3%8E%E7%BA%A7%201.svg`} alt="wind" className="icon-sm" />
                    <span>Force {currentWeather.wind.speed}</span>
                  </div>
                </div>

                <img src={`${iconBase}/picture.svg`} alt="landscape" className="bg-landscape" />
              </div>

              <div className="grid-cards">
                <div className="data-card">
                  <h3>Wind</h3>
                  <p>Today wind speed</p>
                  <p className="card-value">{currentWeather.wind.speed} km/h</p>
                  <div className="simple-ring">
                    <div className="ring-progress wind" style={{ '--percent': `${Math.min(Number(currentWeather.wind.speed) / 12 * 100, 100)}%` }}>
                      <span className="ring-text">{currentWeather.wind.direction}</span>
                    </div>
                  </div>
                </div>

                <div className="data-card">
                  <h3>Rain Chance</h3>
                  <p>Today rain chance</p>
                  <p className="card-value">{currentWeather.rainChance}%</p>
                  <div className="simple-ring">
                    <div className="ring-progress rain" style={{ '--percent': `${currentWeather.rainChance}%` }}>
                      <span className="ring-text">{getRainLevel(currentWeather.rainChance)}</span>
                    </div>
                  </div>
                </div>

                <div className="data-card">
                  <h3>Presssure</h3>
                  <p>Today Pressure</p>
                  <p className="card-value">{currentWeather.main.pressure} hPa</p>
                  <div className="simple-ring">
                    <div className="ring-progress pressure" style={{ '--percent': `${Math.min(((currentWeather.main.pressure - 1000) / 50) * 100, 100)}%` }} />
                  </div>
                </div>

                <div className="data-card">
                  <h3>UV Index</h3>
                  <p>Today UV Index</p>
                  <p className="card-value">{currentWeather.uvi}</p>
                  <div className="uv-rainbow-ring">
                    <span className="ring-text">{getUvLevel(currentWeather.uvi)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="right-forecast">
              <div className="forecast-header">
                <h2>Multi day forecast</h2>
              </div>
              <div className="forecast-list">
                {forecast?.map((item, idx) => (
                  <div key={idx} className="forecast-item">
                    <div className="forecast-date">
                      {new Date(item.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="forecast-temp-row">
                      <span>{item.daytemp}°C</span>
                      <img
                        src={`${iconBase}/${getWeatherIcon(item.dayweather)}`}
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
            <img src={`${iconBase}/picture.svg`} alt="empty" className="empty-img" />
            <p>Enter a city name to view weather data</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
