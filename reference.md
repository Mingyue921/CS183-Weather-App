# References

## Frontend and Mobile Development

1. React Documentation, “Built-in React Components.”  
   Used for learning React component structure, JSX-based UI composition, and reusable web frontend components used in the Dashboard, AI Helper, Calendar, Saved Location, and Setting pages.  
   https://react.dev/reference/react/components

2. React Router Documentation, “BrowserRouter” and “Route.”  
   Used for learning web page routing and navigation between Login, Dashboard, AI Helper, Saved Location, Calendar, and Setting pages.  
   https://reactrouter.com/api/declarative-routers/BrowserRouter  
   https://reactrouter.com/api/components/Route/

3. Create React App Documentation, “Getting Started” and “Deployment.”  
   Used for understanding the web app project structure, local development commands, production build process, and deployment preparation.  
   https://create-react-app.dev/docs/getting-started  
   https://create-react-app.dev/docs/deployment/

4. Expo Documentation, “Start Developing” and “Expo Router Layouts.”  
   Used for setting up and running the Expo React Native mobile app, and for understanding the app layout and tab-based mobile navigation structure.  
   https://docs.expo.dev/get-started/start-developing/  
   https://docs.expo.dev/router/basics/layout

5. React Native Documentation, “Core Components and APIs,” “TextInput,” and “ScrollView.”  
   Used for implementing mobile UI components such as weather cards, input fields, scrollable forecast lists, profile pages, alert pages, and solar term detail pages.  
   https://reactnative.dev/docs/components-and-apis  
   https://reactnative.dev/docs/textinput  
   https://reactnative.dev/docs/scrollview

6. React Native Async Storage Documentation, “API.”  
   Used for storing mobile login state, current user data, and favorite city data locally with `getItem`, `setItem`, and related storage methods.  
   https://react-native-async-storage.github.io/async-storage/docs/api/

7. React Navigation Documentation, “Bottom Tabs Navigator.”  
   Used as a reference for bottom tab navigation design and mobile navigation behavior.  
   https://reactnavigation.org/docs/bottom-tab-navigator

## Backend and Database

8. Express.js Documentation, “Using Middleware.”  
   Used for learning Express middleware, route registration, request handling, JSON parsing, CORS setup, error handling, and backend API structure.  
   https://expressjs.com/en/guide/using-middleware

9. Mongoose Documentation, “Schemas.”  
   Used for defining user data models, including email, password, nickname, avatar URL, and favorite city fields.  
   https://mongoosejs.com/docs/guides.html

10. JSON Web Token Documentation, `jsonwebtoken` package README.  
    Used for implementing authentication tokens, including signing login tokens and verifying protected API requests.  
    https://www.npmjs.com/package/jsonwebtoken

## Weather and Location APIs

11. OpenWeather Documentation, “Current Weather Data.”  
    Used for requesting current weather data by city name or coordinates, and for parsing weather fields such as temperature, humidity, wind speed, and weather description.  
    https://openweathermap.org/api/current

12. OpenWeather Documentation, “One Call API 3.0.”  
    Used for daily forecast data and official weather alert data. The project uses this documentation for 7-day/8-day weather forecast handling and weather alert fields such as sender, event, start time, end time, description, and tags.  
    https://openweathermap.org/api/one-call-3

13. Amap Open Platform Documentation, “Web Service API: Geocoding / Reverse Geocoding.”  
    Used for converting city/place names into coordinates and reverse geocoding coordinates into location information for mobile city search and fallback logic.  
    https://developer.amap.com/api/webservice/guide/api/georegeo

14. Amap Open Platform Documentation, “Web Service API: Input Tips.”  
    Used for city and place search suggestions in the mobile city search page.  
    https://developer.amap.com/api/webservice/guide/api/inputtips

15. Amap Open Platform Documentation, “Web Service API: Weather Query.”  
    Used as a fallback weather data source when OpenWeather or backend weather requests are unavailable.  
    https://developer.amap.com/api/webservice/guide/api/weatherinfo

## AI Service

16. DeepSeek API Documentation, “Create Chat Completion.”  
    Used for implementing AI chat and weather-based lifestyle advice generation. The project uses chat completion requests with system/user messages to generate travel, clothing, activity, and food suggestions.  
    https://api-docs.deepseek.com/api/create-chat-completion

17. DeepSeek API Documentation, “Your First API Call.”  
    Used for learning the basic DeepSeek API request format, authentication method, base URL, and chat completion call structure.  
    https://api-docs.deepseek.com/

## Testing and Deployment

18. Jest Documentation, “Mock Functions” and “Using Matchers.”  
    Used for writing AI service tests, mocking external services such as Amap, OpenWeather, DeepSeek, and cache modules, and checking expected response fields.  
    https://jestjs.io/docs/30.0/mock-functions  
    https://archive.jestjs.io/docs/en/22.x/using-matchers

19. Docker Documentation, “Dockerfile Reference.”  
    Used for writing and improving the project Dockerfile, including Node.js image selection, working directory setup, dependency installation, copy instructions, exposed ports, and startup command.  
    https://docs.docker.com/reference/dockerfile/