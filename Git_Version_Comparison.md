# Git Version Comparison: v1 to v2

## 1. Overview

This document compares the project between the `v1` tag and the `v2` tag.

- **v1:** early prototype version
- **v2:** final implementation version after the latest AI service optimization

The project evolved from a basic weather application prototype into a more complete smart weather and AI lifestyle assistant system. The comparison covers the mobile app, web app, backend server, AI service, testing, and deployment preparation.

The main difference is that `v1` mainly demonstrated early weather search and basic UI functions, while `v2` provides an integrated cross-platform system with backend APIs, AI advice, user accounts, weather alerts, solar term culture, automated AI tests, deployment files, and improved AI fault tolerance.

---

## 2. Overall System Difference

### v1

In `v1`, the project was still an early prototype. The mobile app could search for weather and save favorite cities locally. Some early AI and data files existed, but the whole system was not yet fully integrated.

Main characteristics of `v1`:

- Basic mobile weather search prototype
- Direct weather API request from mobile frontend
- Local favorite city storage
- Early AI-related files and data
- Limited backend integration
- Limited web-backend connection
- No complete AI advice workflow
- No complete solar term module
- No deployment configuration
- Limited testing evidence

### v2

In `v2`, the project became a complete cross-platform weather assistant system.

Main characteristics of `v2`:

- React web frontend
- Expo React Native mobile frontend
- Node.js / Express backend server
- AI service for chat and lifestyle advice
- Weather forecast and weather alert APIs
- User registration and login
- Favorite city management
- 24 solar term culture module
- Automated tests for AI service
- Docker and deployment-related files
- Improved AI service cache, geocoding fallback, and error handling

---

## 3. Mobile App Comparison

### v1 Mobile App

The `v1` mobile app was a simple weather lookup prototype. It implemented:

- City input
- Current weather search
- Weather icon display
- Temperature display
- Favorite city button
- Local favorite city list
- Local storage using `AsyncStorage`

The mobile app directly requested OpenWeather data from the frontend.

### v1 Mobile Limitations

The `v1` mobile app did not include:

- Login or registration
- User profile
- Account information editing
- Backend-connected weather requests
- 7-day forecast
- Weather alerts
- AI chat
- AI lifestyle advice
- Amap city search
- Coordinate-based city selection
- Solar term pages
- Solar term detail pages
- Complete loading and error states
- Bottom navigation
- Polished mobile UI

### v2 Mobile App

The `v2` mobile app was significantly expanded. It now includes:

- Home weather page
- Current weather details
- Feels-like temperature
- High and low temperature
- Humidity, wind speed, and UV index
- 7-day forecast
- Amap city search
- Favorite city management with coordinates
- Login and registration
- User profile page
- Account information editing
- Weather alerts page
- AI chat page
- AI advice pages for travel, clothing, activity, and food
- 24 solar term list page
- Solar term detail pages
- Custom icons and image assets
- Loading states and error messages

### Mobile Improvement Summary

The mobile app changed from a single-page weather search demo into a complete smart weather assistant. It now supports richer weather information, user accounts, AI-powered lifestyle advice, weather alerts, better city search, and cultural content.

---

## 4. Web App Comparison

### v1 Web App

In `v1`, the web app was mainly an early frontend interface. It focused on basic layout and weather dashboard design. Backend connection was limited.

### v2 Web App

In `v2`, the web app became more complete and backend-connected. It includes:

- Login page
- Dashboard page
- Saved Location page
- AI Helper page
- Calendar page
- Setting page
- Sidebar navigation
- Weather dashboard display
- Saved location management
- Backend API request helper
- AI Helper connected to backend AI chat endpoint

### Web Improvement Summary

The web app improved from a mostly frontend dashboard prototype into a more complete web interface connected with backend services. The user can now use dashboard weather functions, saved locations, and AI Helper in a more integrated workflow.

---

## 5. Backend Comparison

### v1 Backend

In `v1`, the backend was not yet the central service layer of the system. The mobile frontend mainly requested weather data directly, and the full user, favorite, weather, alert, and AI workflows were not yet integrated.

### v2 Backend

In `v2`, the backend became the central integration layer. It is built with Node.js and Express.

The backend supports:

- Authentication APIs
- User profile APIs
- Favorite city APIs
- Weather APIs
- Weather alert APIs
- Solar term API
- AI chat API
- AI advice API
- AI suggestions API
- Health check endpoint
- MongoDB connection
- Local JSON user storage fallback when MongoDB is unavailable

### Backend Improvement Summary

The backend improved from a limited service into a central API layer. It now connects the web frontend, mobile frontend, database, weather services, and AI service. This makes the system more maintainable and easier to demonstrate.

---

## 6. AI Service Comparison

### v1 AI Work

In `v1`, AI-related work existed mainly as early files, data, or prototypes. It was not yet a complete tested service integrated with the application.

### v2 AI Service

In `v2`, the AI service became more structured and functional. It includes:

