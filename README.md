# CS183 Weather App

A cross-platform weather application that integrates real-time weather data, AI-powered lifestyle recommendations, and Chinese 24 Solar Terms cultural content. The project includes a Web frontend, Expo React Native mobile client, Node.js/Express backend, and a standalone AI service.

GitHub Repository: [https://github.com/Mingyue921/CS183-Weather-App](https://github.com/Mingyue921/CS183-Weather-App)

## Team Members

| Name | MUID | Primary Contributions | Git Name |
| --- | --- | --- | --- |
| Zhao YueXuan | 25124391 | Mobile app pages, navigation, weather/AI/alert integration, solar term pages, report writing | Mingyue921 |
| Chen Chuqi | 25126251 |Express APIs, JWT authentication, weather alerts, MongoDB storage, favorites management, solar-term matching, data gateway | Chatree-Q |
| Huang Xinlei | 25125443 | Mobile UI design, icons, layout style, solar term visual presentation; also assisted web frontend members with selected web UI implementation and visual polishing | xinleihuang149-svg |
| Huang Yichen | 25125451 | React web structure, Dashboard, Saved Location, Calendar, AI Helper, Settings | 3dfisnt |
| Yang Qiyuan | 25124463 | Web dashboard, sidebar, cards and login/settings UI plus other auxiliary web layouts; designed web core module visuals including Solar Term & Calendar; defined overall project color system | Sally-design968 |
| Zhang Yuhan | 25124382 | AI advice generation, weather processing, fallback logic, JSON responses | ZYH-m23 |

## Project Overview

The Weather App is designed for daily travel and lifestyle scenarios, providing city weather queries, 7-day forecasts, humidity/pressure/wind/precipitation probability/UV index displays, saved cities, weather alerts, AI chat, and clothing/diet/activity/travel recommendations. The project also integrates 24 Solar Terms cards and detailed views, blending weather information with traditional cultural content.

## CS Concepts Explained

### 1. Client-Server Architecture

The project adopts a multi-client, multi-service architecture:

* Web Client: `web/`, React + React Router.
* Mobile Client: `mobile/`, Expo React Native + Expo Router.
* Backend Service: `sever/`, Express exposing REST APIs.
* AI Service: `AI/`, standalone Express service handling weather lifestyle recommendations and AI chat.

Clients communicate with the backend via HTTP requests, for example: `/api/weather/current`, `/api/weather/daily`, `/api/auth`, `/api/favorites`, `/api/ai/chat`. The backend, in turn, calls external APIs such as OpenWeatherMap, DeepSeek, and Amap, forming a layered architecture: "Frontend — Backend — External Services / AI Service."

### 2. REST API and Modular Routing

The backend organizes routes by functionality:

* `sever/src/routes/weather.js`: Current weather, forecasts, One Call daily, weather alerts.
* `sever/src/routes/solarTerm.js`: Query solar terms by date, return all 24 solar terms.
* `sever/src/routes/auth.js`: Registration, login, session restoration, user profile updates.
* `sever/src/routes/favorites.js`: CRUD operations for saved cities.
* `sever/src/routes/ai.js`: Proxies chat and recommendation requests to the AI service.
* `sever/src/routes/aiSuggestions.js`: Directly combines weather, solar terms, and DeepSeek to generate structured recommendations.

This separation allows each functional module to be independently maintained and tested, and enables both the Web and Mobile clients to reuse the same API.

### 3. Data Persistence and Degraded Storage

The project's primary storage uses MongoDB with Mongoose. The user model is located at `sever/src/models/User.js`, containing email, password hash, nickname, avatar, and saved cities.

To improve availability, the backend supports offline degradation when MongoDB is unreachable: instead of crashing, the service falls back to local JSON files:

* `sever/src/data/users.local.json`: Local user and favorites data.
* `sever/src/data/ai-responses.local.json`: Local AI response records, retaining up to the 200 most recent entries.

The corresponding logic resides in `sever/src/localUserStore.js` and `sever/src/localAiStore.js`.

### 4. Authentication and Security

During registration, the backend uses `bcryptjs` to hash passwords before storage. Upon successful login, the backend issues a JWT using `jsonwebtoken`. The Web client stores the token in `localStorage`, while the Mobile client stores it in `AsyncStorage`. Subsequent requests include `Authorization: Bearer <token>`.

Endpoints requiring authentication (e.g., saved cities and user profile) are protected by middleware at `sever/src/middleware/auth.js`.

### 5. External API Integration

The project integrates multiple external services:

* OpenWeatherMap: Current weather, 7-day forecasts, UV index, air quality, weather alerts.
* Amap (AutoNavi Maps): City geocoding, mobile weather fallback.
* DeepSeek: AI chat and natural-language lifestyle recommendations.

API calls within the AI service are encapsulated under `AI/src/ai/services/` (e.g., `openweather.js`, `amap.js`, `deepseek.js`), reducing coupling between the route layer and third-party APIs.

### 6. Caching, Fault Tolerance, and Fallback

The AI service uses `AI/src/ai/services/cache.js` to implement an in-memory cache based on `Map`, with a default TTL of 5 minutes, reducing redundant external API calls over short intervals.

The AI recommendation endpoint (`/api/ai/advice`) uses local rule engines (`layersEngine.js`, `foodEngine.js`, `activityEngine.js`) combined with LLM-enhanced suggestions from DeepSeek. When DeepSeek succeeds, more natural suggestions are appended; when DeepSeek fails, the local rule-based recommendations are still returned without blocking.

`fallbackEngine.js` provides standalone fallback logic and is wired into the AI chat route (`/api/ai/chat`) via `aiChat.js`.

For weather data, the mobile client includes a fallback path: it first requests OpenWeather data through the backend, and upon failure, attempts an Amap fallback.

### 7. Testing

The AI service includes Jest tests:

* `AI/src/ai/__tests__/activityEngine.test.js`
* `AI/src/ai/__tests__/foodEngine.test.js`
* `AI/src/ai/__tests__/layersEngine.test.js`
* `AI/src/ai/__tests__/integration.test.js`

The tests cover scenarios including rule engine output, city geocoding, OpenWeather data aggregation, cache hits, and DeepSeek failure degradation.

## Version 1 Summary

Version 1 primarily established the basic form of the weather application:

* Basic Web pages and UI framework.
* City weather query and basic weather information display.
* 7-day weather forecast display.
* Initial entry points for AI lifestyle recommendations, covering clothing, diet, and activity suggestions.
* Basic display of 24 Solar Terms cultural cards.
* Preliminary mobile adaptation and page prototypes.

The corresponding code is concentrated in early Web pages, mobile pages, weather query logic, and solar term resources.

GitHub Link: [https://github.com/Mingyue921/CS183-Weather-App/tree/v1](https://github.com/Mingyue921/CS183-Weather-App/tree/v1)

## Version 2 Summary

Version 2 builds upon v1 by adding the backend, AI service, authentication, and cross-platform integration capabilities:

* Added the Express backend, providing unified APIs for weather, solar terms, authentication, favorites, and AI proxying.
* Added a standalone AI service integrating Amap, OpenWeatherMap, DeepSeek, and a local rule engine.
* Added JWT registration/login, user profiles, and saved cities functionality.
* Added MongoDB persistence with local JSON degraded storage.
* Added server-side AI response persistence via local JSON files and a 5-minute in-memory cache in the AI service.
* The mobile client is connected to backend APIs, supporting login, favorites, weather alerts, solar term details, and AI recommendations.
* Added Jest unit tests and integration tests.
* Added root-level startup configuration for deploying backend services.

GitHub Link: [https://github.com/Mingyue921/CS183-Weather-App/tree/v2](https://github.com/Mingyue921/CS183-Weather-App/tree/v2)

## Comparison Evidence

### Feature Comparison

| Dimension | Version 1 | Version 2 |
| --- | --- | --- |
| Weather Data | Basic city weather query | Current weather, 7-day forecast, daily One Call, weather alerts |
| AI Recommendations | Preliminary AI recommendation entry points | DeepSeek + local rule engine + fallback |
| Solar Terms Content | Solar term card display | Solar term query API, Web/Mobile solar term images and details |
| User System | No complete authentication | JWT registration/login, session restoration, user profiles |
| Favorites | Primarily local favorites | Backend favorites API + mobile/frontend state persistence |
| Data Storage | Frontend state or local state | MongoDB + local JSON degradation |
| Fault Tolerance | Weak | Mobile weather Amap fallback, AI partial fallback (DeepSeek), DB degradation |
| Testing | Basic or absent | AI rule engine unit tests + integration tests |
| Cross-Platform | Web-focused | Web + Expo React Native mobile |
| Deployment | Local execution | root-level `npm start` |

### Code Evidence

| Evidence | Location |
| --- | --- |
| Backend REST API | `sever/src/routes/` |
| AI Service Entry Point | `AI/src/index.js` |
| AI Recommendation & Chat Routes | `AI/src/ai/routes/aiAdvice.js`, `AI/src/ai/routes/aiChat.js` |
| Rule Engines | `AI/src/ai/services/layersEngine.js`, `foodEngine.js`, `activityEngine.js`, `fallbackEngine.js` |
| Cache Implementation | `AI/src/ai/services/cache.js` |
| MongoDB User Model | `sever/src/models/User.js` |
| Local Degraded Storage | `sever/src/localUserStore.js`, `sever/src/localAiStore.js` |
| Web Pages | `web/src/Dashboard.js`, `web/src/AiHelper.js`, `web/src/Calendar.js` |
| Mobile Main App | `mobile/app/(tabs)/index.tsx` |
| AI Tests | `AI/src/ai/__tests__/` |

### Git Commit Evidence

The repository commit history shows the following key increments in v2:

* `d6c7f21` Connect web app to backend services
* `de844ed` Integrate mobile weather and AI updates
* `b737c73` Add AI weather code data
* `7fc1e2f` finish solar terms
* `d68b5bc` feat: add AI suggestions endpoint and server improvements
* `788d699` Route mobile weather through backend
* `45260cf` fix: add Dockerfile for Node.js environment
* `ddf257d` fix: add root package.json for Sealos deployment

## How to Run the Project

### 1. Backend Service

    cd sever
    npm install
    npm start

Default address: `http://localhost:3000`

Common environment variables:

    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/weather-app
    JWT_SECRET=your_jwt_secret
    WEATHER_API_KEY=your_openweather_key
    AI_SERVICE_BASE_URL=http://localhost:3001
    DEEPSEEK_API_KEY=your_deepseek_key

### 2. AI Service

    cd AI
    npm install
    npm start

    PORT=3001
    AMAP_API_KEY=your_amap_key
    WEATHER_API_KEY=your_openweather_key
    DEEPSEEK_API_KEY=your_deepseek_key

Run tests:

    cd AI
    npm test

### 3. Web Frontend

    cd web
    npm install
    npm start

Common environment variables:

    REACT_APP_API_BASE_URL=http://localhost:3000
    REACT_APP_WEATHER_KEY=your_amap_key

### 4. Mobile Client

    cd mobile
    npm install
    npm start

Common environment variables:

    EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000
    EXPO_PUBLIC_GAODE_API_KEY=your_amap_key

## Dependencies

### Backend: `sever/`

| Dependency | Purpose |
| --- | --- |
| `express` | Web service framework |
| `mongoose` | MongoDB ODM |
| `mongodb` | MongoDB native driver |
| `cors` | Cross-origin request support |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT authentication |
| `dotenv` | Environment variable management |

### AI Service: `AI/`

| Dependency | Purpose |
| --- | --- |
| `express` | AI service API |
| `axios` | HTTP request client |
| `dotenv` | Environment variable management |
| `jest` | Unit tests and integration tests |

### Web Frontend: `web/`

| Dependency | Purpose |
| --- | --- |
| `react` | UI framework |
| `react-dom` | DOM rendering |
| `react-router-dom` | Frontend routing |
| `react-scripts` | Create React App build tooling |
| `web-vitals` | Performance metrics |
| `@testing-library/*` | Frontend testing utilities |

### Mobile Client: `mobile/`

| Dependency | Purpose |
| --- | --- |
| `expo` | Expo application framework |
| `expo-router` | File-based routing |
| `react-native` | Native mobile rendering |
| `@react-native-async-storage/async-storage` | Local persistent storage |
| `@react-navigation/*` | Page navigation |
| `react-native-svg` | SVG icon rendering |
| `react-native-reanimated` | Animation support |
| `expo-image`, `expo-font`, `expo-haptics` | Mobile experience enhancements |
