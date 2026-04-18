import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function WeatherApp() {
  const [city, setCity] = useState(''); // 存储用户输入的城市名
  const [weather, setWeather] = useState(null); // 存储天气结果
  const [loading, setLoading] = useState(false); // 加载状态

  // 你的 API Key
  const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY; 

  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    try {
      // 这里的 lang=zh_cn 是为了让天气描述显示中文
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=zh_cn`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setWeather(data);
      } else {
        alert("未找到该城市，请检查拼写（建议输入英文名）");
      }
    } catch (error) {
      alert("网络错误，请检查代理或网络");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather Explorer</Text>
      
      <TextInput
        style={styles.input}
        placeholder="输入城市英文名 (如: Beijing)"
        value={city}
        onChangeText={setCity}
      />
      
      <Button title="查询天气" onPress={fetchWeather} color="#0288d1" />

      {loading && <ActivityIndicator size="large" color="#0288d1" style={{marginTop: 20}} />}

      {weather && !loading && (
        <View style={styles.resultContainer}>
          <Text style={styles.cityName}>{weather.name}</Text>
          <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>
          <Text style={styles.desc}>{weather.weather[0].description}</Text>
          <View style={styles.details}>
            <Text>湿度: {weather.main.humidity}%</Text>
            <Text>风速: {weather.wind.speed} m/s</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 40, paddingTop: 80 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  resultContainer: { marginTop: 30, padding: 20, backgroundColor: '#fff', borderRadius: 20, alignItems: 'center', elevation: 3 },
  cityName: { fontSize: 24, fontWeight: 'bold' },
  temp: { fontSize: 60, fontWeight: 'bold', color: '#0288d1' },
  desc: { fontSize: 18, color: '#666', textTransform: 'capitalize' },
  details: { marginTop: 15, flexDirection: 'row', justifyContent: 'space-around', width: '100%' }
});