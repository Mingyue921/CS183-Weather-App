import React, { useEffect, useState } from 'react';
import { API_BASE_URL, apiRequest } from './api';
import './SavedLocation.css';

const iconBase = '/img/105';
const amapKey = process.env.REACT_APP_WEATHER_KEY;

function SavedLocation() {
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [weatherCards, setWeatherCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    window.dispatchEvent(new Event('weatherFavoritesChanged'));
    if (favorites.length === 0) {
      setWeatherCards([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    Promise.all(favorites.map((city) => fetchCityWeather(city)))
      .then((cards) => {
        if (!cancelled) {
          setWeatherCards(cards.filter(Boolean));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [favorites]);

  const loadFavorites = async () => {
    const localFavorites = readLocalFavorites();

    try {
      if (!localStorage.getItem('token')) {
        setFavorites(localFavorites);
        return;
      }

      const data = await apiRequest('/api/favorites');
      setFavorites(normalizeFavorites(data.favorites));
    } catch {
      setFavorites(localFavorites);
    }
  };

  const addFavorite = async (event) => {
    event.preventDefault();
    const city = query.trim();
    if (!city) return;

    setMessage('');
    const card = await fetchCityWeather(city);
    if (!card) {
      setMessage('City weather was not found. Please try another city.');
      return;
    }

    const nextFavorites = uniqueCities([...favorites, card.city]);
    setFavorites(nextFavorites);
    setQuery('');

    if (localStorage.getItem('token')) {
      try {
        await apiRequest('/api/favorites', {
          method: 'POST',
          body: JSON.stringify({ city: card.city }),
        });
      } catch {
        setMessage('Saved locally. Server sync is temporarily unavailable.');
      }
    }
  };

  const removeFavorite = async (city) => {
    setFavorites((current) => current.filter((item) => item !== city));

    if (localStorage.getItem('token')) {
      try {
        await apiRequest(`/api/favorites/${encodeURIComponent(city)}`, {
          method: 'DELETE',
        });
      } catch {
        setMessage('Removed locally. Server sync is temporarily unavailable.');
      }
    }
  };

  return (
    <main className="saved-location-page">
      <header className="saved-topbar">
        <form className="saved-search" onSubmit={addFavorite}>
          <img src={`${iconBase}/search.svg`} alt="" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Searching city here..."
          />
        </form>

        <div className="saved-header-actions">
          <button className="saved-bell" type="button" aria-label="Notifications">
            <img src={`${iconBase}/%E9%93%83%E9%93%9B%20(3)%201.svg`} alt="" />
          </button>
          <div className="saved-avatar" aria-label="User avatar" />
        </div>
      </header>

      {message && <p className="saved-message">{message}</p>}

      {loading && weatherCards.length === 0 ? (
        <div className="saved-empty">Loading saved locations...</div>
      ) : weatherCards.length === 0 ? (
        <div className="saved-empty">Search a city to add your first saved location.</div>
      ) : (
        <section className="saved-card-grid" aria-label="Saved weather locations">
          {weatherCards.map((card) => (
            <article className="saved-weather-card" key={card.city}>
              <div className="saved-card-head">
                <h2>{card.city}</h2>
                <span>{card.date}</span>
              </div>

              <div className="saved-card-main">
                <div>
                  <div className="saved-temp">
                    {card.temp}
                    <span>°C</span>
                  </div>
                  <p>{card.description}</p>
                </div>

                <div className="saved-weather-art">
                  <img src={`${iconBase}/${card.icon}`} alt={card.description} />
                  <span>{card.minTemp} ~ {card.maxTemp}°C</span>
                </div>
              </div>

              <div className="saved-card-footer">
                <span>♧ {card.humidity}%</span>
                <span>☁ {card.airQuality}</span>
                <span>♨ Force {card.windForce}</span>
              </div>

              <button
                className="saved-heart"
                type="button"
                aria-label={`Remove ${card.city} from saved locations`}
                onClick={() => removeFavorite(card.city)}
              >
                ♥
              </button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

async function fetchCityWeather(city) {
  const backendWeather = await fetchBackendWeather(city);
  if (backendWeather) return backendWeather;

  return fetchAmapWeather(city);
}

async function fetchBackendWeather(city) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/weather/current?city=${encodeURIComponent(city)}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return {
      city: data.name || city,
      date: formatDate(data.dt),
      temp: Math.round(data.main?.temp ?? 0),
      minTemp: Math.round(data.main?.temp_min ?? data.main?.temp ?? 0),
      maxTemp: Math.round(data.main?.temp_max ?? data.main?.temp ?? 0),
      humidity: data.main?.humidity ?? 0,
      windForce: toWindForce(data.wind?.speed),
      airQuality: getAirQuality(data.main?.humidity),
      description: normalizeDescription(data.weather?.[0]?.description),
      icon: getWeatherIcon(data.weather?.[0]?.main || data.weather?.[0]?.description),
    };
  } catch {
    return null;
  }
}

async function fetchAmapWeather(city) {
  if (!amapKey) return null;

  try {
    const url = `https://restapi.amap.com/v3/weather/weatherInfo?city=${encodeURIComponent(city)}&key=${amapKey}&extensions=all&output=json`;
    const response = await fetch(url);
    const data = await response.json();
    const forecast = data.forecasts?.[0];
    const today = forecast?.casts?.[0];
    if (data.status !== '1' || !forecast || !today) return null;

    return {
      city: forecast.city || city,
      date: formatDate(),
      temp: Number(today.daytemp),
      minTemp: Number(today.nighttemp),
      maxTemp: Number(today.daytemp),
      humidity: Number(today.dayhumidity || 0),
      windForce: today.daypower || 0,
      airQuality: getAirQuality(today.dayhumidity),
      description: normalizeDescription(today.dayweather),
      icon: getWeatherIcon(today.dayweather),
    };
  } catch {
    return null;
  }
}

function readLocalFavorites() {
  try {
    return normalizeFavorites(JSON.parse(localStorage.getItem('weatherFavorites') || '[]'));
  } catch {
    return [];
  }
}

function normalizeFavorites(value) {
  return uniqueCities(Array.isArray(value) ? value : []);
}

function uniqueCities(cities) {
  return [...new Set(cities.map((city) => String(city).trim()).filter(Boolean))];
}

function formatDate(timestamp) {
  const date = timestamp ? new Date(timestamp * 1000) : new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  return `${month}.${day} ${weekday}.`;
}

function normalizeDescription(description = 'Sunny') {
  const lower = String(description).toLowerCase();
  if (lower.includes('cloud') || lower.includes('云')) return 'Cloudy';
  if (lower.includes('rain') || lower.includes('雨')) return 'Rainy';
  if (lower.includes('overcast') || lower.includes('阴')) return 'Overcast';
  return 'Sunny';
}

function getWeatherIcon(description = '') {
  const lower = String(description).toLowerCase();
  if (lower.includes('cloud') || lower.includes('云')) return 'cloudy.svg';
  if (lower.includes('rain') || lower.includes('雨')) return 'rain.svg';
  if (lower.includes('overcast') || lower.includes('阴')) return 'overcast.svg';
  return 'sunny.svg';
}

function toWindForce(speed = 0) {
  const value = Number(speed);
  if (Number.isNaN(value)) return speed || 0;
  return Math.max(0, Math.round(value / 1.6));
}

function getAirQuality(value = 60) {
  const humidity = Number(value);
  if (humidity < 65) return 'good';
  if (humidity < 82) return 'Excellent';
  return 'normal';
}

export default SavedLocation;
