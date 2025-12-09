# 小朋友积分记录日志

一个用于记录小朋友日常表现和积分的日历应用，支持本地数据存储。

## 功能特点

- 📅 **日历视图**：直观展示每月积分记录
- ✅ **任务管理**：记录技能学习、家务等任务
- ➕ **自动计分**：根据完成情况自动计算积分
- 💾 **本地存储**：数据保存在浏览器localStorage中
- 📱 **响应式设计**：适配各种屏幕尺寸
- 🌐 **支持GitHub Pages部署**：可免费部署到GitHub Pages

## 积分规则

| 任务类型 | 积分规则 | 每日上限 |
|---------|---------|---------|
| 技能学习 | 每项+1分 | 3分 |
| 帮助做家务 | 每项+1分 | 3分 |
| 自己的事自己做 | 完成+2分 | 2分 |
| 整理好玩具 | 完成+1分 | 1分 |
| 按时睡觉 | 完成+1分 | 1分 |
| **每日总分** | - | **10分** |

## 部署到GitHub Pages

### 步骤1：创建GitHub仓库

1. 在GitHub上创建一个新的仓库（名称任意）
2. 仓库可以是公开或私有

### 步骤2：上传文件到GitHub

将以下文件上传到GitHub仓库：
- `index.html`
- `style.css`
- `script.js`
- `README.md`（可选）

### 步骤3：设置GitHub Pages

1. 进入仓库的 `Settings` 页面
2. 点击左侧的 `Pages` 选项
3. 在 `Build and deployment` 部分：
   - `Source` 选择 `Deploy from a branch`
   - `Branch` 选择 `main` 或 `master`，`/root`
   - 点击 `Save` 按钮
4. 等待几分钟，GitHub Pages将自动构建并部署网站

### 步骤4：访问网站

部署完成后，你将看到类似以下的访问地址：
```
https://yourusername.github.io/your-repo-name/
```

直接在浏览器中访问该地址即可使用应用。

## 本地使用

1. 下载项目文件
2. 直接在浏览器中打开 `index.html` 文件
3. 开始记录积分

## 数据存储

- 数据保存在浏览器的localStorage中
- 每个浏览器的数据是独立的
- 可以通过浏览器的开发者工具查看和管理数据
- 清除浏览器数据会导致应用数据丢失

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 项目结构

```
├── index.html      # 主页面
├── style.css       # 样式文件
├── script.js       # JavaScript逻辑
└── README.md       # 项目说明
```

## 使用说明

1. 在日历中点击任意日期
2. 为技能学习和家务添加具体任务
3. 勾选完成的任务
4. 系统自动计算积分
5. 点击"保存记录"按钮保存数据
6. 可以切换月份查看历史记录

## 自定义配置

你可以修改 `script.js` 文件中的配置参数：

```javascript
const MAX_SKILL = 3;      // 技能学习每日上限
const MAX_HOUSEWORK = 3;   // 家务每日上限
const MAX_SELF = 2;        // 自己的事自己做每日上限
const MAX_TOYS = 1;        // 整理玩具每日上限
const MAX_SLEEP = 1;       // 按时睡觉每日上限
const MAX_DAILY = 10;      // 每日总分上限
```

## 注意事项

1. GitHub Pages部署的是静态网站，不支持后端功能
2. 数据存储在用户浏览器中，不同设备之间数据不共享
3. 建议定期导出数据备份，防止浏览器数据丢失
4. 可以通过修改代码，将数据存储改为远程API或其他方式

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！