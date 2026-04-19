import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // Expo自带的图标库

export default function WeatherApp() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [favorites, setFavorites] = useState([]); // 收藏列表

  const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

  // --- 逻辑1：初始化时加载本地收藏 ---
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const saved = await AsyncStorage.getItem('fav_cities');
    if (saved) setFavorites(JSON.parse(saved));
  };

  // --- 逻辑2：查询天气 ---
  const fetchWeather = async (cityName) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName || city}&appid=${API_KEY}&units=metric&lang=zh_cn`;
    const response = await fetch(url);
    const data = await response.json();
    if (response.ok) setWeather(data);
  };

  // --- 逻辑3：收藏/取消收藏 ---
  const toggleFavorite = async () => {
    let newFavs = [...favorites];
    if (favorites.includes(weather.name)) {
      newFavs = newFavs.filter(item => item !== weather.name); // 取消
    } else {
      newFavs.push(weather.name); // 添加
    }
    setFavorites(newFavs);
    await AsyncStorage.setItem('fav_cities', JSON.stringify(newFavs));
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="输入城市(英文)" onChangeText={setCity} />
      <Button title="查询" onPress={() => fetchWeather()} />

      {weather && (
        <View style={styles.card}>
          <Text style={styles.cityName}>{weather.name}</Text>
          
          {/* --- 天气图标实现 --- */}
          <Image 
            style={styles.icon}
            source={{ uri: `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png` }} 
          />
          
          <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>

          {/* --- 收藏按钮实现 --- */}
          <TouchableOpacity onPress={toggleFavorite} style={styles.favBtn}>
            <Ionicons 
              name={favorites.includes(weather.name) ? "heart" : "heart-outline"} 
              size={32} color="red" 
            />
            <Text>收藏城市</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* --- 收藏列表展示 --- */}
      <Text style={styles.subTitle}>我的收藏：</Text>
      <FlatList 
        data={favorites}
        renderItem={({item}) => (
          <TouchableOpacity onPress={() => fetchWeather(item)}>
            <Text style={styles.favItem}>📍 {item}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#f0f4f7' },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 5, marginBottom: 10 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  cityName: { fontSize: 24, fontWeight: 'bold' },
  icon: { width: 100, height: 100 }, // 图标大小
  temp: { fontSize: 40, color: '#2196f3' },
  favBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  subTitle: { fontSize: 18, marginTop: 30, fontWeight: 'bold' },
  favItem: { padding: 10, backgroundColor: '#fff', marginTop: 5, borderRadius: 5 }
});