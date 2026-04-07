# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个基于 Vue 3 + Vite + Cordova 的燃气行业移动应用，主要功能包括应急管理、作业管理、设备管理、巡检等。

## Tech Stack

- **Vue 3** (Composition API)
- **Vite** (构建工具)
- **Pinia** (状态管理，持久化存储)
- **Vue Router** (Hash 模式路由)
- **Vant 4** (UI 组件库)
- **Axios** (HTTP 请求)
- **Cordova** (Android 原生打包)
- **Cesium** (三维 GIS)
- **Leaflet** (二维地图)
- **ECharts** (图表)

## Common Commands

```bash
# 安装依赖
npm install

# 开发模式 (热重载)
npm run dev

# 生产构建 (Cordova Android)
npm run build

# 调试构建 (包含 source map)
npm run build-debugger

# 发布构建
npm run build-release

# 模拟器运行
npm run emu

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## Environment Requirements

- Node.js >= 16.13.0
- JDK 11
- Android SDK Build Tools >= 33.0.2
- Gradle >= 7.6

## Project Structure

```
kel-app/
├── src/
│   ├── api/           # 按业务模块划分的 API 接口
│   ├── components/    # 业务组件 (emergency, work, inspect, system)
│   ├── stores/        # Pinia 状态管理
│   ├── views/         # 页面视图
│   ├── utils/         # 工具函数
│   ├── router/        # 路由配置
│   ├── directives/    # 自定义指令
│   ├── hooks/         # Vue Composables
│   └── style/         # 全局样式
├── www/               # Vite 构建输出目录 (Cordova 用)
└── plugins/          # Cordova 插件
```

## Key Aliases

- `@` → `src/`
- `components` → `src/components/`

## API Proxy

开发环境代理配置在 `vite.config.js` 中:
- `/prod-api` → `http://60.13.219.226:30453`

## Key Files

- [vite.config.js](kel-app/vite.config.js) - Vite 和插件配置
- [src/main.js](kel-app/src/main.js) - 应用入口
- [src/router/index.js](kel-app/src/router/index.js) - 路由定义
- [src/config.js](kel-app/src/config.js) - 应用配置

## Notes

- 路由使用 `createWebHashHistory`，URL 带有 `#` 号
- 移动端项目，主要面向 Android
- 使用 Vant 组件库，需通过 `vant` 前缀使用
- Cordova 相关工具在 `src/utils/cordova-tools.js` 中