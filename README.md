# CS183-天气应用

结合 AI 智能建议与中国传统文化内容的天气应用，提供实时天气信息、AI 生成的生活推荐以及二十四节气文化卡片。

## 功能特性

* 实时天气展示（温度、湿度、风力、紫外线、空气质量、7 日预报）
* AI 智能建议（穿衣、饮食、活动推荐 + 自由对话）
* 二十四节气文化卡片，融入中国传统元素
* 离线兜底 — AI 服务不可达时降级为规则引擎推荐；MongoDB 不可达时自动回退本地 JSON 存储
* 用户注册/登录（JWT + bcrypt）
* 收藏并管理常用城市
* 响应式设计，适配桌面与移动端
* 设置页面（单位切换、主题定制）
* 内置 API 诊断工具

## 项目结构

    CS183-Weather-App/
    ├── web/          # React.js Web 前端
    ├── mobile/       # React Native (Expo) 移动端
    ├── sever/        # Node.js/Express 后端
    ├── AI/           # AI 微服务
    ├── Dockerfile
    └── package.json

## 技术栈

| 层级  | 技术  |
| --- | --- |
| Web 前端 | React.js, CSS3 |
| 移动端 | React Native (Expo SDK 55) |
| 后端  | Node.js, Express, MongoDB / Mongoose |
| 认证  | JWT + bcryptjs |
| AI  | DeepSeek API + 规则引擎兜底离线处理 |
| 天气数据 | OpenWeatherMap API |
| 地理编码 | 高德地图 geocoding API |
| 测试  | Jest |
| 运维  | Docker |

## Web 前端 (`web/`)

基于 React.js 的单页应用，页面结构：

* **Dashboard** — 天气总览：实时温度、湿度、风力、UV、空气质量 + AI 穿衣/饮食/活动建议卡片
* **Calendar** — 二十四节气历：展示节气日期、物候描述，点击展开详情
* **AI Helper** — 对话面板：自由输入天气相关问题，AI 实时回复
* **Saved Locations** — 城市收藏：搜索城市 → 添加收藏 → 切换查看天气
* **Settings** — 偏好设置：温度单位（°C/°F）、主题配色、区域管理
* **Login** — 注册/登录页面，登录后解锁收藏等需要认证的功能

### 环境变量

    REACT_APP_WEATHER_KEY=your_openweathermap_api_key
    REACT_APP_API_BASE_URL=http://localhost:3000    # 可选，默认值

### 启动

    cd web
    npm install
    npm start

## 移动端 (`mobile/`)

基于 Expo 的 React Native 应用，使用 `expo-router` 文件路由，与 Web 端功能对齐。

依赖包括：`@react-navigation`（底部标签 + 堆栈导航）、`expo-haptics`（触觉反馈）、`expo-image`（图片加载）、`react-native-gesture-handler`、`react-native-reanimated`（动画）、`react-native-svg`（矢量图形）等。

### 启动

    cd mobile
    npm install
    npx expo start

支持 Android 模拟器 / iOS 模拟器 / Expo Go 扫码运行。

## 后端服务 (`sever/`)

Node.js/Express 服务，端口 3000。MongoDB 为主数据库，连接失败时自动回退到本地 JSON 文件存储。

### 源代码结构

    sever/src/
    ├── index.js          # 服务入口，挂载路由，连接 MongoDB
    ├── routes/           # weather | solar-term | auth | favorites | ai | ai-suggestions
    ├── models/           # Mongoose 数据模型
    ├── middleware/       # JWT 认证 & 请求验证
    ├── data/             # 种子数据 & 本地 JSON 存储文件
    ├── localUserStore.js # JSON 文件用户 CRUD（bcrypt 哈希、自增 ID、邮箱查重）
    └── localAiStore.js   # AI 响应文件缓存（上限 200 条）

### 环境变量

    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/weather-app
    JWT_SECRET=change-this-secret
    WEATHER_API_KEY=your_openweathermap_api_key
    AI_SERVICE_BASE_URL=http://localhost:3001

### API 端点

| 端点  | 说明  |
| --- | --- |
| /api/weather | 天气数据（实时、预报） |
| /api/solar-term | 二十四节气查询 |
| /api/auth | 用户注册/登录（JWT） |
| /api/favorites | 收藏城市管理（需认证） |
| /api/ai | AI 聊天代理 |
| /api/ai-suggestions | AI 生活建议代理 |
| /api/health | 服务健康检查 |

### 启动

    cd sever
    npm install
    npm run dev    # 开发模式（自动重载）

## AI 服务 (`AI/`)

独立微服务，端口 3001。接收天气数据，调用 DeepSeek 生成穿衣/饮食/活动建议。AI 不可达时通过规则引擎兜底。

### 源代码结构

    AI/
    ├── diagnose.js          # API 连通性诊断脚本
    └── src/
        └── ai/
            ├── routes/      # aiAdvice（结构化建议）、aiChat（自由对话）
            ├── services/    # deepseek | openweather | amap | cache | fallbackEngine
            │                # layersEngine | foodEngine | activityEngine
            |                # | solarTerm | weatherResponse
            ├── data/        # OWM 天气代码 ↔ 中文标签映射表
            └── __tests__/   # 引擎单元测试 + 集成测试

### 关键机制

| 机制  | 实现  |
| --- | --- |
| AI 建议 | DeepSeek API，prompt 中注入完整天气上下文 |
| 离线兜底 | `fallbackEngine.js` — 根据温度/天气代码匹配规则建议，标记 `source: local` |
| 缓存  | `cache.js`（Map + 5 分钟 TTL）+ 后端 `localAiStore.js`（文件持久化） |
| 诊断  | `diagnose.js` — 依次检测高德、OpenWeather、DeepSeek 的 Key 与连通性 |

### 启动

    cd AI
    npm install
    npm start      # 默认端口 3001
    node diagnose.js   # 验证 API 连接
    npm test           # 运行测试

## Docker

    docker build -t weather-app .
    docker run -p 3000:3000 --env-file sever/.env weather-app

## 快速开始

### 1. 克隆仓库

    git clone https://github.com/Mingyue921/CS183-Weather-App.git
    cd CS183-Weather-App

### 2. 配置并启动 AI 服务

    cd AI
    npm install

配置环境变量（如需自定义 DeepSeek Key 等），然后：

    npm start       # 默认端口 3001

### 3. 配置并启动后端

    cd sever
    npm install
    cp .env.example .env

编辑 `.env`，填入你的 OpenWeather API Key、JWT Secret 和 MongoDB 连接地址，然后：

    npm run dev     # 开发模式（自动重载）

### 4. 配置并启动 Web 前端

    cd web
    npm install
    cp .env.example .env

编辑 `.env` 填入 `REACT_APP_WEATHER_KEY`，然后：

    npm start

### 5. 配置并启动移动端

    cd mobile
    npm install
    npx expo start

## UI 设计

* **风格**：柔和、宁静、极简
* **配色**：低饱和度莫兰迪色系 — 柔白、浅灰蓝、暖琥珀点缀
* **主题**：现代 UI 融合中国传统元素
* **设计工具**：Figma

## 贡献

本项目为 CS183 课程作业，欢迎通过 GitHub Issues / Pull Requests 反馈。

## 许可证

仅用于教育目的。
