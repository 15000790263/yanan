# 施工日志入口页实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将施工日志菜单下的两个子菜单合并为一个入口页，点击施工日志后显示两个大按钮，分别进入施工日志填报和历史记录。

**Architecture:**
- 菜单 URL 从 `/log/daily` 改为 `/log`
- 创建入口页组件 `log-entry.vue`，显示两个功能入口卡片
- 原有填报和历史记录页面保留，通过入口页跳转

**Tech Stack:** Vue 3 + Vant 4 + Vue Router

---

## 文件结构

```
kel-app/src/
├── views/log/
│   ├── log-index.vue          (修改: 移除或保留作为父容器)
│   ├── components/
│   │   └── log-entry.vue      (新建: 入口页面组件)
│   ├── construction-log.vue   (保持不变)
│   └── log-history.vue        (保持不变)
├── views/home-page/
│   └── menu.config.js         (修改: 更新菜单 URL)
└── router/
    └── index.js               (修改: 调整路由配置)
```

---

## Chunk 1: 创建入口页面组件

### Task 1: 创建 log-entry.vue 入口组件

**Files:**
- Create: `kel-app/src/views/log/components/log-entry.vue`

- [ ] **Step 1: 创建入口页面组件**

```vue
<template>
  <div class="log-entry-page">
    <div class="entry-card" @click="goToConstruction">
      <div class="entry-icon">
        <van-icon name="edit" size="32" color="#1989fa" />
      </div>
      <div class="entry-content">
        <div class="entry-title">施工日志填报</div>
        <div class="entry-desc">填写今日施工情况</div>
      </div>
      <van-icon name="arrow" size="20" color="#969799" class="entry-arrow" />
    </div>

    <div class="entry-card" @click="goToHistory">
      <div class="entry-icon">
        <van-icon name="orders-o" size="32" color="#1989fa" />
      </div>
      <div class="entry-content">
        <div class="entry-title">施工历史记录</div>
        <div class="entry-desc">查看历史填报记录</div>
      </div>
      <van-icon name="arrow" size="20" color="#969799" class="entry-arrow" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

defineOptions({
  name: 'LogEntry',
});

const router = useRouter();

function goToConstruction() {
  router.push('/log/construction-log');
}

function goToHistory() {
  router.push('/log/log-history');
}
</script>

<style scoped lang="less">
.log-entry-page {
  padding: 16px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 46px);
}

.entry-card {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    background-color: #f7f8fa;
  }
}

.entry-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e6f4ff;
  border-radius: 12px;
  margin-right: 12px;
}

.entry-content {
  flex: 1;
}

.entry-title {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 4px;
}

.entry-desc {
  font-size: 13px;
  color: #969799;
}

.entry-arrow {
  flex-shrink: 0;
}
</style>
```

- [ ] **Step 2: 提交创建的文件**

```bash
git add kel-app/src/views/log/components/log-entry.vue
git commit -m "feat(log): 创建施工日志入口页面组件"
```

---

## Chunk 2: 修改路由配置

### Task 2: 修改路由 index.js

**Files:**
- Modify: `kel-app/src/router/index.js:714-732`

- [ ] **Step 1: 修改路由配置，添加默认跳转**

```javascript
{
  /** 施工日志 **/
  path: '/log',
  name: 'log',
  meta: { title: '施工日志', isBack: false },
  component: () => import('../views/log/log-index.vue'),
  children: [
    {
      path: '',
      redirect: 'entry',  // 默认跳转到入口页
    },
    {
      path: 'entry',
      name: 'log-entry',
      meta: { title: '施工日志', isBack: false },
      component: () => import('../views/log/components/log-entry.vue'),
    },
    {
      path: 'construction-log',
      name: 'construction-log',
      meta: { title: '施工日志填报', isBack: false },
      component: () => import('../views/log/construction-log.vue'),
    },
    {
      path: 'log-history',
      name: 'log-history',
      meta: { title: '历史记录', isBack: false },
      component: () => import('../views/log/log-history.vue'),
    },
  ],
},
```

- [ ] **Step 2: 提交修改**

```bash
git add kel-app/src/router/index.js
git commit -m "feat(log): 修改施工日志路由配置，添加入口页"
```

---

## Chunk 3: 修改菜单配置

### Task 3: 修改 menu.config.js

**Files:**
- Modify: `kel-app/src/views/home-page/menu.config.js:26-35`

- [ ] **Step 1: 修改菜单 URL**

```javascript
{
  type: '施工日志',
  items: [
    {
      title: '施工日志',
      icon: new URL('../../assets/image/home/daily-patrol.svg', import.meta.url).href,
      url: '/log',  // 从 '/log/daily' 改为 '/log'
    },
    // 删除历史记录菜单项，因为已合并到入口页
  ],
},
```

- [ ] **Step 2: 提交修改**

```bash
git add kel-app/src/views/home-page/menu.config.js
git commit -m "feat(log): 合并施工日志菜单，删除历史记录子菜单"
```

---

## Chunk 4: 测试验证

### Task 4: 验证功能

- [ ] **Step 1: 开发环境启动测试**

Run: `npm run dev`

验证:
1. 点击"施工日志"菜单进入入口页
2. 入口页显示两个卡片按钮
3. 点击"施工日志填报"跳转到填报页面
4. 点击"施工历史记录"跳转到历史记录页面
5. 返回按钮正常工作

- [ ] **Step 2: 提交完整变更**

```bash
git add -A
git commit -m "feat(log): 实现施工日志入口页，合并填报和历史记录功能"
```

---

## 验收标准

- [ ] 点击施工日志菜单进入入口页
- [ ] 入口页显示两个可点击的卡片按钮（施工日志填报、施工历史记录）
- [ ] 点击"施工日志填报"跳转到填报页面
- [ ] 点击"施工历史记录"跳转到历史记录页面
- [ ] UI 风格与现有项目保持一致（Vant 风格、卡片样式）
- [ ] 返回按钮正常工作