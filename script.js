// 配置
const STORAGE_KEY = 'kids-score-log';
const MAX_SKILL = 3;
const MAX_HOUSEWORK = 3;
const MAX_SELF = 2;
const MAX_TOYS = 1;
const MAX_SLEEP = 1;
const MAX_DAILY = 10;

// 状态
let currentDate = new Date();
let displayedMonth = new Date();
let scoreData = {};

// DOM元素
const elements = {
    todayScore: document.getElementById('today-score'),
    totalScore: document.getElementById('total-score'),
    currentMonth: document.getElementById('current-month'),
    calendarGrid: document.getElementById('calendar-grid'),
    selectedDate: document.getElementById('selected-date'),
    skillTasks: document.getElementById('skill-tasks'),
    skillScore: document.getElementById('skill-score'),
    addSkill: document.getElementById('add-skill'),
    houseworkTasks: document.getElementById('housework-tasks'),
    houseworkScore: document.getElementById('housework-score'),
    addHousework: document.getElementById('add-housework'),
    selfCheckbox: document.getElementById('self-checkbox'),
    selfScore: document.getElementById('self-score'),
    toysCheckbox: document.getElementById('toys-checkbox'),
    toysScore: document.getElementById('toys-score'),
    sleepCheckbox: document.getElementById('sleep-checkbox'),
    sleepScore: document.getElementById('sleep-score'),
    saveBtn: document.getElementById('save-btn'),
    prevMonth: document.getElementById('prev-month'),
    nextMonth: document.getElementById('next-month')
};

// 工具函数
function formatDateKey(date) {
    return date.toISOString().split('T')[0];
}

function formatDateDisplay(date) {
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
}

// 从localStorage加载数据
function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
}

// 保存数据到localStorage
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scoreData));
    updateStats();
}

function getTotalScore() {
    return Object.values(scoreData).reduce((sum, day) => sum + (day.total || 0), 0);
}

function getDayData(dateKey) {
    return scoreData[dateKey] || {
        skill: [],
        housework: [],
        self: false,
        toys: false,
        sleep: false,
        total: 0
    };
}

// 渲染日历
function renderCalendar() {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    
    elements.currentMonth.textContent = `${year}年${month + 1}月`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    elements.calendarGrid.innerHTML = '';
    
    // 添加空白格子
    for (let i = 0; i < startingDay; i++) {
        const empty = document.createElement('div');
        elements.calendarGrid.appendChild(empty);
    }
    
    // 添加日期格子
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateKey = formatDateKey(date);
        const dayData = getDayData(dateKey);
        
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day ${dayData.total > 0 ? 'has-data' : ''} ${formatDateKey(date) === formatDateKey(currentDate) ? 'selected' : ''}`;
        dayElement.innerHTML = `
            <span class="day-number">${day}</span>
            ${dayData.total > 0 ? `<span class="day-score">${dayData.total}</span>` : ''}
        `;
        dayElement.addEventListener('click', () => {
            currentDate = date;
            renderCalendar();
            renderTasks();
        });
        
        elements.calendarGrid.appendChild(dayElement);
    }
}

// 渲染任务
function renderTasks() {
    const dateKey = formatDateKey(currentDate);
    const dayData = getDayData(dateKey);
    
    elements.selectedDate.textContent = formatDateDisplay(currentDate);
    
    // 渲染技能学习任务
    renderTaskList('skill', dayData.skill, MAX_SKILL);
    // 渲染家务任务
    renderTaskList('housework', dayData.housework, MAX_HOUSEWORK);
    
    // 渲染其他任务
    elements.selfCheckbox.checked = dayData.self;
    elements.toysCheckbox.checked = dayData.toys;
    elements.sleepCheckbox.checked = dayData.sleep;
    
    // 更新分数显示
    updateTaskScores();
}

// 渲染任务列表
function renderTaskList(type, tasks, max) {
    const container = type === 'skill' ? elements.skillTasks : elements.houseworkTasks;
    container.innerHTML = '';
    
    if (tasks.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无记录，点击"添加"按钮开始记录</div>';
        return;
    }
    
    tasks.forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                   onchange="toggleTask('${type}', ${index})">
            <input type="text" value="${task.text}" placeholder="请输入具体内容" 
                   oninput="updateTaskText('${type}', ${index}, this.value)">
            <button onclick="removeTask('${type}', ${index})" 
                    class="text-red-500 hover:text-red-700">
                ×
            </button>
        `;
        container.appendChild(taskElement);
    });
}

// 添加任务
function addTask(type) {
    const dateKey = formatDateKey(currentDate);
    if (!scoreData[dateKey]) {
        scoreData[dateKey] = {
            skill: [],
            housework: [],
            self: false,
            toys: false,
            sleep: false,
            total: 0
        };
    }
    
    const max = type === 'skill' ? MAX_SKILL : MAX_HOUSEWORK;
    if (scoreData[dateKey][type].length >= max) {
        alert(`最多只能添加${max}项`);
        return;
    }
    
    scoreData[dateKey][type].push({
        text: '',
        completed: false
    });
    
    renderTasks();
}

