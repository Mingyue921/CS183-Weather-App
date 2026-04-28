import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// 获取屏幕宽度，用于计算卡片尺寸
const screenWidth = Dimensions.get('window').width;

export default function WeatherApp() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]); // 新增：5日预报状态
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const saved = await AsyncStorage.getItem('fav_cities');
    if (saved) setFavorites(JSON.parse(saved));
  };

  const fetchWeather = async (cityName) => {
    const targetCity = cityName || city;
    if (!targetCity) return;
    setLoading(true);
    try {
      // 1. 获取今日天气
      const resToday = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${targetCity}&appid=${API_KEY}&units=metric&lang=zh_cn`);
      const dataToday = await resToday.json();

      // 2. 获取5日预报
      const resForecast = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${targetCity}&appid=${API_KEY}&units=metric&lang=zh_cn`);
      const dataForecast = await resForecast.json();

      if (resToday.ok && resForecast.ok) {
        setWeather(dataToday);
        // 筛选：每天中午12:00的数据
        const daily = dataForecast.list.filter(item => item.dt_txt.includes("12:00:00"));
        setForecast(daily);
      } else {
        alert("未找到城市，请检查拼写");
      }
    } catch (error) {
      alert("网络请求失败，请检查网络");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    let newFavs = [...favorites];
    if (favorites.includes(weather.name)) {
      newFavs = newFavs.filter(item => item !== weather.name);
    } else {
      newFavs.push(weather.name);
    }
    setFavorites(newFavs);
    await AsyncStorage.setItem('fav_cities', JSON.stringify(newFavs));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Weather Explorer</Text>
      <TextInput 
        style={styles.input} 
        placeholder="输入城市(英文)" 
        onChangeText={setCity} 
        value={city}
      />
      <Button title="查询" onPress={() => fetchWeather()} color="#0288d1" />

      {loading && <ActivityIndicator size="large" color="#0288d1" style={{marginTop: 20}} />}

      {weather && !loading && (
        <>
          {/* 今日天气大卡片 */}
          <View style={styles.card}>
            <Text style={styles.cityName}>{weather.name}</Text>
            <Image 
              style={styles.icon}
              source={{ uri: `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png` }} 
            />
            <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>
            <Text style={styles.desc}>{weather.weather[0].description}</Text>
            
            <View style={styles.details}>
              <Text>湿度: {weather.main.humidity}%</Text>
              <Text>风速: {weather.wind.speed} m/s</Text>
            </View>

            <TouchableOpacity onPress={toggleFavorite} style={styles.favBtn}>
              <Ionicons 
                name={favorites.includes(weather.name) ? "heart" : "heart-outline"} 
                size={32} color="red" 
              />
              <Text style={{marginLeft: 5}}>收藏城市</Text>
            </TouchableOpacity>
          </View>

          {/* 未来5日预报（横向滚动卡片） */}
          <View style={styles.forecastSection}>
            <Text style={styles.sectionTitle}>未来 5 日预报</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {forecast.map((item, index) => (
                <View key={index} style={styles.forecastCard}>
                  <Text style={styles.fDate}>{item.dt_txt.split(' ')[0].substring(5)}</Text>
                  <Image 
                    style={styles.fIcon}
                    source={{ uri: `http://openweathermap.org/img/wn/${item.weather[0].icon}.png` }} 
                  />
                  <Text style={styles.fTemp}>{Math.round(item.main.temp)}°C</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </>
      )}

      {/* 收藏列表 */}
      <Text style={styles.subTitle}>我的收藏：</Text>
      <View style={styles.favList}>
        {favorites.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => fetchWeather(item)} style={styles.favItem}>
            <Text>📍 {item}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* 底部留白防止遮挡 */}
      <View style={{height: 80}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#f0f4f7' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 5, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 10, elevation: 3 },
  cityName: { fontSize: 24, fontWeight: 'bold' },
  icon: { width: 100, height: 100 },
  temp: { fontSize: 40, color: '#2196f3', fontWeight: 'bold' },
  desc: { fontSize: 18, color: '#666', textTransform: 'capitalize' },
  details: { marginTop: 15, flexDirection: 'row', justifyContent: 'space-around', width: '100%', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  favBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  subTitle: { fontSize: 18, marginTop: 30, fontWeight: 'bold' },
  favList: { marginTop: 10 },
  favItem: { padding: 15, backgroundColor: '#fff', marginTop: 8, borderRadius: 10, elevation: 1 },
  
  // 5日预报专属样式
  forecastSection: { marginTop: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  forecastCard: { 
    backgroundColor: '#fff', 
    width: screenWidth * 0.28, // 核心：控制一屏显示3.5个左右
    padding: 10, 
    borderRadius: 12, 
    marginRight: 10, 
    alignItems: 'center',
    elevation: 2 
  },
  fDate: { fontSize: 14, color: '#666' },
  fIcon: { width: 40, height: 40 },
  fTemp: { fontSize: 16, fontWeight: 'bold', color: '#0288d1' }
});