import React, { useState, useEffect } from 'react';

// 拿全局预报数据，动态渲染，不写死日期
function Calendar() {
  const [forecast, setForecast] = useState([]);
  const API_KEY = process.env.REACT_APP_WEATHER_KEY;
  const city = "Fuzhou";

  useEffect(() => {
    const getForecast = async () => {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=en`
      );
      const data = await res.json();
      // 每8条取1条 = 一天一条
      const dayList = data.list.filter((_, idx) => idx % 8 === 0);
      setForecast(dayList);
    };
    getForecast();
  }, []);

  // 格式化日期
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
  };

  return (
    <div>
      <h2>Weather Forecast Calendar</h2>
      <p style={{marginBottom:'20px'}}>5 Days automatic forecast (from API)</p >

      <div style={{display:'flex', gap:'15px', flexWrap:'wrap'}}>
        {forecast.map((item, index) => (
          <div 
            key={index} 
            style={{
              border:'1px solid #ccc',
              borderRadius:'8px',
              padding:'15px',
              width:'130px',
              textAlign:'center'
            }}
          >
            <p style={{fontWeight:'bold'}}>{formatDate(item.dt_txt)}</p >
            <p>{item.weather[0].description}</p >
            <p style={{fontSize:'18px', fontWeight:'500'}}>
              {Math.round(item.main.temp)}°C
            </p >
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendar;