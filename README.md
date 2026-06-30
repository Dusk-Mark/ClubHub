# 🎓 ClubHub | 中北大学社团活动管理系统

> 基于 Vue 3 + TypeScript + Supabase 构建的现代化、Serverless 架构校园社团管理平台。

![Vue.js](https://img.shields.io/badge/Vue%203-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

## 📖 项目简介

**ClubHub** 致力于解决传统校园社团管理中信息分散、流程繁琐、数据难以沉淀等痛点。系统采用现代化的“后台行政风”设计语言，为普通学生、社团负责人及校团委管理者提供了一站式的数字化解决方案，覆盖社团成立审批、活动发布、在线报名、成员管理等全生命周期业务。

## ✨ 核心特性与分权模型

系统基于严格的 **RBAC (Role-Based Access Control)** 模型设计，分为三大核心角色：

### 🧑‍🎓 学生端 (Student)
- **门户大厅**：浏览全校社团风采、最新新闻公告与规章制度。
- **活动大厅**：查看近期活动安排，支持一键提交活动报名与入社申请。
- **个人工作台 (Dashboard)**：集中展示本周参与节奏、待处理申请提醒及个人活动轨迹。

### 👔 社团管理端 (Club Leader)
- **社团运营**：维护社团基础信息，管理社团成员名册与职位。
- **活动组织**：发布招新、讲座、比赛等活动，管理报名审批与签到状态。
- **互动反馈**：处理学生留言，沉淀活动资料与历史归档。

### 🛡️ 校团委管理端 (Admin)
- **系统大盘**：全局监控全校社团活跃度、活动数量与用户增长。
- **审批中心**：集中处理社团成立、注销申请及大型活动举办审批。
- **综合管理**：全站公告发布、用户权限分配与违规社团干预。

## 🛠 技术栈选型

- **核心框架**: Vue 3 (严格采用 `<script setup>` 语法与 Composition API)
- **开发语言**: TypeScript (严格类型定义，杜绝 `any` 滥用)
- **路由与状态**: Vue Router 4 + Pinia
- **样式方案**: Tailwind CSS v4 (原子化 CSS，构建极简行政风 UI)
- **后端与数据库**: Supabase (Serverless 架构，提供 PostgreSQL 数据库、Auth 鉴权与 RLS 数据安全策略)
- **构建工具**: Vite

## 🚀 架构与设计亮点

1. **Serverless 敏捷架构**
   摒弃传统的前后端分离模式，前端直接通过 Supabase JS Client 与云端 PostgreSQL 数据库交互。利用 Supabase 的 **Row Level Security (RLS)** 策略在数据库层保障数据隔离与越权访问拦截。
2. **现代克制的 UI 语言**
   UI 设计对齐企业级后台标准，采用“后台行政风”。大量运用直角边框、极简的黑白灰配色、微弱的弥散阴影与细腻的交互动画（如 `hover:scale-[1.02]`），确保系统视觉的专业性与高级感。
3. **严密的路由守卫 (Navigation Guards)**
   结合 Pinia 中的用户 Session 与 Role 状态，在前端路由层实现动态拦截，确保非授权用户无法触及后台管理页面。

## 📂 核心目录结构

```text
src/
├── api/             # Supabase 请求封装与数据服务层
├── assets/          # 静态资源（图片、全局样式）
├── components/      # 跨模块公共组件（Button、Table、Modal 等）
├── router/          # 路由配置与权限守卫
├── stores/          # Pinia 状态管理（User Session, Roles）
├── types/           # 全局 TypeScript 接口定义（User, Activity, Club 等）
├── utils/           # 通用工具函数
└── views/           # 页面视图层
    ├── frontend/    # 前台页面 (门户、学生 Dashboard)
    ├── backend/     # 后台管理页面 (系统大盘、审批管理)
    └── auth/        # 登录与注册模块
```

## 📦 快速开始

### 1. 环境准备
确保你的本地环境已安装 [Node.js](https://nodejs.org/) (推荐 v18+)。

### 2. 克隆与安装
```bash
git clone <repository-url>
cd clubHub
npm install
```

### 3. 环境变量配置
在项目根目录创建 `.env.local` 文件，并填入你的 Supabase 凭证：
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 启动开发服务器
```bash
npm run dev
```
应用将默认运行在 `http://localhost:5173`。

### 5. 生产环境构建
```bash
npm run build
```

## 📄 许可证

[MIT License](./LICENSE) © 2026 ClubHub Team
