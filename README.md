# CS183 Weather App

A weather application combining AI-powered suggestions with traditional Chinese cultural content. Provides real-time weather information, AI-generated lifestyle recommendations, and 24 Solar Terms cultural cards.

## Features

* Real-time weather display (temperature, humidity, wind, UV, air quality, 7-day forecast)
* AI-powered suggestions (clothing, food, activities + free-form chat)
* 24 Solar Terms (二十四节气) cultural cards with traditional Chinese elements
* Offline fallback — rules-based engine when AI is unreachable; local JSON storage when MongoDB is unavailable
* User registration & login (JWT + bcrypt)
* Save and manage favorite locations
* Responsive design for desktop and mobile
* Settings page (unit toggle, theme customization)
* Built-in API diagnostic tool

## Project Structure

    CS183-Weather-App/
    ├── web/          # React.js web frontend
    ├── mobile/       # React Native (Expo) mobile app
    ├── sever/        # Node.js/Express backend
    ├── AI/           # AI microservice
    ├── Dockerfile
    └── package.json

## Tech Stack

| Layer | Technology |
| --- | --- |
| Web Frontend | React.js, CSS3 |
| Mobile App | React Native (Expo SDK 55) |
| Backend | Node.js, Express, MongoDB / Mongoose |
| Auth | JWT + bcryptjs |
| AI  | DeepSeek API + rules-based fallback |
| Weather Data | OpenWeatherMap API |
| Geo | Amap (高德地图) geocoding API |
| Testing | Jest |
| DevOps | Docker |

## Web Frontend (`web/`)

React.js single-page application with the following pages:

* **Dashboard** — weather overview: real-time temperature, humidity, wind, UV, air quality + AI suggestion cards (clothing, food, activities)
* **Calendar** — 24 Solar Terms calendar with term dates and descriptions, tap to expand details
* **AI Helper** — chat panel for asking weather-related questions with real-time AI responses
* **Saved Locations** — city favorites: search → add → switch to view weather
* **Settings** — preferences: temperature unit (°C/°F), theme color, region management
* **Login** — registration & login page; authentication required for favorites and saved data

### Environment Variables

    REACT_APP_WEATHER_KEY=your_openweathermap_api_key
    REACT_APP_API_BASE_URL=http://localhost:3000    # optional, defaults to this value

### Running

    cd web
    npm install
    npm start

## Mobile App (`mobile/`)

React Native app built with Expo, using `expo-router` for file-based routing. Feature parity with the web version.

Key dependencies: `@react-navigation` (bottom tabs + stack), `expo-haptics`, `expo-image`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-svg`.

### Running

    cd mobile
    npm install
    npx expo start

Supports Android emulator / iOS simulator / Expo Go QR scan.

## Backend Server (`sever/`)

Node.js/Express server on port 3000. MongoDB is the primary database; falls back to local JSON file storage when MongoDB is unavailable.

### Source Structure

    sever/src/
    ├── index.js          # Server entry point, mounts routes, connects to MongoDB
    ├── routes/           # weather | solar-term | auth | favorites | ai | ai-suggestions
    ├── models/           # Mongoose data models
    ├── middleware/        # JWT auth & request validation
    ├── data/             # Seed data & local JSON storage files
    ├── localUserStore.js # JSON file user CRUD (bcrypt hashing, auto-increment ID, email dedup)
    └── localAiStore.js   # AI response file cache (max 200 entries)

### Environment Variables

    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/weather-app
    JWT_SECRET=change-this-secret
    WEATHER_API_KEY=your_openweathermap_api_key
    AI_SERVICE_BASE_URL=http://localhost:3001

### API Endpoints

| Endpoint | Description |
| --- | --- |
| /api/weather | Weather data (current & forecast) |
| /api/solar-term | 24 Solar Terms lookup |
| /api/auth | User registration & login (JWT) |
| /api/favorites | Favorite locations (auth required) |
| /api/ai | AI chat proxy |
| /api/ai-suggestions | AI lifestyle suggestions proxy |
| /api/health | Service health check |

### Running

    cd sever
    npm install
    npm run dev    # Development with auto-reload

## AI Service (`AI/`)

Standalone microservice on port 3001. Receives weather data and calls DeepSeek to generate clothing, food, and activity recommendations. Falls back to a rules engine when the AI API is unreachable.

### Source Structure

    AI/
    ├── diagnose.js          # API connectivity diagnostic script
    └── src/
        └── ai/
            ├── routes/      # aiAdvice (structured suggestions), aiChat (free-form chat)
            ├── services/    # deepseek | openweather | amap | cache | fallbackEngine
            │                # layersEngine | foodEngine | activityEngine
            │                # solarTerm | weatherResponse
            ├── data/        # OWM weather code → Chinese label mapping table
            └── __tests__/   # Engine unit tests + integration tests

### Key Mechanisms

| Mechanism | Implementation |
| --- | --- |
| AI Suggestions | DeepSeek API with full weather context injected in the prompt |
| Offline Fallback | `fallbackEngine.js` — matches temperature/weather code to rules, marks `source: local` |
| Caching | `cache.js` (Map + 5 min TTL) + backend `localAiStore.js` (file persistence) |
| Diagnostics | `diagnose.js` — sequentially tests Amap, OpenWeather, and DeepSeek keys & connectivity |

### Running

    cd AI
    npm install
    npm start           # Default port 3001
    node diagnose.js    # Verify API connectivity
    npm test            # Run tests

## Docker

    docker build -t weather-app .
    docker run -p 3000:3000 --env-file sever/.env weather-app

## Getting Started

### 1. Clone the Repository

    git clone https://github.com/Mingyue921/CS183-Weather-App.git
    cd CS183-Weather-App

### 2. Set Up & Start AI Service

    cd AI
    npm install

Configure environment variables if needed (e.g., custom DeepSeek key), then:

    npm start       # Default port 3001

### 3. Set Up & Start Backend

    cd sever
    npm install
    cp .env.example .env

Edit `.env` with your OpenWeather API key, JWT secret, and MongoDB URI, then:

    npm run dev     # Development with auto-reload

### 4. Set Up & Start Web Frontend

    cd web
    npm install
    cp .env.example .env

Edit `.env` and set `REACT_APP_WEATHER_KEY`, then:

    npm start

### 5. Set Up & Start Mobile App

    cd mobile
    npm install
    npx expo start

## UI Design

* **Style**: Soft, calming, and minimal
* **Color Palette**: Low-saturation Morandi tones — soft white, light gray-blue, warm amber accents
* **Theme**: Fusion of modern UI design with traditional Chinese cultural elements
* **Design Tool**: Figma

## Contributing

This project was developed for CS183 coursework. Feedback and contributions are welcome via GitHub Issues and Pull Requests.

## License

For educational purposes only.
