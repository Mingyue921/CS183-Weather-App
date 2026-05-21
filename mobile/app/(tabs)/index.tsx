import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  StyleSheet, Image, ActivityIndicator, FlatList, Alert
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import { SvgUri } from 'react-native-svg';
import { SOLAR_TERM_DETAILS } from '../../constants/solarTermDetails';

// ==========================================
// 🔑 全局配置 (自动读取根目录 .env 文件)
// ==========================================
const API_KEYS = {
  OPENWEATHER: process.env.EXPO_PUBLIC_WEATHER_API_KEY,
  AMAP: process.env.EXPO_PUBLIC_GAODE_API_KEY
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:3000';
const DEFAULT_USER = {
  id: '0000001',
  email: '',
  nickname: '晴天小暖',
  avatarUrl: '',
  favorites: [],
};

const ADVICE_TYPES: Record<string, string> = {
  travel: '出行建议',
  clothing: '穿衣建议',
  activity: '活动建议',
  diet: '饮食建议',
};

const buildWeatherContext = (weatherData, location) => ({
  city: location?.name,
  weather: weatherData?.current ? {
    temp: weatherData.current.temp,
    feelsLike: weatherData.current.feels_like,
    humidity: weatherData.current.humidity,
    windSpeed: weatherData.current.wind_speed,
    description: weatherData.current.weather?.[0]?.description,
  } : null,
});

const apiRequest = async (path: string, options: RequestInit = {}) => {
  const token = await AsyncStorage.getItem('authToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || `请求失败 ${response.status}`);
  }
  return data;
};

const THEME = {
  bg: '#F8EFE4', cardBg: '#FFFFFF', primary: '#F5A14A', 
  textDark: '#333333', textLight: '#999999', blueText: '#5AA7EB',
  shadow: 'rgba(245, 161, 74, 0.12)' 
};

const getWeatherIconCode = (text = '') => {
  if (text.includes('雷')) return '11d';
  if (text.includes('雪')) return '13d';
  if (text.includes('雨')) return '10d';
  if (text.includes('雾') || text.includes('霾')) return '50d';
  if (text.includes('阴')) return '04d';
  if (text.includes('云')) return '02d';
  return '01d';
};

const toNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

// 24节气大致日期对照表 (MM-DD)
const SOLAR_TERMS = [
  { name: '小寒', date: '01-05' }, { name: '大寒', date: '01-20' },
  { name: '立春', date: '02-04' }, { name: '雨水', date: '02-19' },
  { name: '惊蛰', date: '03-05' }, { name: '春分', date: '03-20' },
  { name: '清明', date: '04-04' }, { name: '谷雨', date: '04-20' },
  { name: '立夏', date: '05-05' }, { name: '小满', date: '05-21' },
  { name: '芒种', date: '06-05' }, { name: '夏至', date: '06-21' },
  { name: '小暑', date: '07-07' }, { name: '大暑', date: '07-22' },
  { name: '立秋', date: '08-07' }, { name: '处暑', date: '08-23' },
  { name: '白露', date: '09-07' }, { name: '秋分', date: '09-23' },
  { name: '寒露', date: '10-08' }, { name: '霜降', date: '10-23' },
  { name: '立冬', date: '11-07' }, { name: '小雪', date: '11-22' },
  { name: '大雪', date: '12-07' }, { name: '冬至', date: '12-21' }
];

const SOLAR_TERM_IMAGES: Record<string, number> = {
  '立春': require('../../assets/solar-terms/lichun.png'),
  '雨水': require('../../assets/solar-terms/yushui.png'),
  '惊蛰': require('../../assets/solar-terms/jingzhe.png'),
  '春分': require('../../assets/solar-terms/chunfen.png'),
  '清明': require('../../assets/solar-terms/qingming.png'),
  '谷雨': require('../../assets/solar-terms/guyu.png'),
  '立夏': require('../../assets/solar-terms/lixia.png'),
  '小满': require('../../assets/solar-terms/xiaoman.png'),
  '芒种': require('../../assets/solar-terms/mangzhong.png'),
  '夏至': require('../../assets/solar-terms/xiazhi.png'),
  '小暑': require('../../assets/solar-terms/xiaoshu.png'),
  '大暑': require('../../assets/solar-terms/dashu.png'),
  '立秋': require('../../assets/solar-terms/liqiu.png'),
  '处暑': require('../../assets/solar-terms/chushu.png'),
  '白露': require('../../assets/solar-terms/bailu.png'),
  '秋分': require('../../assets/solar-terms/qiufen.png'),
  '寒露': require('../../assets/solar-terms/hanlu.png'),
  '霜降': require('../../assets/solar-terms/shuangjiang.png'),
  '立冬': require('../../assets/solar-terms/lidong.png'),
  '小雪': require('../../assets/solar-terms/xiaoxue.png'),
  '大雪': require('../../assets/solar-terms/daxue.png'),
  '冬至': require('../../assets/solar-terms/dongzhi.png'),
  '小寒': require('../../assets/solar-terms/xiaohan.png'),
  '大寒': require('../../assets/solar-terms/dahan.png'),
};

//获取当前/下一个节气状态
const getSolarTermInfo = () => {
  const today = new Date();
  const current = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // 1. 判断今天是不是刚好是节气
  const exactMatch = SOLAR_TERMS.find(t => t.date === current);
  if (exactMatch) return { isToday: true, term: exactMatch };
  
  // 2. 否则，找下一个即将到来的节气
  const nextTerm = SOLAR_TERMS.find(t => t.date > current) || SOLAR_TERMS[0];
  return { isToday: false, term: nextTerm };
};

// ==========================================
// ☁️ 通用组件库
// ==========================================
const OpenWeatherIcon = ({ iconCode, size = 50 }: { iconCode: string; size?: number }) => (
  <Image source={{ uri: `https://openweathermap.org/img/wn/${iconCode}@4x.png` }} style={{ width: size, height: size }} resizeMode="contain" />
);

const ICONS: Record<string, number> = {
  '心形': require('../../assets/icons/heart.svg'),
  '红心': require('../../assets/icons/heart-filled.svg'),
  '搜索': require('../../assets/icons/search.svg'),
  '定位': require('../../assets/icons/location.svg'),
  '主页': require('../../assets/icons/home.svg'),
  'AI': require('../../assets/icons/chat.svg'),
  '我的': require('../../assets/icons/profile.svg'),
  '湿度': require('../../assets/icons/humidity.svg'),
  '风速': require('../../assets/icons/wind.svg'),
  '防晒': require('../../assets/icons/uv.svg'),
  '设置': require('../../assets/icons/settings.svg'),
  '预警': require('../../assets/icons/warning.svg'),
  '车': require('../../assets/icons/travel.svg'),
  '衣': require('../../assets/icons/clothes.svg'),
  '动': require('../../assets/icons/activity.svg'),
  '食': require('../../assets/icons/food.svg'),
  '通知': require('../../assets/icons/notification.svg'),
  '云': require('../../assets/icons/offline.svg'),
  '主题': require('../../assets/icons/theme.svg'),
  '隐私': require('../../assets/icons/privacy.svg'),
  '帮助': require('../../assets/icons/help.svg'),
  '关于': require('../../assets/icons/about.svg'),
  '退出': require('../../assets/icons/logout.svg'),
  '管理城市': require('../../assets/icons/city.svg'),
};

const PROFILE_SETTING_ICONS: Record<string, string> = {
  '账号信息': '我的',
  '主题外观': '主题',
  '隐私安全': '隐私',
  '帮助与反馈': '帮助',
  '关于应用': '关于',
};

const UiIcon = ({ name, size = 20, color = THEME.primary, bg = 'transparent', radius = 10 }: { name: string; size?: number; color?: string; bg?: string; radius?: number }) => {
  const iconModule = ICONS[name];
  const assetUri = iconModule ? Asset.fromModule(iconModule).uri : null;
  const fallbackMap: Record<string, string> = { '返回': '‹', '箭头': '›' };

  return (
    <View style={{ width: size*1.8, height: size*1.8, backgroundColor: bg, justifyContent: 'center', alignItems: 'center', borderRadius: radius }}>
      {assetUri ? (
        <SvgUri uri={assetUri} width={size} height={size} opacity={color === '#ccc' ? 0.35 : 1} />
      ) : (
        <Text style={{ fontSize: size, color: color }}>{fallbackMap[name] || '★'}</Text>
      )}
    </View>
  );
};

// ==========================================
// 📱 核心主程序 (全局数据流)
// ==========================================
export default function WeatherApp() {
  const [currentScreen, setCurrentScreen] = useState('Home'); 
  const [isLogged, setIsLogged] = useState(false);
  const [currentUser, setCurrentUser] = useState(DEFAULT_USER);
  const [globalLocation, setGlobalLocation] = useState({ name: '福州市', lat: '26.08', lon: '119.30' });
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [selectedSolarTerm, setSelectedSolarTerm] = useState('立春');
  const [selectedAdviceType, setSelectedAdviceType] = useState('travel');
  const [alertReturnScreen, setAlertReturnScreen] = useState('Home');

  useEffect(() => {
    const restoreSession = async () => {
      const token = await AsyncStorage.getItem('authToken');
      const savedUser = await AsyncStorage.getItem('currentUser');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
      if (token) {
        setIsLogged(true);
        try {
          const data = await apiRequest('/api/auth/me');
          setCurrentUser(data.user);
          await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
        } catch {
          await AsyncStorage.multiRemove(['authToken', 'currentUser']);
          setIsLogged(false);
          setCurrentUser(DEFAULT_USER);
        }
      }
    };
    restoreSession();
  }, []);

  useEffect(() => {
    const fetchAmapWeather = async () => {
      const geoUrl = `https://restapi.amap.com/v3/geocode/regeo?location=${globalLocation.lon},${globalLocation.lat}&key=${API_KEYS.AMAP}&extensions=base`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();
      const adcode = geoData?.regeocode?.addressComponent?.adcode;

      if (!adcode) {
        throw new Error('高德逆地理编码未返回城市编码');
      }

      const weatherUrl = `https://restapi.amap.com/v3/weather/weatherInfo?city=${adcode}&key=${API_KEYS.AMAP}&extensions=all`;
      const weatherRes = await fetch(weatherUrl);
      const amapData = await weatherRes.json();
      const forecast = amapData?.forecasts?.[0];

      if (amapData.status !== '1' || !forecast?.casts?.length) {
        throw new Error(amapData.info || '高德天气接口未返回天气数据');
      }

      const today = forecast.casts[0];
      const casts = forecast.casts;
      const currentTemp = toNumber(today.daytemp);
      const currentWeather = today.dayweather || today.nightweather || '晴';

      return {
        current: {
          temp: currentTemp,
          feels_like: currentTemp,
          humidity: 0,
          wind_speed: toNumber(today.daypower),
          uvi: 0,
          weather: [{ description: currentWeather, icon: getWeatherIconCode(currentWeather) }]
        },
        daily: casts.map((day) => {
          const description = day.dayweather || day.nightweather || '晴';
          return {
            dt: new Date(day.date).getTime() / 1000,
            temp: {
              max: toNumber(day.daytemp),
              min: toNumber(day.nighttemp)
            },
            weather: [{ description, icon: getWeatherIconCode(description) }]
          };
        })
      };
    };

    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${globalLocation.lat}&lon=${globalLocation.lon}&appid=${API_KEYS.OPENWEATHER}&units=metric&lang=zh_cn`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`OpenWeather HTTP ${res.status}`);
        }
        const data = await res.json();
        setWeatherData(data);
      } catch (e) {
        console.warn("OpenWeather 获取失败，尝试使用高德天气兜底", e);
        try {
          const fallbackData = await fetchAmapWeather();
          setWeatherData(fallbackData);
        } catch (fallbackError) {
          console.error("获取天气失败", fallbackError);
        }
      }
      setWeatherLoading(false);
    };
    fetchWeather();
  }, [globalLocation]);

  const navigate = (screenName, params) => {
    if (params?.newLocation) setGlobalLocation(params.newLocation);
    if (params?.termName) setSelectedSolarTerm(params.termName);
    if (params?.adviceType) setSelectedAdviceType(params.adviceType);
    if (screenName === 'WeatherAlerts') setAlertReturnScreen(params?.returnTo || currentScreen);
    setCurrentScreen(screenName);
  };

  const renderBottomTabs = () => {
    if (!['Home', 'AI', 'Profile', 'Auth'].includes(currentScreen)) return null;
    return (
      <View style={styles.customTabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigate('Home')}>
          <UiIcon name="主页" size={22} color={currentScreen === 'Home' ? THEME.primary : '#ccc'} />
          <Text style={[styles.tabText, { color: currentScreen === 'Home' ? THEME.primary : '#ccc' }]}>首页</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigate('AI')}>
          <UiIcon name="AI" size={24} color={currentScreen === 'AI' ? THEME.primary : '#ccc'} />
          <Text style={[styles.tabText, { color: currentScreen === 'AI' ? THEME.primary : '#ccc' }]}>AI对话</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigate(isLogged ? 'Profile' : 'Auth')}>
          <UiIcon name="我的" size={22} color={(currentScreen === 'Profile' || currentScreen === 'Auth') ? THEME.primary : '#ccc'} />
          <Text style={[styles.tabText, { color: (currentScreen === 'Profile' || currentScreen === 'Auth') ? THEME.primary : '#ccc' }]}>我的</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }}>
        {currentScreen === 'Home' && <HomeScreen navigate={navigate} location={globalLocation} weatherData={weatherData} loading={weatherLoading} />}
        {currentScreen === 'AI' && <ChatScreen weatherData={weatherData} location={globalLocation} loading={weatherLoading} />}
        {currentScreen === 'Profile' && <ProfileScreen navigate={navigate} setIsLogged={setIsLogged} user={currentUser} setCurrentUser={setCurrentUser} />}
        {currentScreen === 'Auth' && <AuthScreen navigate={navigate} setIsLogged={setIsLogged} setCurrentUser={setCurrentUser} />}
        {currentScreen === 'CitySearch' && <CitySearchScreen navigate={navigate} />}
        {currentScreen === 'Collection' && <CollectionScreen navigate={navigate} />}
        {currentScreen === 'SolarTerms' && <SolarTermsScreen navigate={navigate} />}
        {currentScreen === 'SolarTermDetail' && <SolarTermDetailScreen navigate={navigate} termName={selectedSolarTerm} />}
        {currentScreen === 'AccountInfo' && <AccountInfoScreen navigate={navigate} user={currentUser} setCurrentUser={setCurrentUser} />}
        {currentScreen === 'WeatherAlerts' && <WeatherAlertsScreen navigate={navigate} location={globalLocation} returnTo={alertReturnScreen} />}
        {currentScreen === 'AdviceDetail' && <AdviceDetailScreen navigate={navigate} type={selectedAdviceType} weatherData={weatherData} location={globalLocation} />}
        {renderBottomTabs()}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ==========================================
// 📱 页面 1：首页
// ==========================================
function HomeScreen({ navigate, location, weatherData, loading }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { term } = getSolarTermInfo(); 

  useEffect(() => {
    checkFavoriteStatus(location.name);
  }, [location]);

  const checkFavoriteStatus = async (cityName) => {
    const saved = await AsyncStorage.getItem('favorites');
    const favList = saved ? JSON.parse(saved) : [];
    setIsFavorite(favList.some(item => item.name === cityName));
  };

  const toggleFavorite = async () => {
    const saved = await AsyncStorage.getItem('favorites');
    let favList = saved ? JSON.parse(saved) : [];
    if (isFavorite) {
      favList = favList.filter(item => item.name !== location.name);
    } else {
      favList.push(location);
    }
    await AsyncStorage.setItem('favorites', JSON.stringify(favList));
    setIsFavorite(!isFavorite);
  };

  if (loading || !weatherData) return <View style={styles.center}><ActivityIndicator size="large" color={THEME.primary}/></View>;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={toggleFavorite} style={styles.iconBtn}>
          <UiIcon name={isFavorite ? '红心' : '心形'} size={18} color="#FF6B6B" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <UiIcon name="定位" size={14} color={THEME.primary} />
          <Text style={styles.cityText}>{location.name}</Text>
        </View>
        <TouchableOpacity onPress={() => navigate('CitySearch')} style={styles.iconBtn}>
          <UiIcon name="搜索" size={18} color={THEME.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.mainWeatherTop}>
          <View>
            <Text style={styles.hugeTemp}>{Math.round(weatherData.current.temp)}°</Text>
            <Text style={styles.weatherDesc}>{weatherData.current.weather[0].description}</Text>
          </View>
          <View style={styles.weatherIconBox}>
            <OpenWeatherIcon iconCode={weatherData.current.weather[0].icon} size={70} />
          </View>
        </View>
        <View style={styles.tempRangeBox}>
          <Text style={{color: THEME.textLight}}>
            <Text style={{color: '#FF6B6B', fontWeight: 'bold'}}>{Math.round(weatherData.daily[0].temp.max)}°</Text> 最高   
            <Text style={{color: THEME.blueText, fontWeight: 'bold'}}>  {Math.round(weatherData.daily[0].temp.min)}°</Text> 最低
          </Text>
          <Text style={{color: THEME.textLight}}>体感温度 <Text style={{color: THEME.blueText, fontWeight: 'bold'}}>{Math.round(weatherData.current.feels_like)}°</Text></Text>
        </View>
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}><UiIcon name="湿度" size={16} color="#F5A14A"/><Text style={styles.detailTitle}>湿度</Text><Text style={styles.detailVal}>{weatherData.current.humidity ? `${weatherData.current.humidity}%` : '--'}</Text></View>
          <View style={styles.detailItem}><UiIcon name="风速" size={16} color="#F5A14A"/><Text style={styles.detailTitle}>风速</Text><Text style={styles.detailVal}>{weatherData.current.wind_speed}m/s</Text></View>
          <View style={styles.detailItem}><UiIcon name="防晒" size={16} color="#F5A14A"/><Text style={styles.detailTitle}>紫外线</Text><Text style={styles.detailVal}>{Math.round(weatherData.current.uvi)}</Text></View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>未来7日预报</Text>
          <UiIcon name="箭头" size={14} color="#ccc" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {weatherData.daily.slice(1, 8).map((day, i) => {
             const dateObj = new Date(day.dt * 1000);
            const dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
            const displayDate = i === 0 ? '明天' : dateStr;
            return (
              <View key={i} style={{ alignItems: 'center', marginRight: 28 }}>
                <Text style={styles.detailTitle}>{displayDate}</Text>
                <OpenWeatherIcon iconCode={day.weather[0].icon} size={40} />
                <Text style={styles.detailVal}>{Math.round(day.temp.max)}°</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>生活指数</Text>
          <UiIcon name="箭头" size={14} color="#ccc" />
        </View>
        <View style={styles.lifeIndexGrid}>
          <TouchableOpacity style={styles.lifeItem} onPress={() => navigate('WeatherAlerts', { returnTo: 'Home' })}><UiIcon name="预警" size={20} color="#F5A14A" bg="#FFF4E6" /><Text style={styles.lifeText}>预警</Text></TouchableOpacity>
          <TouchableOpacity style={styles.lifeItem} onPress={() => navigate('AdviceDetail', { adviceType: 'travel' })}><UiIcon name="车" size={20} color="#4CAF50" bg="#E8F5E9" /><Text style={styles.lifeText}>出行</Text></TouchableOpacity>
          <TouchableOpacity style={styles.lifeItem} onPress={() => navigate('AdviceDetail', { adviceType: 'clothing' })}><UiIcon name="衣" size={20} color="#E91E63" bg="#FCE4EC" /><Text style={styles.lifeText}>穿衣</Text></TouchableOpacity>
          <TouchableOpacity style={styles.lifeItem} onPress={() => navigate('AdviceDetail', { adviceType: 'activity' })}><UiIcon name="动" size={20} color="#2196F3" bg="#E3F2FD" /><Text style={styles.lifeText}>活动</Text></TouchableOpacity>
          <TouchableOpacity style={styles.lifeItem} onPress={() => navigate('AdviceDetail', { adviceType: 'diet' })}><UiIcon name="食" size={20} color="#F44336" bg="#FFEBEE" /><Text style={styles.lifeText}>饮食</Text></TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.solarCard} onPress={() => navigate('SolarTerms')}>
        <Text style={{color: '#E57373', fontSize: 12, position: 'absolute', top: 15, left: 15}}>传统节气</Text>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#D34C4C', marginVertical: 10 }}>节气文化</Text>
        <Text style={{color: '#D34C4C', fontSize: 12}}>{term.name} · {term.date}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ==========================================
// 📱 页面 2：AI 对话
// ==========================================
function ChatScreen({ weatherData, location, loading }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '你好，我是智能天气助手。可以问我出行、穿衣、活动或饮食建议。' },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setSending(true);
    try {
      const context = buildWeatherContext(weatherData, location);
      const data = await apiRequest('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text, ...context }),
      });
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: `暂时无法连接 AI 服务：${error.message}` }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: THEME.textDark, textAlign: 'center', marginBottom: 15 }}>实时天气</Text>
        {!loading && weatherData && (
          <View style={[styles.card, { flexDirection: 'row', alignItems: 'center', padding: 15, marginBottom: 10 }]}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                <UiIcon name="定位" size={14} color={THEME.textLight} />
                <Text style={{ fontSize: 16, color: THEME.textLight, marginLeft: 4 }}>{location.name}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 40, fontWeight: 'bold', color: THEME.textDark, lineHeight: 45 }}>{Math.round(weatherData.current.temp)}°</Text>
                <Text style={{ fontSize: 16, color: THEME.textLight, marginLeft: 10, marginBottom: 5 }}>{weatherData.current.weather[0].description}</Text>
              </View>
            </View>
            <View style={[styles.weatherIconBox, { width: 60, height: 60 }]}>
              <OpenWeatherIcon iconCode={weatherData.current.weather[0].icon} size={50} />
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.chatBox}>
        <View style={styles.chatHeaderBadge}><Text style={{ color: THEME.textDark, fontWeight: 'bold' }}>智能对话助手</Text></View>
        <ScrollView style={{ flex: 1, padding: 20 }}>
          {messages.map((message, index) => {
            const isUser = message.role === 'user';
            return (
              <View key={index} style={[styles.messageRow, isUser ? styles.userMessageRow : styles.aiMessageRow]}>
                {!isUser && <UiIcon name="AI" size={20} bg="#FFD8B2" radius={20} />}
                <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
                  <Text style={styles.messageText}>{message.text}</Text>
                </View>
                {isUser && <UiIcon name="我的" size={20} bg="#eee" radius={20} />}
              </View>
            );
          })}
          {sending && <Text style={{ color: THEME.textLight, marginBottom: 10 }}>正在思考...</Text>}
        </ScrollView>
        <View style={styles.chatInputArea}>
          <TextInput style={styles.chatInput} placeholder="请输入问题......" value={input} onChangeText={setInput} />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}><Text style={{color: '#fff', fontWeight: 'bold'}}>发送</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ==========================================
// 📱 页面 3：我的
// ==========================================
function ProfileScreen({ navigate, setIsLogged, user, setCurrentUser }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
      <View style={[styles.headerRow, {justifyContent: 'center'}]}>
        <TouchableOpacity style={{position: 'absolute', left: 0}}><UiIcon name="设置" size={20} color="#F5A14A" /></TouchableOpacity>
        <Text style={{fontSize: 18, fontWeight: 'bold'}}>我的</Text>
      </View>

      <View style={[styles.card, { flexDirection: 'row', alignItems: 'center', padding: 25 }]}>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.profileAvatar} />
        ) : (
          <View style={styles.profileAvatar}><Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold' }}>{user.nickname?.slice(0, 1) || '晴'}</Text></View>
        )}
        <View style={{ marginLeft: 20, flex: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: THEME.textDark }}>{user.nickname || '晴天小暖'}</Text>
          <Text style={{ color: THEME.textLight, fontSize: 13, marginTop: 6 }}>ID: {user.id || '0000001'}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitleLabel}>我的服务</Text>
      <View style={[styles.card, { padding: 20 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigate('Collection')}>
            <UiIcon name="心形" size={20} color="#E91E63" bg="#FCE4EC" radius={15} />
            <Text style={{ fontSize: 12, marginTop: 8, color: THEME.textDark }}>我的收藏</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigate('WeatherAlerts', { returnTo: 'Profile' })}><UiIcon name="通知" size={20} color="#4CAF50" bg="#E8F5E9" radius={15} /><Text style={{ fontSize: 12, marginTop: 8, color: THEME.textDark }}>预警通知</Text></TouchableOpacity>
          <View style={{ alignItems: 'center' }}><UiIcon name="管理城市" size={20} color="#FF9800" bg="#FFF3E0" radius={15} /><Text style={{ fontSize: 12, marginTop: 8, color: THEME.textDark }}>管理城市</Text></View>
          <View style={{ alignItems: 'center' }}><UiIcon name="云" size={20} color="#2196F3" bg="#E3F2FD" radius={15} /><Text style={{ fontSize: 12, marginTop: 8, color: THEME.textDark }}>离线数据</Text></View>
        </View>
      </View>

      <Text style={styles.sectionTitleLabel}>设置与帮助</Text>
      <View style={styles.card}>
        {['账号信息', '主题外观', '隐私安全', '帮助与反馈', '关于应用'].map((item, index) => (
          <TouchableOpacity key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: index===4?0:1, borderColor: '#f5f5f5' }} onPress={() => item === '账号信息' && navigate('AccountInfo')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <UiIcon name={PROFILE_SETTING_ICONS[item]} size={16} color={THEME.textLight} bg="#F9F9F9" />
              <Text style={{ marginLeft: 10, color: THEME.textDark }}>{item}</Text>
            </View>
            <UiIcon name="箭头" size={14} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.card, {alignItems: 'center', padding: 15}]} onPress={async () => { await AsyncStorage.multiRemove(['authToken', 'currentUser']); setCurrentUser(DEFAULT_USER); setIsLogged(false); navigate('Auth'); }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <UiIcon name="退出" size={16} color={THEME.primary} />
          <Text style={{ color: THEME.primary, fontWeight: 'bold', marginLeft: 6 }}>Log out</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ==========================================
// 📱 页面 4：智能搜索 (✨ 终极版：强行置顶省市区 ✨)
// ==========================================
function CitySearchScreen({ navigate }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [errorMsg, setErrorMsg] = useState(''); 
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (!query) { setSuggestions([]); setErrorMsg(''); return; }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    // 防抖 500ms
    debounceTimer.current = setTimeout(() => fetchAmapSuggestions(query), 500);
    return () => clearTimeout(debounceTimer.current);
  }, [query]);

  const fetchAmapSuggestions = async (keyword) => {
    try {
      setErrorMsg('');
      
      // ✨ 核心改进：双管齐下，同时请求 [地理编码(查区划)] 和 [输入提示(查具体地点)] ✨
      const geoUrl = `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(keyword)}&key=${API_KEYS.AMAP}`;
      const tipsUrl = `https://restapi.amap.com/v3/assistant/inputtips?keywords=${encodeURIComponent(keyword)}&key=${API_KEYS.AMAP}`;
      
      const [geoRes, tipsRes] = await Promise.all([ fetch(geoUrl), fetch(tipsUrl) ]);
      const geoData = await geoRes.json();
      const tipsData = await tipsRes.json();

      let mergedResults = [];

      // 1. 强行置顶行政区：解析地理编码 API 的结果
      if (geoData.status === '1' && geoData.geocodes && geoData.geocodes.length > 0) {
        const exactRegion = geoData.geocodes[0];
        mergedResults.push({
          id: 'geo_' + exactRegion.location,
          name: keyword, // 用户搜什么，大标题就是什么
          district: exactRegion.formatted_address, // 显示官方全称，如：福建省漳州市芗城区
          location: exactRegion.location,
          isAdmin: true // 标记为行政区划，用于前端高亮
        });
      }

      // 2. 拼接具体地点：解析原来的输入提示 API 结果
      if (tipsData.status === '1' && tipsData.tips) {
        const validTips = tipsData.tips
          .filter(item => item.location && typeof item.location === 'string')
          .map(item => ({
            id: item.id || 'tip_' + item.location,
            name: item.name,
            district: item.district,
            location: item.location,
            isAdmin: false
          }));

        // 去重：如果具体地点里有和上面行政区一模一样的坐标，就去掉它
        const geoLoc = mergedResults.length > 0 ? mergedResults[0].location : '';
        const filteredTips = validTips.filter(t => t.location !== geoLoc);

        // 把具体地点追加到行政区划的下面
        mergedResults = [...mergedResults, ...filteredTips];
      }

      setSuggestions(mergedResults);
      if(mergedResults.length === 0) setErrorMsg('未找到包含该关键字的地点');

    } catch { 
      setErrorMsg('网络请求失败'); 
    }
  };

  const handleSelect = (item) => {
    const [lon, lat] = item.location.split(',');
    // 跳转回首页，传递坐标和名字
    navigate('Home', { newLocation: { name: item.name, lat, lon } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => navigate('Home')} style={{padding: 10}}>
          <UiIcon name="返回" size={24} />
        </TouchableOpacity>
        <TextInput 
          style={styles.searchInput} 
          placeholder="请输入中文地点，例如：北京" 
          value={query} onChangeText={setQuery} autoFocus 
        />
      </View>

      {errorMsg ? <Text style={{ color: 'red', textAlign: 'center', marginTop: 10, paddingHorizontal: 20, fontWeight: 'bold' }}>{errorMsg}</Text> : null}

      <FlatList 
        data={suggestions}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <TouchableOpacity style={[styles.suggestItem, item.isAdmin && { backgroundColor: '#FFF9F0' }]} onPress={() => handleSelect(item)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {item.isAdmin && <UiIcon name="定位" size={14} color={THEME.primary} />}
              <Text style={{fontSize: 16, color: THEME.textDark, fontWeight: item.isAdmin ? 'bold' : 'normal', marginLeft: item.isAdmin ? 4 : 0}}>
                {item.name}
              </Text>
            </View>
            <Text style={{fontSize: 12, color: item.isAdmin ? THEME.primary : THEME.textLight, marginTop: 4}}>
              {item.district}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ==========================================
// 📱 页面 5：节气
// ==========================================
function SolarTermsScreen({ navigate }) {
  const { isToday } = getSolarTermInfo();

  const getNextSolarTerm = () => {
    const today = new Date();
    const current = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const nextTerm = SOLAR_TERMS.find(t => t.date >= current);
    return nextTerm || SOLAR_TERMS[0]; 
  };

  const upcomingTerm = getNextSolarTerm();
  const renderTermItem = (name: string, backgroundColor: string) => {
    const image = SOLAR_TERM_IMAGES[name];
    return (
      <TouchableOpacity key={name} style={[styles.termItem, { backgroundColor }]} onPress={() => navigate('SolarTermDetail', { termName: name })} activeOpacity={0.82}>
        {image && <Image source={image} style={styles.termImage} resizeMode="cover" />}
        <View style={styles.termOverlay} />
        <Text style={styles.termText}>{name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => navigate('Home')} style={{padding:10}}><UiIcon name="返回" size={24} /></TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#E57373' }}>传统节气</Text>
        <View style={{width: 44}}/>
      </View>
      <ScrollView contentContainerStyle={{padding: 20}}>
        
        <View style={[styles.card, {alignItems: 'center', paddingVertical: 40, borderColor: THEME.primary, borderWidth: 1}]}>
           <Text style={{ color: isToday ? '#4CAF50' : THEME.textLight, fontSize: 16, marginBottom: 10, fontWeight: 'bold' }}>
            {isToday ? '✨ 今日节气 ✨' : '即将到来的节气'}
          </Text>
          <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#D34C4C' }}>{upcomingTerm.name}</Text>
          <Text style={{ color: THEME.textDark, marginTop: 10, fontSize: 16 }}>预测公历日期：{upcomingTerm.date}</Text>
        </View>

        <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: '#E91E63' }}>春</Text>
        <View style={styles.termGrid}>
          {['立春', '雨水', '惊蛰', '春分', '清明', '谷雨'].map((t) => renderTermItem(t, '#FCE4EC'))}
        </View>
        
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: '#4CAF50' }}>夏</Text>
        <View style={styles.termGrid}>
          {['立夏', '小满', '芒种', '夏至', '小暑', '大暑'].map((t) => renderTermItem(t, '#E8F5E9'))}
        </View>

        <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: '#FF9800' }}>秋</Text>
        <View style={styles.termGrid}>
          {['立秋', '处暑', '白露', '秋分', '寒露', '霜降'].map((t) => renderTermItem(t, '#FFF3E0'))}
        </View>

        <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: '#2196F3' }}>冬</Text>
        <View style={styles.termGrid}>
          {['立冬', '小雪', '大雪', '冬至', '小寒', '大寒'].map((t) => renderTermItem(t, '#E3F2FD'))}
        </View>

      </ScrollView>
    </View>
  );
}

