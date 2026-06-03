# V1 、V2 Comparison

git diff v1..v2 --stat
 .dockerignore                                      |    3 +
 AI/.gitignore                                      |    3 +
 AI/SolarTerm.java                                  |   30 -
 AI/SolarTermMatcher.java                           |  104 -
 AI/diagnose.js                                     |   89 +
 AI/finalApp.java                                   |  133 -
 AI/jest.config.js                                  |    6 +
 AI/package-lock.json                               | 4686 ++++++++++++++++++++
 AI/package.json                                    |   19 +
 AI/solarTerms.json                                 |  194 -
 AI/src/ai/__tests__/activityEngine.test.js         |   22 +
 AI/src/ai/__tests__/foodEngine.test.js             |   24 +
 AI/src/ai/__tests__/integration.test.js            |  266 ++
 AI/src/ai/__tests__/layersEngine.test.js           |   73 +
 AI/src/ai/data/owmWeatherCodes.json                |   57 +
 AI/src/ai/data/ownWeatherCodes.json                |   57 +
 AI/src/ai/routes/aiAdvice.js                       |  153 +
 AI/src/ai/routes/aiChat.js                         |  171 +
 AI/src/ai/services/activityEngine.js               |   82 +
 AI/src/ai/services/amap.js                         |   39 +
 AI/src/ai/services/cache.js                        |   38 +
 AI/src/ai/services/deepseek.js                     |   32 +
 AI/src/ai/services/fallbackEngine.js               |   43 +
 AI/src/ai/services/foodEngine.js                   |   65 +
 AI/src/ai/services/layersEngine.js                 |   64 +
 AI/src/ai/services/openweather.js                  |  145 +
 AI/src/ai/services/solarTerm.js                    |   43 +
 AI/src/ai/services/weatherResponse.js              |   23 +
 AI/src/index.js                                    |   35 +
 Dockerfile                                         |   13 +
 README.md                                          |  289 +-
 docs/1                                             |    1 -
 mobile/app/(tabs)/index.tsx                        | 1445 +++++-
 mobile/assets/icons/about.svg                      |   16 +
 mobile/assets/icons/activity.svg                   |   10 +
 mobile/assets/icons/chat.svg                       |   15 +
 mobile/assets/icons/city.svg                       |    4 +
 mobile/assets/icons/clothes.svg                    |   10 +
 mobile/assets/icons/food.svg                       |    3 +
 mobile/assets/icons/heart-filled.svg               |    3 +
 mobile/assets/icons/heart.svg                      |   10 +
 mobile/assets/icons/help.svg                       |   11 +
 mobile/assets/icons/home.svg                       |   11 +
 mobile/assets/icons/humidity.svg                   |   10 +
 mobile/assets/icons/location.svg                   |   11 +
 mobile/assets/icons/logout.svg                     |   10 +
 mobile/assets/icons/notification.svg               |   10 +
 mobile/assets/icons/offline.svg                    |   11 +
 mobile/assets/icons/privacy.svg                    |   11 +
 mobile/assets/icons/profile.svg                    |   11 +
 mobile/assets/icons/search.svg                     |   11 +
 mobile/assets/icons/settings.svg                   |   11 +
 mobile/assets/icons/theme.svg                      |   14 +
 mobile/assets/icons/travel.svg                     |   13 +
 mobile/assets/icons/uv.svg                         |   10 +
 mobile/assets/icons/warning.svg                    |   10 +
 mobile/assets/icons/wind.svg                       |   10 +
 mobile/assets/solar-terms/bailu.png                |  Bin 0 -> 18684 bytes
 mobile/assets/solar-terms/chunfen.png              |  Bin 0 -> 31264 bytes
 mobile/assets/solar-terms/chushu.png               |  Bin 0 -> 18462 bytes
 mobile/assets/solar-terms/dahan.png                |  Bin 0 -> 7608 bytes
 mobile/assets/solar-terms/dashu.png                |  Bin 0 -> 22661 bytes
 mobile/assets/solar-terms/daxue.png                |  Bin 0 -> 15191 bytes
 mobile/assets/solar-terms/dongzhi.png              |  Bin 0 -> 24184 bytes
 mobile/assets/solar-terms/guyu.png                 |  Bin 0 -> 33833 bytes
 mobile/assets/solar-terms/hanlu.png                |  Bin 0 -> 19745 bytes
 mobile/assets/solar-terms/jingzhe.png              |  Bin 0 -> 31644 bytes
 mobile/assets/solar-terms/lichun.png               |  Bin 0 -> 15396 bytes
 mobile/assets/solar-terms/lidong.png               |  Bin 0 -> 28350 bytes
 mobile/assets/solar-terms/liqiu.png                |  Bin 0 -> 19054 bytes
 mobile/assets/solar-terms/lixia.png                |  Bin 0 -> 16894 bytes
 mobile/assets/solar-terms/mangzhong.png            |  Bin 0 -> 19637 bytes
 mobile/assets/solar-terms/qingming.png             |  Bin 0 -> 29714 bytes
 mobile/assets/solar-terms/qiufen.png               |  Bin 0 -> 20292 bytes
 mobile/assets/solar-terms/shuangjiang.png          |  Bin 0 -> 16551 bytes
 mobile/assets/solar-terms/xiaohan.png              |  Bin 0 -> 11427 bytes
 mobile/assets/solar-terms/xiaoman.png              |  Bin 0 -> 18917 bytes
 mobile/assets/solar-terms/xiaoshu.png              |  Bin 0 -> 28099 bytes
 mobile/assets/solar-terms/xiaoxue.png              |  Bin 0 -> 20387 bytes
 mobile/assets/solar-terms/xiazhi.png               |  Bin 0 -> 21199 bytes
 mobile/assets/solar-terms/yushui.png               |  Bin 0 -> 31347 bytes
 mobile/constants/solarTermDetails.ts               |  253 ++
 mobile/package-lock.json                           | 1384 +++---
 mobile/package.json                                |   36 +-
 package-lock.json                                  |    6 +
 package.json                                       |    8 +
 sever/.env.example                                 |    6 +
 sever/.gitignore                                   |    4 +
 sever/1                                            |    1 -
 sever/package-lock.json                            | 1223 +++++
 sever/package.json                                 |   19 +
 sever/src/data/solarTerms.json                     |   26 +
 sever/src/index.js                                 |   65 +
 sever/src/localAiStore.js                          |   25 +
 sever/src/localUserStore.js                        |   92 +
 sever/src/middleware/auth.js                       |   16 +
 sever/src/models/Counter.js                        |   16 +
 sever/src/models/User.js                           |   61 +
 sever/src/routes/ai.js                             |  123 +
 sever/src/routes/aiSuggestions.js                  |  175 +
 sever/src/routes/auth.js                           |  150 +
 sever/src/routes/favorites.js                      |   75 +
 sever/src/routes/solarTerm.js                      |   42 +
 sever/src/routes/weather.js                        |  119 +
 web/.env                                           |    2 +-
 web/.gitignore                                     |    1 +
 web/package-lock.json                              |   58 +
 web/package.json                                   |    1 +
 .../img/105/AI\345\212\251\346\211\213@2x 1.svg"   |    3 +
 web/public/img/105/Climate.svg                     |    3 +
 web/public/img/105/Ellipse 1.svg                   |    3 +
 web/public/img/105/Ellipse 12.svg                  |    3 +
 web/public/img/105/Ellipse 3.svg                   |    3 +
 web/public/img/105/Vector-1.svg                    |    3 +
 web/public/img/105/Vector-2.svg                    |    3 +
 web/public/img/105/Vector.svg                      |    0
 web/public/img/105/about.svg                       |   12 +
 web/public/img/105/account.svg                     |    3 +
 web/public/img/105/air.svg                         |    3 +
 web/public/img/105/avatar.svg                      |    3 +
 web/public/img/105/bell.svg                        |    5 +
 web/public/img/105/cloudy.svg                      |   13 +
 web/public/img/105/dashboard 1.svg                 |    3 +
 web/public/img/105/help.svg                        |   12 +
 web/public/img/105/link.svg                        |   18 +
 web/public/img/105/lock.svg                        |    3 +
 web/public/img/105/overcast.svg                    |   16 +
 web/public/img/105/picture.svg                     |  557 +++
 web/public/img/105/rain.svg                        |    6 +
 web/public/img/105/rains.svg                       |   64 +
 web/public/img/105/robot.svg                       |  106 +
 web/public/img/105/search.svg                      |    9 +
 web/public/img/105/send.svg                        |   22 +
 web/public/img/105/setting.svg                     |    3 +
 web/public/img/105/sound.svg                       |    4 +
 web/public/img/105/sun.svg                         |   19 +
 web/public/img/105/sunny.svg                       |   13 +
 web/public/img/105/theme.svg                       |    7 +
 .../img/105/\346\224\266\350\227\217 (2) 1.svg"    |   11 +
 .../public/img/105/\346\227\245\345\216\206 1.svg" |    3 +
 .../img/105/\346\231\264\345\244\251 (1) 4.svg"    |   13 +
 .../public/img/105/\346\271\277\345\272\246 1.svg" |    4 +
 .../\345\206\254\350\207\263.png"                  |  Bin 0 -> 24184 bytes
 .../\345\244\204\346\232\221.png"                  |  Bin 0 -> 18462 bytes
 .../\345\244\217\350\207\263.png"                  |  Bin 0 -> 21199 bytes
 .../\345\244\247\345\257\222.png"                  |  Bin 0 -> 7608 bytes
 .../\345\244\247\346\232\221.png"                  |  Bin 0 -> 22661 bytes
 .../\345\244\247\351\233\252.png"                  |  Bin 0 -> 15191 bytes
 .../\345\257\222\351\234\262.png"                  |  Bin 0 -> 19745 bytes
 .../\345\260\217\345\257\222.png"                  |  Bin 0 -> 11427 bytes
 .../\345\260\217\346\232\221.png"                  |  Bin 0 -> 28099 bytes
 .../\345\260\217\346\273\241.png"                  |  Bin 0 -> 18917 bytes
 .../\345\260\217\351\233\252.png"                  |  Bin 0 -> 20387 bytes
 .../\346\203\212\350\233\260.png"                  |  Bin 0 -> 31644 bytes
 .../\346\230\245\345\210\206.png"                  |  Bin 0 -> 31264 bytes
 .../\346\270\205\346\230\216.png"                  |  Bin 0 -> 29714 bytes
 .../\347\231\275\351\234\262.png"                  |  Bin 0 -> 18684 bytes
 .../\347\247\213\345\210\206.png"                  |  Bin 0 -> 20292 bytes
 .../\347\253\213\345\206\254.png"                  |  Bin 0 -> 28350 bytes
 .../\347\253\213\345\244\217.png"                  |  Bin 0 -> 16894 bytes
 .../\347\253\213\346\230\245.png"                  |  Bin 0 -> 15396 bytes
 .../\347\253\213\347\247\213.png"                  |  Bin 0 -> 19054 bytes
 .../\350\212\222\347\247\215.png"                  |  Bin 0 -> 19637 bytes
 .../\350\260\267\351\233\250.png"                  |  Bin 0 -> 33833 bytes
 .../\351\233\250\346\260\264.png"                  |  Bin 0 -> 31347 bytes
 .../\351\234\234\351\231\215.png"                  |  Bin 0 -> 16551 bytes
 ...\345\207\272\347\231\273\345\275\225 (2) 1.svg" |    4 +
 .../img/105/\351\223\203\351\223\233 (3) 1.svg"    |    5 +
 .../public/img/105/\351\243\216\347\272\247 1.svg" |    4 +
 web/src/AiHelper.css                               |  261 ++
 web/src/AiHelper.js                                |  121 +
 web/src/App.css                                    |  110 +-
 web/src/App.js                                     |  176 +-
 web/src/Calendar.css                               |  305 ++
 web/src/Calendar.js                                |  127 +
 web/src/Dashboard.css                              |  349 ++
 web/src/Dashboard.js                               |  444 ++
 web/src/Login.css                                  |  101 +
 web/src/Login.js                                   |  101 +
 web/src/SavedLocation.css                          |  195 +
 web/src/SavedLocation.js                           |  263 ++
 web/src/Setting.css                                |  296 ++
 web/src/Setting.js                                 |  211 +
 web/src/Sidebar.css                                |   83 +
 web/src/Sidebar.js                                 |   68 +
 web/src/api.js                                     |   27 +
 web/src/index.js                                   |    8 +-
 187 files changed, 15340 insertions(+), 1552 deletions(-)
(END)