- AI advice route
- AI chat route
- Weather response processing
- OpenWeather service logic
- Amap service logic
- DeepSeek service logic
- Cache logic with stale-data fallback
- Clothing recommendation logic
- Activity advice logic
- Food advice logic
- Fallback advice logic
- Local city coordinate data for common city geocoding
- Automated tests

The AI service can generate weather-based advice for:

- Travel
- Clothing
- Activity
- Food

It also includes fallback behavior when AI requests fail.

### AI Improvement Summary

The AI part improved from early prototype logic into a structured service. It now supports AI chat, lifestyle advice, weather-based recommendation rules, fallback handling, and automated tests.

The latest AI optimization further improved reliability:

- `ownWeatherCodes.json` was replaced by `cityCoords.json` for local city coordinate lookup.
- Amap geocoding now uses an in-memory coordinate cache and can return local coordinates for common cities without always depending on an external Amap request.
- The AI advice cache now keeps stale entries instead of simply deleting expired data.
- If Amap geocoding or OpenWeather current weather fails but stale advice data exists, the AI advice route can return stale fallback data with a `stale` flag.
- The cache now has a maximum size to avoid unlimited memory growth.
- AI chat now handles UV index and air quality requests with `Promise.allSettled`, so one failed optional weather request does not break the whole chat response.
- Integration tests were updated to match the new cache behavior.

---

## 7. Solar Term Module Comparison

### v1

In `v1`, the solar term feature was not yet implemented as a complete user-facing module.

### v2

In `v2`, the 24 solar term module was completed. It includes:

- 24 solar term list page
- Four-season grouping
- Solar term image cards
- Solar term detail pages
- English names
- Pinyin display
- Overview
- Symbolic meaning
- Climate
- Origin
- Food
- Customs
- Wellness

### Solar Term Improvement Summary

The solar term module became a complete cultural feature in `v2`. It makes the application more distinctive by combining weather information with traditional Chinese seasonal culture.

---

## 8. Testing Comparison

### v1 Testing

In `v1`, testing evidence was limited. The project mainly relied on manual checks and prototype demonstration.

### v2 Testing

In `v2`, automated tests were added for the AI service using Jest.

Test result:

```text
4 test suites passed
25 tests passed
```

The automated tests cover:

- AI advice generation pipeline
- Clothing layer recommendation
- Food advice logic
- Activity advice logic
- Weather data processing
- Cache behavior, including fresh and stale cache handling
- Error handling
- Fallback behavior when DeepSeek AI is unavailable

Web and mobile functions were tested manually through the main user flows and verified with screenshots and demonstration video.

### Testing Improvement Summary

Testing improved from mostly manual checks to automated tests for important AI service logic. The latest integration test update also reflects the new stale-cache behavior. This provides stronger evidence that the AI advice logic and error handling work correctly.

---

## 9. Deployment Comparison

### v1

In `v1`, the project was mainly prepared for local development and demonstration. Deployment configuration was not complete.

### v2

In `v2`, deployment-related files were added and improved, including:

- Root `package.json`
- Dockerfile
- `.dockerignore`
- Node.js Docker environment setup

These files make the project easier to run in a server or cloud environment.

### Deployment Improvement Summary

The project improved from a local prototype toward a deployable system. The Docker and package configuration make deployment more practical.

---

## 10. Feature Comparison Table

| Area | v1 | v2 |
|---|---|---|
| Mobile weather search | Basic city input | Amap city search with coordinate selection |
| Mobile weather display | Current weather only | Current weather, details, and 7-day forecast |
| Favorite cities | Local city names | City objects with coordinates |
| Login/register | Not implemented | Implemented |
| User profile | Not implemented | Implemented |
| Account editing | Not implemented | Implemented |
| Web app | Basic frontend/dashboard work | Backend-connected web interface |
| Backend | Limited / not central | Central Express API service |
| AI | Early prototype/data | Structured AI chat and advice service with cache and fallback improvements |
| Weather alerts | Not implemented | Implemented |
| Solar terms | Not complete | Complete mobile solar term module |
| Tests | Limited | Jest tests for AI service |
| Deployment | Not ready | Docker and deployment files added |
| Error handling | Basic | Improved fallback, stale-cache recovery, and unavailable states |

---

## 11. Conclusion

The difference between `v1` and `v2` is significant.

In `v1`, the project was mainly an early prototype. The mobile app supported basic weather search, current temperature display, weather icons, and local favorite cities. Other parts such as backend integration, AI advice, solar terms, testing, and deployment were still incomplete.

In `v2`, the project became a complete smart weather and AI lifestyle assistant system. It includes a web app, mobile app, backend server, AI service, user accounts, weather alerts, favorite city management, AI chat, AI lifestyle advice, 24 solar term culture pages, automated AI tests, deployment files, and improved AI fallback behavior.

The main improvement is that the project evolved from a basic weather lookup prototype into an integrated cross-platform system. The `v2` version is more complete, more reliable, easier to demonstrate, and closer to a real-world weather assistant application.

