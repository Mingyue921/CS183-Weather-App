# Tests

## 1. Automated Tests

The AI service was tested with Jest.

Test command:

```text
cd AI
npm.cmd test -- --runInBand
```

Test result:

```text
4 test suites passed
25 tests passed
```

This means that all 4 test files and all 25 test cases passed successfully.

Test files:

```text
activityEngine.test.js
foodEngine.test.js
integration.test.js
layersEngine.test.js
```

The automated tests cover:

- AI advice generation pipeline
- Clothing layer recommendation logic
- Food advice logic
- Activity advice logic
- Weather data processing
- Cache behavior
- Error handling when city input is missing
- Error handling when geocoding fails
- Fallback behavior when DeepSeek AI is unavailable

## 2. Manual Functional Tests

In addition to automated tests, the main Web and Mobile functions were tested manually.

### Web Testing

The following Web functions were tested:

- Open Login page
- Navigate to Dashboard page
- Search weather by city
- View weather cards and forecast information
- Open Saved Location page
- Add and remove saved cities
- Open Calendar page
- Open AI Helper page
- Send a weather-related question to AI Helper
- Open Setting page

### Mobile Testing

The following Mobile functions were tested:

- Open Home page
- Load current city weather
- View temperature, humidity, wind speed, UV index, and 7-day forecast
- Search and switch city
- Save current city to favorites
- Open Favorites / Collection page
- Open Weather Alerts page
- Open AI Chat and send a question
- Open AI Advice pages, including Travel, Clothing, Activity, and Food
- Open Solar Terms page
- Open Solar Term Detail page
- Log in and register account
- Edit user nickname and avatar URL

## 3. Backend API Tests

Backend APIs were tested through frontend requests and direct API behavior during development.

The tested backend functions include:

- User registration
- User login
- Current user information request
- Profile update
- Add and remove favorite cities
- Daily weather forecast request
- Weather alert request
- AI chat request
- AI advice request
- AI suggestions request
- Local JSON user storage fallback when MongoDB is unavailable

## 4. Demonstration-Based Verification

The final system was also verified through a demonstration video and screenshots.

The demonstration covers:

- Web Dashboard weather search
- Web Saved Location
- Web AI Helper
- Mobile Home weather page
- Mobile city search
- Mobile favorite cities
- Mobile Weather Alerts
- Mobile AI Chat
- Mobile AI Advice
- Mobile Solar Terms
- Mobile Solar Term Detail

## 5. Testing Limitations

The current automated tests mainly cover the AI service. Web and Mobile UI functions were verified through manual functional testing, screenshots, and the demonstration video. Future work could add automated Web component tests, backend API tests, and end-to-end tests for full user flows.