// 删除任务
function removeTask(type, index) {
    const dateKey = formatDateKey(currentDate);
    if (scoreData[dateKey] && scoreData[dateKey][type]) {
        scoreData[dateKey][type].splice(index, 1);
        renderTasks();
    }
}

// 切换任务完成状态
function toggleTask(type, index) {
    const dateKey = formatDateKey(currentDate);
    if (scoreData[dateKey] && scoreData[dateKey][type]) {
        scoreData[dateKey][type][index].completed = !scoreData[dateKey][type][index].completed;
        updateTaskScores();
    }
}

// 更新任务文本
function updateTaskText(type, index, text) {
    const dateKey = formatDateKey(currentDate);
    if (scoreData[dateKey] && scoreData[dateKey][type]) {
        scoreData[dateKey][type][index].text = text;
    }
}

// 更新任务分数显示
function updateTaskScores() {
    const dateKey = formatDateKey(currentDate);
    const dayData = getDayData(dateKey);
    
    // 计算各项分数
    const skillScore = Math.min(dayData.skill.filter(task => task.completed).length, MAX_SKILL);
    const houseworkScore = Math.min(dayData.housework.filter(task => task.completed).length, MAX_HOUSEWORK);
    const selfScore = dayData.self ? MAX_SELF : 0;
    const toysScore = dayData.toys ? MAX_TOYS : 0;
    const sleepScore = dayData.sleep ? MAX_SLEEP : 0;
    
    // 更新显示
    elements.skillScore.textContent = `${skillScore}/${MAX_SKILL}`;
    elements.houseworkScore.textContent = `${houseworkScore}/${MAX_HOUSEWORK}`;
    elements.selfScore.textContent = `${selfScore}/${MAX_SELF}`;
    elements.toysScore.textContent = `${toysScore}/${MAX_TOYS}`;
    elements.sleepScore.textContent = `${sleepScore}/${MAX_SLEEP}`;
    
    // 计算总分
    const total = Math.min(
        skillScore + houseworkScore + selfScore + toysScore + sleepScore,
        MAX_DAILY
    );
    
    // 更新今日总分
    if (formatDateKey(currentDate) === formatDateKey(new Date())) {
        elements.todayScore.textContent = total;
    }
    
    // 保存总分
    if (!scoreData[dateKey]) {
        scoreData[dateKey] = dayData;
    }
    scoreData[dateKey].total = total;
}

// 更新统计信息
function updateStats() {
    // 更新今日分数
    const todayKey = formatDateKey(new Date());
    const todayData = getDayData(todayKey);
    elements.todayScore.textContent = todayData.total;
    
    // 更新总分数
    elements.totalScore.textContent = getTotalScore();
    
    // 更新日历显示
    renderCalendar();
}

// 保存记录
function saveRecord() {
    // 更新所有复选框状态
    const dateKey = formatDateKey(currentDate);
    if (!scoreData[dateKey]) {
        scoreData[dateKey] = {
            skill: [],
            housework: [],
            self: false,
            toys: false,
            sleep: false,
            total: 0
        };
    }
    
    scoreData[dateKey].self = elements.selfCheckbox.checked;
    scoreData[dateKey].toys = elements.toysCheckbox.checked;
    scoreData[dateKey].sleep = elements.sleepCheckbox.checked;
    
    // 更新分数
    updateTaskScores();
    
    // 保存到localStorage
    saveData();
    
    // 显示成功消息
    alert('记录保存成功！');
}

// 切换月份
function changeMonth(offset) {
    displayedMonth.setMonth(displayedMonth.getMonth() + offset);
    renderCalendar();
}

// 事件监听
function initEventListeners() {
    // 添加任务按钮
    elements.addSkill.addEventListener('click', () => addTask('skill'));
    elements.addHousework.addEventListener('click', () => addTask('housework'));
    
    // 保存按钮
    elements.saveBtn.addEventListener('click', saveRecord);
    
    // 月份切换按钮
    elements.prevMonth.addEventListener('click', () => changeMonth(-1));
    elements.nextMonth.addEventListener('click', () => changeMonth(1));
    
    // 复选框事件
    elements.selfCheckbox.addEventListener('change', updateTaskScores);
    elements.toysCheckbox.addEventListener('change', updateTaskScores);
    elements.sleepCheckbox.addEventListener('change', updateTaskScores);
}

// 初始化
function init() {
    // 加载数据
    scoreData = loadData();
    
    // 初始化事件监听
    initEventListeners();
    
    // 渲染界面
    renderCalendar();
    renderTasks();
    updateStats();
}

// 初始化应用
document.addEventListener('DOMContentLoaded', init);

// 全局函数（供HTML调用）
window.toggleTask = toggleTask;
window.updateTaskText = updateTaskText;
window.removeTask = removeTask;