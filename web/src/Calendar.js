import React, { useState } from 'react';
import './Calendar.css';

const publicPath = process.env.PUBLIC_URL || '';

const seasonClassMap = {
  Spring: 'spring',
  Summer: 'summer',
  Autumn: 'autumn',
  Winter: 'winter',
};

const termNames = [
  ['立春', 'Start of Spring', 'Li Chun', 'Spring', 'Feb 3-5', 'Spring begins and living things start to wake.'],
  ['雨水', 'Rain Water', 'Yu Shui', 'Spring', 'Feb 18-20', 'Moisture returns and rainfall gradually increases.'],
  ['惊蛰', 'Awakening of Insects', 'Jing Zhe', 'Spring', 'Mar 5-7', 'Spring thunder awakens hidden life.'],
  ['春分', 'Spring Equinox', 'Chun Fen', 'Spring', 'Mar 20-22', 'Day and night are nearly balanced.'],
  ['清明', 'Pure Brightness', 'Qing Ming', 'Spring', 'Apr 4-6', 'Clear skies, spring outings, and remembrance.'],
  ['谷雨', 'Grain Rain', 'Gu Yu', 'Spring', 'Apr 19-21', 'Rain nourishes crops and supports growth.'],
  ['立夏', 'Start of Summer', 'Li Xia', 'Summer', 'May 5-7', 'Summer begins and plants flourish.'],
  ['小满', 'Grain Full', 'Xiao Man', 'Summer', 'May 20-22', 'Grains become full but are not yet mature.'],
  ['芒种', 'Grain in Ear', 'Mang Zhong', 'Summer', 'Jun 5-7', 'Harvest and sowing enter a busy period.'],
  ['夏至', 'Summer Solstice', 'Xia Zhi', 'Summer', 'Jun 21-22', 'The longest daylight of the year arrives.'],
  ['小暑', 'Lesser Heat', 'Xiao Shu', 'Summer', 'Jul 6-8', 'Heat begins to build before the hottest days.'],
  ['大暑', 'Greater Heat', 'Da Shu', 'Summer', 'Jul 22-24', 'The hottest and most humid period arrives.'],
  ['立秋', 'Start of Autumn', 'Li Qiu', 'Autumn', 'Aug 7-9', 'Autumn begins while heat may remain.'],
  ['处暑', 'End of Heat', 'Chu Shu', 'Autumn', 'Aug 22-24', 'Summer heat gradually fades.'],
  ['白露', 'White Dew', 'Bai Lu', 'Autumn', 'Sep 7-9', 'Cooler nights bring visible dew.'],
  ['秋分', 'Autumn Equinox', 'Qiu Fen', 'Autumn', 'Sep 22-24', 'Day and night return to balance.'],
  ['寒露', 'Cold Dew', 'Han Lu', 'Autumn', 'Oct 8-9', 'Dew turns colder and autumn deepens.'],
  ['霜降', 'Frost Descent', 'Shuang Jiang', 'Autumn', 'Oct 23-24', 'Frost may appear as temperatures drop.'],
  ['立冬', 'Start of Winter', 'Li Dong', 'Winter', 'Nov 7-8', 'Winter begins and nature enters storage.'],
  ['小雪', 'Lesser Snow', 'Xiao Xue', 'Winter', 'Nov 22-23', 'Snow may begin, usually in small amounts.'],
  ['大雪', 'Greater Snow', 'Da Xue', 'Winter', 'Dec 6-8', 'Snow becomes more likely and heavier.'],
  ['冬至', 'Winter Solstice', 'Dong Zhi', 'Winter', 'Dec 21-23', 'The shortest day and longest night arrive.'],
  ['小寒', 'Lesser Cold', 'Xiao Han', 'Winter', 'Jan 5-7', 'The coldest part of the year begins.'],
  ['大寒', 'Greater Cold', 'Da Han', 'Winter', 'Jan 20-21', 'Cold reaches its limit before spring returns.'],
];

const solarTerms = termNames.map(([key, name, pinyin, season, date, summary]) => ({
  key,
  name,
  pinyin,
  season,
  date,
  summary,
  cover: `${publicPath}/img/105/节气/${key}.png`,
  sections: [
    ['Overview', `${name} usually falls around ${date}. It is one of the 24 traditional Chinese solar terms and reflects seasonal changes in climate, farming, and daily life.`],
    ['Symbolic Meaning', summary],
    ['Climate', 'The weather changes according to the season, affecting temperature, rainfall, humidity, wind, and daily routines.'],
    ['Origin', 'The solar terms were developed through long-term observation of the sun, climate, agriculture, and seasonal rhythms in ancient China.'],
    ['Food', 'Seasonal food is recommended, with attention to balance, hydration, digestion, and local customs.'],
    ['Customs', 'Traditional customs may include seasonal food, farming rituals, family activities, outings, or remembrance depending on the term.'],
    ['Wellness', 'Health advice follows the seasonal rhythm: keep warm in cold periods, avoid heat in summer, balance the body in spring and autumn, and maintain steady routines.'],
  ],
}));

const seasons = ['Spring', 'Summer', 'Autumn', 'Winter'];

function Calendar() {
  const [selectedTerm, setSelectedTerm] = useState(null);

  return (
    <main className="calendar-page">
      <header className="calendar-header">
        <h1 className="calendar-title">24 Solar Terms</h1>
      </header>
      <p className="calendar-subtitle">
        Explore traditional Chinese seasonal culture through English solar term names, pinyin, images, and concise detail pages.
      </p>

      {seasons.map((season) => (
        <section className="season-row" key={season}>
          <h2 className={`season-title ${seasonClassMap[season]}`}>{season}</h2>
          <div className="term-grid">
            {solarTerms.filter((term) => term.season === season).map((term) => (
              <button
                key={term.key}
                type="button"
                className={`term-card ${seasonClassMap[season]}`}
                onClick={() => setSelectedTerm(term)}
              >
                <div className="term-card-thumb">
                  <img src={term.cover} alt={term.name} />
                </div>
                <div className="term-card-content">
                  <div className="term-card-name">{term.name}</div>
                  <div className="term-card-pinyin">{term.pinyin}</div>
                  <div className="term-card-date">{term.date}</div>
                  <div className="term-card-summary">{term.summary}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}

      {selectedTerm && (
        <div className="term-modal-overlay" onClick={() => setSelectedTerm(null)}>
          <article className="term-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-cover">
              <img src={selectedTerm.cover} alt={selectedTerm.name} />
              <button className="modal-close" type="button" onClick={() => setSelectedTerm(null)}>x</button>
            </div>
            <div className="modal-body">
              <div className="modal-headline">
                <h3>{selectedTerm.name}</h3>
                <div className="meta">{selectedTerm.pinyin} · {selectedTerm.date}</div>
              </div>
              <div className="detail">
                {selectedTerm.sections.map(([title, content]) => (
                  <p key={title}>
                    <strong>{title}</strong>
                    {content}
                  </p>
                ))}
              </div>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}

export default Calendar;
