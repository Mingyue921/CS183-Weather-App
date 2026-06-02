import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from './api';
import './Dashboard.css';

const iconBase = '/img/105';
const FUZHOU_AMAP = '\u798F\u5DDE\u5E02';
const CITY_SEARCH_ALIASES = {
  fuzhou: FUZHOU_AMAP,
  'fu zhou': FUZHOU_AMAP,
  '\u798F\u5DDE': FUZHOU_AMAP,
  '\u798F\u5DDE\u5E02': FUZHOU_AMAP,
};

const normalizeCityQuery = (value = '') => CITY_SEARCH_ALIASES[value.trim().toLowerCase()] || value.trim();

function readStoredFavorites() {
  try {
    const saved = localStorage.getItem('weatherFavorites');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

const OPENWEATHER_TIMEOUT_MS = 120000;

function fetchWithTimeout(url, timeoutMs = OPENWEATHER_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeout));
}

function getAirQuality(value = 60) {
  const humidity = Number(value);
  if (humidity < 65) return 'good';
  if (humidity < 82) return 'Excellent';
  return 'normal';
}

function windDegToDirection(deg) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

function Dashboard() {
  const [city, setCity] = useState(() => {
    return localStorage.getItem('lastSearchCity') || '';
  });

  const [currentWeather, setCurrentWeather] = useState(() => {
    const saved = localStorage.getItem('lastCurrentWeather');
    return saved ? JSON.parse(saved) : null;
  });

  const [forecast, setForecast] = useState(() => {
    const saved = localStorage.getItem('lastForecast');
    return saved ? JSON.parse(saved) : null;
  });

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
      '\u4E1C': 'E',
      '\u4E1C\u5357': 'SE',
      '\u5357': 'S',
      '\u897F\u5357': 'SW',
      '\u897F': 'W',
      '\u897F\u5317': 'NW',
      '\u5317': 'N',
      '\u4E1C\u5317': 'NE',
    };
    return map[windDir] || windDir || 'N/A';
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

  const getPressureStatus = (press) => {
    const p = Number(press);
    if (p < 1000) return 'Low';
    if (p > 1025) return 'High';
    return 'Normal';
  };

  const getWeatherIcon = (weatherText = '') => {
    const text = String(weatherText).toLowerCase();
    if (text.includes('sun') || text.includes('clear') || text.includes('\u6674')) return 'sunny.svg';
    if (text.includes('cloud') || text.includes('\u4E91')) return 'cloudy.svg';
    if (text.includes('overcast') || text.includes('\u9634')) return 'overcast.svg';
    if (text.includes('rain') || text.includes('\u96E8')) return 'rain.svg';
    return 'cloudy.svg';
  };

  const buildCurrentFromOpenWeather = (currentData, dailyData, fallbackCity) => {
    const oneCallCurrent = dailyData?.current || {};
    const firstDaily = dailyData?.daily?.[0] || {};

    // ✅ 修复：三重兜底 + 强制转数字，永远不会 NaN
    const rawRainChance = Number(firstDaily.pop || currentData.pop || currentData.clouds || 0);
    const rainChance = isNaN(rawRainChance) ? 0 : Math.round(rawRainChance * 100);

    let windDir = 'N/A';
    const deg = currentData.windDeg ?? currentData.wind?.deg ?? oneCallCurrent.wind_deg;
    if (typeof deg === 'number' && !isNaN(deg)) {
      windDir = windDegToDirection(deg);
    }

    return {
      name: currentData.name || fallbackCity,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      lunar: 'OpenWeather',
      main: {
        temp: Math.round(currentData.main?.temp ?? oneCallCurrent.temp ?? 0),
        temp_min: Math.round(currentData.main?.temp_min ?? firstDaily.temp?.min ?? currentData.main?.temp ?? 0),
        temp_max: Math.round(currentData.main?.temp_max ?? firstDaily.temp?.max ?? currentData.main?.temp ?? 0),
        humidity: currentData.main?.humidity ?? oneCallCurrent.humidity ?? 0,
        pressure: currentData.main?.pressure ?? oneCallCurrent.pressure ?? 0,
      },
      weather: [{ description: currentData.weather?.[0]?.description || oneCallCurrent.weather?.[0]?.description || 'Clear' }],
      wind: {
        speed: Math.round(currentData.wind?.speed ?? oneCallCurrent.wind_speed ?? 0),
        direction: windDir,
      },
      uvi: Math.round(oneCallCurrent.uvi ?? 0),
      rainChance,
      coord: currentData.coord,
    };
  };

  const buildForecastFromDaily = (daily = []) => daily.slice(0, 7).map((item) => ({
    date: new Date((item.dt || Date.now() / 1000) * 1000).toISOString(),
    daytemp: Math.round(item.temp?.max ?? item.temp?.day ?? 0),
    nighttemp: Math.round(item.temp?.min ?? item.temp?.night ?? 0),
    dayweather: item.weather?.[0]?.description || 'Clear',
  }));

  const buildForecastFromOpenWeather = (data) => (data.list || []).slice(0, 7).map((item) => ({
    date: item.dt_txt || new Date((item.dt || Date.now() / 1000) * 1000).toISOString(),
    daytemp: Math.round(item.main?.temp_max ?? item.main?.temp ?? 0),
    nighttemp: Math.round(item.main?.temp_min ?? item.main?.temp ?? 0),
    dayweather: item.weather?.[0]?.description || 'Clear',
  }));

  const fetchBackendWeather = async (cityName) => {
    const currentRes = await fetchWithTimeout(`${API_BASE_URL}/api/weather/current?city=${encodeURIComponent(cityName)}`, OPENWEATHER_TIMEOUT_MS);
    if (!currentRes.ok) throw new Error('OpenWeather current weather failed');
    const currentData = await currentRes.json();

    let dailyData = null;
    if (currentData.coord?.lat && currentData.coord?.lon) {
      const dailyRes = await fetchWithTimeout(
        `${API_BASE_URL}/api/weather/daily?lat=${encodeURIComponent(currentData.coord.lat)}&lon=${encodeURIComponent(currentData.coord.lon)}`,
        OPENWEATHER_TIMEOUT_MS
      );
      if (dailyRes.ok) dailyData = await dailyRes.json();
    }

    let forecastList = buildForecastFromDaily(dailyData?.daily || []);
    if (forecastList.length === 0) {
      const forecastRes = await fetchWithTimeout(`${API_BASE_URL}/api/weather/forecast?city=${encodeURIComponent(cityName)}`, OPENWEATHER_TIMEOUT_MS);
      if (!forecastRes.ok) throw new Error('OpenWeather forecast failed');
      forecastList = buildForecastFromOpenWeather(await forecastRes.json());
    }

    return {
      current: buildCurrentFromOpenWeather(currentData, dailyData, cityName),
      forecast: forecastList,
    };
  };

  const fetchAmapWeather = async (cityName) => {
    const searchCity = normalizeCityQuery(cityName);
    const url = `https://restapi.amap.com/v3/weather/weatherInfo?city=${encodeURIComponent(searchCity)}&key=${API_KEY}&extensions=all&output=json`;
    const res = await fetchWithTimeout(url, 8000);
    const data = await res.json();

    if (data.status !== '1' || !data.forecasts?.[0]) {
      throw new Error('City not found in Amap API');
    }

    const forecastList = data.forecasts[0].casts.slice(0, 7);
    const today = forecastList[0];
    const weatherCity = cityName;

    return {
      current: {
        name: weatherCity,
        date: new Date().toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        lunar: 'Amap fallback',
        main: {
          temp: today.daytemp,
          temp_min: today.nighttemp,
          temp_max: today.daytemp,
          humidity: today.dayhumidity || '--',
          pressure: today.daypressure || '--',
        },
        weather: [{ description: today.dayweather }],
        wind: {
          speed: today.daypower,
          direction: getWindDir(today.daywind),
        },
        uvi: today.dayuv || '--',
        rainChance: today.dayprecip || 0,
        coord: searchCity === FUZHOU_AMAP ? { lat: 26.08, lon: 119.3 } : null,
      },
      forecast: forecastList,
    };
  };

  const fetchWeather = async () => {
    const trimmedCity = city.trim();
    if (!trimmedCity) {
      alert('Please enter a city name.');
      return;
    }

    setLoading(true);
    let result;
    try {
      result = await fetchBackendWeather(trimmedCity);
    } catch (openWeatherErr) {
      if (!API_KEY) {
        alert('Failed to fetch weather from OpenWeather, and Amap API key is missing.');
        setLoading(false);
        return;
      }
      try {
        result = await fetchAmapWeather(trimmedCity);
      } catch (amapErr) {
        alert(`Failed to fetch weather for "${trimmedCity}". Please check the city name.`);
        setLoading(false);
        return;
      }
    }

    setCurrentWeather(result.current);
    setForecast(result.forecast);

    localStorage.setItem('lastSearchCity', trimmedCity);
    localStorage.setItem('lastCurrentWeather', JSON.stringify(result.current));
    localStorage.setItem('lastForecast', JSON.stringify(result.forecast));

    setLoading(false);
  };

  const toggleFavorite = () => {
    if (!favoriteCity) return;
    setFavorites((current) =>
      current.includes(favoriteCity)
        ? current.filter((item) => item !== favoriteCity)
        : [...current, favoriteCity]
    );
  };

  return (
    <div className="app-container">
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
                  <span className="unit">deg C</span>
                  <span className="weather-desc">{currentWeather.weather[0].description}</span>
                  <div className="temp-range">
                    {currentWeather.main.temp_min}/{currentWeather.main.temp_max} deg C | {currentWeather.wind.direction} wind
                  </div>
                </div>

                <div className="stats-row">
                  <div className="stat-item">
                    <img src={`${iconBase}/%E6%B9%BF%E5%BA%A6%201.svg`} alt="humidity" className="icon-sm" />
                    <span>{currentWeather.main.humidity}{currentWeather.main.humidity === '--' ? '' : '%'}</span>
                  </div>
                  <div className="stat-item">
                    <img src={`${iconBase}/air.svg`} alt="air quality" className="icon-sm" />
                    <span>{getAirQuality(currentWeather.main.humidity)}</span>
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
                    <div className="ring-progress wind" style={{ '--percent': Math.min(100, Number(currentWeather.wind.speed) / 12 * 100) + '%' }}>
                      <span className="ring-text">{currentWeather.wind.direction}</span>
                    </div>
                  </div>
                </div>

                <div className="data-card">
                  <h3>Rain Chance</h3>
                  <p>Today rain chance</p>
                  <p className="card-value">
                    {isNaN(currentWeather.rainChance) ? 0 : currentWeather.rainChance}%
                  </p>
                  <div className="simple-ring">
                    <div 
                      className="ring-progress rain" 
                      style={{ 
                        '--percent': `${isNaN(currentWeather.rainChance) ? 0 : currentWeather.rainChance}%` 
                      }}
                    >
                      <span className="ring-text">
                        {currentWeather.rainChance === '--' || isNaN(currentWeather.rainChance)
                          ? 'N/A'
                          : getRainLevel(Number(currentWeather.rainChance))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="data-card">
                  <h3>Pressure</h3>
                  <p>Today pressure</p>
                  <p className="card-value">{currentWeather.main.pressure}{currentWeather.main.pressure === '--' ? '' : ' hPa'}</p>
                  <div className="simple-ring">
                    <div 
                      className="ring-progress pressure" 
                      style={{
                        '--percent': Math.max(0, Math.min(100, ((Number(currentWeather.main.pressure) - 980) / 60) * 100)) + "%"
                      }}
                    >
                      <span className="ring-text">
                        {currentWeather.main.pressure === '--' ? 'N/A' : getPressureStatus(currentWeather.main.pressure)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="data-card">
                  <h3>UV Index</h3>
                  <p>Today UV Index</p>
                  <p className="card-value">{currentWeather.uvi}</p>
                  <div className="uv-rainbow-ring">
                    <span className="ring-text">{currentWeather.uvi === '--' ? 'N/A' : getUvLevel(Number(currentWeather.uvi))}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="right-forecast">
              <div className="forecast-header">
                <h2>7-day forecast</h2>
              </div>
              <div className="forecast-list">
                {forecast?.slice(0, 7).map((item, idx) => (
                  <div key={idx} className="forecast-item">
                    <div className="forecast-date">
                      {new Date(item.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="forecast-temp-row">
                      <span>{item.daytemp} deg C</span>
                      <img src={`${iconBase}/${getWeatherIcon(item.dayweather)}`} alt="" className="forecast-icon" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <img src={`${iconBase}/picture.svg`} alt="" className="empty-img" />
            <p>Enter a city name to view weather data</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;