// ==========================================
// 📱 页面 6：节气详情
// ==========================================
function SolarTermDetailScreen({ navigate, termName }) {
  const detail = SOLAR_TERM_DETAILS[termName] || SOLAR_TERM_DETAILS['立春'];
  const termMeta = SOLAR_TERMS.find(item => item.name === detail.name);
  const image = SOLAR_TERM_IMAGES[detail.name];
  const sections = [
    { title: '简介', content: detail.intro },
    { title: '代表寓意', content: detail.meaning },
    { title: '气候特点', content: detail.climate },
    { title: '来历', content: detail.origin },
    { title: '饮食', content: detail.food },
    { title: '习俗', content: detail.customs },
    { title: '养生', content: detail.health },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => navigate('SolarTerms')} style={{padding:10}}><UiIcon name="返回" size={24} /></TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#E57373' }}>{detail.name}</Text>
        <View style={{width: 44}}/>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScroll}>
        <View style={styles.detailHero}>
          {image && <Image source={image} style={styles.detailHeroImage} resizeMode="cover" />}
          <View style={styles.detailHeroOverlay} />
          <Text style={styles.detailHeroTitle}>{detail.name}</Text>
          <Text style={styles.detailHeroDate}>{termMeta?.date || ''}</Text>
        </View>

        <View style={styles.detailSummaryCard}>
          <Text style={styles.detailSummaryLabel}>节气关键词</Text>
          <Text style={styles.detailSummaryText}>{detail.meaning}</Text>
        </View>

        {sections.map(section => (
          <View key={section.title} style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>{section.title}</Text>
            <Text style={styles.detailSectionText}>{section.content}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ==========================================
// 📱 页面 7：收藏页
// ==========================================
function CollectionScreen({ navigate }) {
  const [favorites, setFavorites] = useState([]);
  useEffect(() => {
    const loadFavs = async () => {
      const saved = await AsyncStorage.getItem('favorites');
      if (saved) setFavorites(JSON.parse(saved));
    };
    loadFavs();
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => navigate('Profile')} style={{padding:10}}><UiIcon name="返回" size={24} /></TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Collection</Text>
          <UiIcon name="心形" size={16} color="#FF6B6B" />
        </View>
        <Text style={{ fontSize: 24, padding: 10 }}>...</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {favorites.length === 0 && <Text style={{textAlign: 'center', color: '#999', marginTop: 50}}>暂无收藏</Text>}
        {favorites.map((city, i) => (
          <TouchableOpacity key={i} style={styles.collectionCard} onPress={() => navigate('Home', { newLocation: city })}><Text style={{ fontSize: 18, fontWeight: 'bold' }}>{city.name}</Text></TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ==========================================
// 📱 页面 8：账号信息
// ==========================================
function AccountInfoScreen({ navigate, user, setCurrentUser }) {
  const [nickname, setNickname] = useState(user.nickname || '晴天小暖');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNickname(user.nickname || '晴天小暖');
    setAvatarUrl(user.avatarUrl || '');
  }, [user]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const data = await apiRequest('/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ nickname, avatarUrl }),
      });
      setCurrentUser(data.user);
      await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
      Alert.alert('已保存', '账号信息已更新');
      navigate('Profile');
    } catch (error) {
      Alert.alert('保存失败', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
      <View style={[styles.headerRow, {justifyContent: 'center'}]}>
        <TouchableOpacity onPress={() => navigate('Profile')} style={{position: 'absolute', left: 0}}><UiIcon name="返回" size={24} /></TouchableOpacity>
        <Text style={{fontSize: 18, fontWeight: 'bold'}}>账号信息</Text>
      </View>

      <View style={[styles.card, { alignItems: 'center' }]}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.accountAvatar} />
        ) : (
          <View style={styles.accountAvatar}><Text style={{ color: '#fff', fontSize: 36, fontWeight: 'bold' }}>{nickname.slice(0, 1) || '晴'}</Text></View>
        )}
        <Text style={{ color: THEME.textLight, marginTop: 10 }}>ID: {user.id || '0000001'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.inputLabel}>昵称</Text>
        <TextInput style={styles.profileInput} value={nickname} onChangeText={setNickname} placeholder="请输入昵称" />

        <Text style={styles.inputLabel}>头像 URL</Text>
        <TextInput style={styles.profileInput} value={avatarUrl} onChangeText={setAvatarUrl} placeholder="https://example.com/avatar.png" autoCapitalize="none" />

        <Text style={styles.inputLabel}>邮箱</Text>
        <Text style={styles.readonlyValue}>{user.email || '未绑定'}</Text>
      </View>

      <TouchableOpacity style={styles.profileSaveBtn} onPress={saveProfile} disabled={saving}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{saving ? '保存中...' : '保存'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ==========================================
// 📱 页面 9：预警通知
// ==========================================
function WeatherAlertsScreen({ navigate, location, returnTo }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const saved = await AsyncStorage.getItem('favorites');
        const favList = saved ? JSON.parse(saved) : [];
        const locations = [location, ...favList].filter(Boolean);
        const results = await Promise.all(locations.map(async (item) => {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);
            const data = await apiRequest(`/api/weather/alerts?lat=${encodeURIComponent(item.lat)}&lon=${encodeURIComponent(item.lon)}`, { signal: controller.signal });
            clearTimeout(timeout);
            if (data.warning) setNotice(data.warning);
            return (data.alerts || []).map(alert => ({ ...alert, cityName: item.name }));
          } catch {
            return [];
          }
        }));
        setAlerts(results.flat());
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [location]);

  return (
    <View style={styles.container}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => navigate(returnTo || 'Home')} style={{padding:10}}><UiIcon name="返回" size={24} /></TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>预警通知</Text>
        <View style={{width: 44}}/>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {loading && <ActivityIndicator size="large" color={THEME.primary} style={{ marginTop: 40 }} />}
        {!loading && alerts.length === 0 && (
          <View style={[styles.card, { alignItems: 'center', paddingVertical: 40 }]}>
            <UiIcon name="通知" size={28} color="#4CAF50" bg="#E8F5E9" radius={20} />
            <Text style={{ marginTop: 12, color: THEME.textDark, fontWeight: 'bold' }}>暂无天气预警</Text>
            <Text style={{ marginTop: 6, color: THEME.textLight, textAlign: 'center' }}>{notice || '当前地点和收藏地点暂未获取到政府预警信息'}</Text>
          </View>
        )}
        {!loading && alerts.map((alert, index) => (
          <View key={`${alert.id}-${index}`} style={styles.alertCard}>
            <Text style={styles.alertCity}>{alert.cityName}</Text>
            <Text style={styles.alertTitle}>{alert.event}</Text>
            <Text style={styles.alertSender}>{alert.sender}</Text>
            <Text style={styles.alertDescription}>{alert.description}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ==========================================
// 📱 页面 10：AI 生活建议
// ==========================================
function AdviceDetailScreen({ navigate, type, weatherData, location }) {
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const title = ADVICE_TYPES[type] || 'AI 建议';

  useEffect(() => {
    const fetchAdvice = async () => {
      setLoading(true);
      try {
        const context = buildWeatherContext(weatherData, location);
        const data = await apiRequest('/api/ai/advice', {
          method: 'POST',
          body: JSON.stringify({ type, ...context }),
        });
        setReply(data.reply);
      } catch (error) {
        setReply(`暂时无法连接 AI 服务：${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvice();
  }, [type, weatherData, location]);

  return (
    <View style={styles.container}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => navigate('Home')} style={{padding:10}}><UiIcon name="返回" size={24} /></TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{title}</Text>
        <View style={{width: 44}}/>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.adviceHero}>
          <Text style={styles.adviceTitle}>{title}</Text>
          <Text style={styles.adviceSubtitle}>{location?.name || '当前城市'} · 基于实时天气生成</Text>
        </View>

        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator size="large" color={THEME.primary} />
          ) : (
            <Text style={styles.adviceText}>{reply}</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ==========================================
// 📱 页面 7：注册 / 登录
// ==========================================
function AuthScreen({ navigate, setIsLogged, setCurrentUser }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const handleAuthAction = async () => {
    if (!email || !password) {
      Alert.alert('提示', '请输入邮箱和密码');
      return;
    }
    if (!isLoginMode && password !== confirmPassword) {
      Alert.alert('提示', '两次输入的密码不一致');
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiRequest(`/api/auth/${isLoginMode ? 'login' : 'register'}`, {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          nickname: nickname || '晴天小暖',
        }),
      });
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setIsLogged(true);
      navigate('Profile');
    } catch (error) {
      Alert.alert(isLoginMode ? '登录失败' : '注册失败', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.center}>
      <Text style={{ fontSize: 40, fontWeight: '900', color: THEME.primary, marginBottom: 50 }}>Weather app</Text>
      
      <View style={{ width: '85%', backgroundColor: '#FAF3EA', padding: 30, borderRadius: 24, elevation: 3 }}>
        <Text style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 25, color: '#000' }}>
          {isLoginMode ? 'Log in' : 'Sign up'}
        </Text>
        
        <TextInput style={styles.authInput} placeholder="Email address" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        
        {!isLoginMode && <TextInput style={styles.authInput} placeholder="昵称（默认：晴天小暖）" value={nickname} onChangeText={setNickname} />}
        
        <TextInput style={styles.authInput} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        
        {!isLoginMode && <TextInput style={styles.authInput} placeholder="Enter Password Again" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />}
        
        <TouchableOpacity 
          style={styles.primaryBtn} 
          onPress={handleAuthAction}  // ✨ 绑定新的逻辑函数
        >
          <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>
            {submitting ? 'Please wait...' : (isLoginMode ? 'Log in' : 'Sign up')}
          </Text>
        </TouchableOpacity>
        
        <View style={{flexDirection: 'row', marginTop: 30, justifyContent: 'center'}}>
          <Text style={{color: THEME.textLight}}>
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          </Text>
          <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)}>
            <Text style={{color: THEME.primary, fontWeight:'bold'}}>
              {isLoginMode ? 'Sign Up' : 'Log In'}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

// ==========================================
// 💅 样式表
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.bg },
  scrollPadding: { padding: 20, paddingBottom: 110 }, 
  card: { backgroundColor: THEME.cardBg, borderRadius: 24, padding: 20, marginBottom: 15, elevation: 4 },
  profileAvatar: { width: 65, height: 65, borderRadius: 32.5, backgroundColor: '#A4C8F0', borderWidth: 2, borderColor: '#FFB2BA', justifyContent: 'center', alignItems: 'center' },
  accountAvatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#A4C8F0', borderWidth: 3, borderColor: '#FFB2BA', justifyContent: 'center', alignItems: 'center' },
  inputLabel: { fontSize: 13, fontWeight: 'bold', color: THEME.textDark, marginBottom: 8, marginTop: 8 },
  profileInput: { backgroundColor: '#FAF3EA', borderRadius: 18, height: 48, paddingHorizontal: 16, marginBottom: 10, color: THEME.textDark },
  readonlyValue: { backgroundColor: '#FAF3EA', borderRadius: 18, minHeight: 48, paddingHorizontal: 16, paddingVertical: 14, color: THEME.textLight, marginBottom: 10 },
  profileSaveBtn: { backgroundColor: THEME.primary, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4, marginTop: 4 },
  alertCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 14, borderLeftWidth: 5, borderLeftColor: '#F23B68', elevation: 2 },
  alertCity: { color: THEME.primary, fontWeight: 'bold', marginBottom: 6 },
  alertTitle: { color: THEME.textDark, fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  alertSender: { color: THEME.textLight, marginBottom: 10 },
  alertDescription: { color: THEME.textDark, lineHeight: 22 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  iconBtn: { width: 44, height: 44, backgroundColor: '#fff', borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  cityText: { fontSize: 16, fontWeight: 'bold', color: THEME.primary, marginLeft: 5 },
  mainWeatherTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hugeTemp: { fontSize: 75, fontWeight: 'bold', color: THEME.textDark, lineHeight: 85 },
  weatherDesc: { fontSize: 16, color: THEME.textLight, marginTop: -5 },
  weatherIconBox: { width: 75, height: 75, backgroundColor: '#C8E4FB', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  tempRangeBox: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingBottom: 15, borderBottomWidth: 1, borderColor: '#F0F0F0' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  detailItem: { alignItems: 'center' },
  detailTitle: { fontSize: 12, color: THEME.textLight, marginVertical: 6 },
  detailVal: { fontSize: 16, fontWeight: 'bold', color: THEME.textDark },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.textDark },
  lifeIndexGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  lifeItem: { alignItems: 'center' },
  lifeText: { fontSize: 11, color: THEME.textLight, marginTop: 8 },
  solarCard: { backgroundColor: '#FDECE6', borderRadius: 24, padding: 25, alignItems: 'center', marginVertical: 10 },
  customTabBar: { flexDirection: 'row', position: 'absolute', bottom: 0, width: '100%', height: 75, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20, paddingBottom: 10 },
  tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabText: { fontSize: 11, marginTop: 4, fontWeight: 'bold' },
  chatBox: { flex: 1, backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 100, borderRadius: 24, overflow: 'hidden' },
  chatHeaderBadge: { backgroundColor: '#FDE4B0', alignItems: 'center', paddingVertical: 10 },
  chatInputArea: { flexDirection: 'row', padding: 15, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa' },
  chatInput: { flex: 1, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 15, marginRight: 10, borderWidth: 1, borderColor: '#eee' },
  sendBtn: { backgroundColor: THEME.primary, borderRadius: 20, justifyContent: 'center', paddingHorizontal: 20 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14 },
  userMessageRow: { justifyContent: 'flex-end' },
  aiMessageRow: { justifyContent: 'flex-start' },
  messageBubble: { maxWidth: '76%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  userBubble: { backgroundColor: '#FFF4E6', borderWidth: 1, borderColor: THEME.primary, marginRight: 8 },
  aiBubble: { backgroundColor: '#FFD8B2', marginLeft: 8 },
  messageText: { color: THEME.textDark, lineHeight: 20 },
  adviceHero: { backgroundColor: '#FFF8E8', borderRadius: 24, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: '#FFE4C4' },
  adviceTitle: { color: THEME.textDark, fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  adviceSubtitle: { color: THEME.primary, fontWeight: 'bold' },
  adviceText: { color: THEME.textDark, fontSize: 16, lineHeight: 26 },
  subHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: THEME.bg },
  searchInput: { flex: 1, backgroundColor: '#fff', height: 44, borderRadius: 22, paddingHorizontal: 20, elevation: 1 },
  suggestItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
  collectionCard: { backgroundColor: '#fff', borderRadius: 16, padding: 25, marginBottom: 15, borderWidth: 1.5, borderColor: '#FFE4C4' },
  sectionTitleLabel: { fontSize: 14, fontWeight: 'bold', color: THEME.textDark, marginLeft: 5, marginBottom: 10, marginTop: 5 },
  authInput: { backgroundColor: '#fff', height: 50, borderRadius: 25, paddingHorizontal: 20, marginBottom: 15 },
  primaryBtn: { backgroundColor: THEME.primary, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, alignSelf: 'flex-end', marginTop: 10 },
  termGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  termItem: { width: '30%', height: 100, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 15, overflow: 'hidden' },
  termImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  termOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.18)' },
  termText: { fontSize: 20, fontWeight: 'bold', color: '#111', textShadowColor: 'rgba(255,255,255,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  detailScroll: { padding: 20, paddingBottom: 40 },
  detailHero: { height: 190, borderRadius: 28, overflow: 'hidden', justifyContent: 'flex-end', padding: 24, marginBottom: 16, backgroundColor: '#FDECE6' },
  detailHeroImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  detailHeroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,248,239,0.36)' },
  detailHeroTitle: { fontSize: 42, fontWeight: 'bold', color: '#1F1B2D', textShadowColor: 'rgba(255,255,255,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  detailHeroDate: { marginTop: 6, fontSize: 16, fontWeight: 'bold', color: '#D34C4C' },
  detailSummaryCard: { backgroundColor: '#FFF8E8', borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#FFE4C4' },
  detailSummaryLabel: { color: THEME.primary, fontSize: 13, fontWeight: 'bold', marginBottom: 6 },
  detailSummaryText: { color: THEME.textDark, fontSize: 18, fontWeight: 'bold', lineHeight: 26 },
  detailSection: { backgroundColor: THEME.cardBg, borderRadius: 20, padding: 18, marginBottom: 12, elevation: 2 },
  detailSectionTitle: { color: '#D34C4C', fontSize: 17, fontWeight: 'bold', marginBottom: 8 },
  detailSectionText: { color: THEME.textDark, fontSize: 15, lineHeight: 24 }
});
