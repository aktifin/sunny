# 小小英雄成长日历 - Copilot 开发指南

## 项目概述

**小小英雄成长日历** 是一个微信小程序（WeChat Mini Program），用于帮助家长记录和管理儿童的日常任务完成情况及积分累计。应用通过本地存储（wx.setStorageSync）持久化数据。

**关键应用信息：**
- AppID: `wx7d8e6a5c2f7b4c1d`
- 编译类型：miniprogram（微信小程序）
- 库版本：2.19.4+

## 架构与关键组件

### 项目结构
```
├── app.js              # 应用生命周期：onLaunch、onShow、onHide、onError
├── app.json            # 应用配置（页面路由、导航栏样式等）
├── app.wxss            # 全局样式
├── pages/index/        # 唯一页面（首页）
│   ├── index.js        # 核心逻辑：任务管理、积分计算、日历生成
│   ├── index.wxml      # 模板：任务列表、统计卡片、日历、图表
│   ├── index.json      # 页面配置
│   └── index.wxss      # 页面样式
└── project.config.json # 开发工具配置
```

### 数据流与存储架构

**存储模式：** 完全基于本地存储，无后端服务
- **存储键格式**：`task_status_YYYY-MM-DD` → JSON对象 `{taskId: boolean}`
- **示例**：`task_status_2025-12-11` 存储该日期的所有任务完成状态
- **生命周期**：通过 `onShow()` 每次进入页面时重新加载，确保数据一致

**积分计算规则（9个任务）：**
```javascript
技能学习1-3: 每项 +1分 (上限3分)
做家务1-3: 每项 +1分 (上限3分)
自己的事自己做: +2分 (上限2分)
整理好玩具: +1分 (上限1分)
按时睡觉: +1分 (上限1分)
每日总分上限: 10分
```

## 核心工作流与关键方法

### 关键数据流
1. **页面加载** (`onLoad`) → 初始化日期 → 加载任务状态 → 计算积分 → 生成日历 → 绘制图表
2. **任务切换** (`toggleTask`) → 更新状态 → 本地存储 → 重新计算积分 → 更新日历和图表
3. **日期切换** (日历点击) → 加载新日期数据 → 验证未来日期限制 → 刷新所有视图

### 关键方法实现模式

**任务状态切换 (toggleTask)**
- 防止未来日期编辑：`if (isFutureDate) return;`
- 切换完成状态后需同时调用：`generateCalendar()` + `drawChart()`
- 数据序列化为JSON存储在 `wx.setStorageSync()`

**积分计算 (calculateScores)**
- 遍历当前日期任务，累加已完成任务的积分
- 计算三个指标：dailyScore（今日）、monthlyScore（本月）、totalScore（总计）
- 触发场景：加载数据时、任务切换后

**日历生成 (generateCalendar)**
- 为每个日期读取本月数据，绘制日历网格
- 高亮显示有积分记录的日期
- 点击日期触发日期切换（同时验证未来日期限制）

## 编程约定与常见模式

### 命名与数据组织
- **任务ID格式**：类别+序号，如 `skill1`、`housework2`、`toys`
- **日期格式**：仅在存储键中使用 `YYYY-MM-DD`；JavaScript Date对象用于逻辑比较
- **状态对象**：`tasksWithStatus[]` 包含原始任务 + `isCompleted` 布尔值

### 日期处理特殊性
- **关键约定**：只比较日期部分，忽略时间部分
  ```javascript
  now.setHours(0, 0, 0, 0);  // 统一为午夜
  isFutureDate = currentDate > now;  // 未来日期无法编辑
  ```
- **未来日期限制**：`isFutureDate` 标志控制按钮禁用和点击禁用

### UI 视图层模式
- **条件渲染**：`wx:if="{{item.isCompleted}}"` 显示对勾
- **样式绑定**：根据 `isCompleted` 改变背景色和边框（CSS类绑定）
- **循环渲染**：使用 `wx:for="{{tasksWithStatus}}" wx:key="id"`
- **事件绑定**：`bindtap="toggleTask"` + `data-task-id="{{item.id}}"` 传递上下文

## 集成点与外部依赖

### WeChat API 使用
- **存储 API**：`wx.setStorageSync()` / `wx.getStorageSync()` - 同步本地存储
- **日志**：`console.log()` 用于调试（app.js 生命周期方法）

### Canvas 图表绘制
- **图表库**：使用原生 Canvas API（`<canvas type="2d" id="growthChart">`）
- **方法**：`drawChart()` 绘制最近N天的积分成长曲线
- **触发时机**：页面加载后立即调用，并在任务切换后刷新

## 常见修改场景与指南

**新增任务类型**
1. 在 `data.tasks[]` 中添加新任务对象（包含 id、icon、text、desc、points）
2. 任务ID遵循 `categoryN` 格式；icon 使用表情符号
3. 确保 points 值不超过每日总分限制 (10分)

**修改积分规则**
- 编辑 `data.tasks[]` 中各任务的 `points` 值
- 无需修改计算逻辑，`calculateScores()` 会自动应用新规则

**日期切换相关修改**
- 修改日期比较逻辑前，**务必保持** `setHours(0,0,0,0)` 的日期标准化
- 未来日期限制在 `loadData()` 和 `toggleTask()` 中同步检查

**样式定制**
- 使用 Tailwind CSS 类名（在 WXML 中直接应用）
- 颜色主题：orange-* (主色）、green-* (月积分)、blue-* (总积分)
- 圆角和阴影通过 `rounded-*` 和 `shadow-lg` 实现

## 调试与开发工具

- **微信开发者工具**：必须使用官方工具调试小程序
- **存储查看**：通过开发者工具 → 存储 → 本地存储查看所有 `task_status_*` 数据
- **日志调试**：console.log() 在开发者工具控制台可见
- **清除数据**：手动删除 `task_status_*` 键或使用开发者工具清空存储

## 版本兼容性与配置

- **最小库版本**：2.19.4（支持 Canvas 2D 绘制）
- **ES6 支持**：禁用（project.config.json: `"es6": false`）
- **编译优化**：启用压缩和增强编译（`"minified": true`, `"enhance": true`）
