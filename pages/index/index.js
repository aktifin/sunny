// pages/index/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 任务列表
    tasks: [
      { id: 'skill1', icon: '📖', text: '学习：阅读', desc: '学习阅读', points: 1 },
      { id: 'skill2', icon: '🎨', text: '学习：画画', desc: '学习画画', points: 1 },
      { id: 'skill3', icon: '🎹', text: '学习：练琴', desc: '学习练琴', points: 1 },
      { id: 'housework1', icon: '🧹', text: '做家务：扫地', desc: '帮大人扫地', points: 1 },
      { id: 'housework2', icon: '🪑', text: '做家务：擦桌子', desc: '帮大人擦桌子', points: 1 },
      { id: 'housework3', icon: '🥣', text: '做家务：洗碗', desc: '帮大人洗碗', points: 1 },
      { id: 'self', icon: '👕', text: '自己的事自己做', desc: '穿衣、洗漱、整理书包', points: 2 },
      { id: 'toys', icon: '🧸', text: '整理好玩具', desc: '玩完玩具放回原处', points: 1 },
      { id: 'sleep', icon: '🌙', text: '按时睡觉', desc: '晚上9:00前上床休息', points: 1 }
    ],
    // 当前日期和显示的日期
    currentDate: null,
    viewDate: null,
    currentDateDisplay: '',
    // 任务状态
    tasksWithStatus: [],
    isFutureDate: false,
    // 积分数据
    dailyScore: 0,
    monthlyScore: 0,
    totalScore: 0,
    // 日历相关
    calendarDays: [],
    calendarMonthYear: '',
    // 统计数据
    displayedMonthTotal: 0,
    averageScore: 0,
    perfectDays: 0,
    // 图表相关
    chartData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 初始化当前日期
    const now = new Date();
    this.setData({
      currentDate: now,
      viewDate: now
    });
    
    // 加载数据
    this.loadData();
    
    // 初始化日历
    this.generateCalendar();
    
    // 绘制图表
    this.drawChart();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 页面渲染完成后再次绘制图表，确保Canvas元素已渲染
    this.drawChart();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时重新加载数据
    this.loadData();
    this.generateCalendar();
    this.drawChart();
  },

  /**
   * 加载数据
   */
  loadData() {
    // 获取当前日期
    const currentDate = this.data.currentDate;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    
    // 设置当前日期显示
    this.setData({
      currentDateDisplay: `${year}年${month}月${day}日`
    });
    
    // 获取日期键
    const dateKey = this.formatDateKey(currentDate);
    
    // 检查是否为未来日期
    const now = new Date();
    const isFutureDate = currentDate > now;
    this.setData({
      isFutureDate: isFutureDate
    });
    
    // 加载任务状态
    this.loadTaskStatus(dateKey);
    
    // 计算积分
    this.calculateScores();
  },

  /**
   * 格式化日期键
   */
  formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * 加载任务状态
   */
  loadTaskStatus(dateKey) {
    // 从本地存储获取任务状态
    const taskStatusStr = wx.getStorageSync(`task_status_${dateKey}`) || '{}';
    const taskStatus = JSON.parse(taskStatusStr);
    
    // 合并任务和状态
    const tasksWithStatus = this.data.tasks.map(task => ({
      ...task,
      isCompleted: taskStatus[task.id] || false
    }));
    
    this.setData({
      tasksWithStatus: tasksWithStatus
    });
  },

  /**
   * 计算积分
   */
  calculateScores() {
    // 计算今日得分
    const dailyScore = this.data.tasksWithStatus.reduce((score, task) => {
      return score + (task.isCompleted ? task.points : 0);
    }, 0);
    
    // 计算本月得分和总分
    let monthlyScore = 0;
    let totalScore = 0;
    let perfectDays = 0;
    
    // 获取本地存储的所有键
    const keys = wx.getStorageInfoSync().keys;
    
    // 遍历所有键，计算积分
    keys.forEach(key => {
      if (key.startsWith('task_status_')) {
        const dateKey = key.replace('task_status_', '');
        const taskStatusStr = wx.getStorageSync(key);
        const taskStatus = JSON.parse(taskStatusStr);
        
        // 计算当天得分
        let dayScore = 0;
        this.data.tasks.forEach(task => {
          dayScore += taskStatus[task.id] ? task.points : 0;
        });
        
        // 总分累加
        totalScore += dayScore;
        
        // 检查是否为本月
        const date = new Date(dateKey);
        const currentYear = this.data.currentDate.getFullYear();
        const currentMonth = this.data.currentDate.getMonth();
        
        if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
          monthlyScore += dayScore;
          
          // 检查是否为满分
          if (dayScore === 10) {
            perfectDays++;
          }
        }
      }
    });
    
    // 更新数据
    this.setData({
      dailyScore: dailyScore,
      monthlyScore: monthlyScore,
      totalScore: totalScore,
      perfectDays: perfectDays
    });
  },

  /**
   * 切换任务状态
   */
  toggleTask(e) {
    // 如果是未来日期，不允许操作
    if (this.data.isFutureDate) {
      return;
    }
    
    // 获取任务ID
    const taskId = e.currentTarget.dataset.taskId;
    
    // 更新任务状态
    const tasksWithStatus = this.data.tasksWithStatus.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          isCompleted: !task.isCompleted
        };
      }
      return task;
    });
    
    // 更新数据
    this.setData({
      tasksWithStatus: tasksWithStatus
    });
    
    // 保存到本地存储
    const dateKey = this.formatDateKey(this.data.currentDate);
    const taskStatus = {};
    tasksWithStatus.forEach(task => {
      taskStatus[task.id] = task.isCompleted;
    });
    wx.setStorageSync(`task_status_${dateKey}`, JSON.stringify(taskStatus));
    
    // 重新计算积分
    this.calculateScores();
    
    // 重新生成日历
    this.generateCalendar();
    
    // 重新绘制图表
    this.drawChart();
  },

  /**
   * 生成日历
   */
  generateCalendar() {
    const date = this.data.viewDate;
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // 设置月份年份显示
    this.setData({
      calendarMonthYear: `${year}年${month + 1}月`
    });
    
    // 生成日历天数
    const calendarDays = [];
    
    // 获取当月第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 获取当月第一天是星期几
    const firstDayOfWeek = firstDay.getDay();
    
    // 获取当月天数
    const daysInMonth = lastDay.getDate();
    
    // 生成上个月的天数
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevYear, month, 0).getDate();
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const dateKey = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = false;
      const score = this.getScoreForDate(dateKey);
      
      calendarDays.push({
        dateKey: dateKey,
        day: day,
        score: score,
        isToday: isToday,
        classes: 'bg-stone-50 text-stone-300',
        isFutureDate: true
      });
    }
    
    // 生成当月的天数
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const date = new Date(year, month, day);
      const isToday = this.isToday(date);
      const score = this.getScoreForDate(dateKey);
      const isFutureDate = date > new Date();
      
      // 根据得分设置颜色
      let cellClass = 'bg-white text-stone-700';
      if (isToday) {
        cellClass += ' border-2 border-orange-500 shadow-sm';
      } else if (score === 10) {
        cellClass += ' bg-green-50';
      } else if (score >= 6 && score <= 8) {
        cellClass += ' bg-blue-50';
      } else if (score >= 1 && score <= 5) {
        cellClass += ' bg-orange-50';
      } else if (score === 0) {
        cellClass += ' bg-stone-50 text-stone-300';
      } else {
        cellClass += ' bg-stone-50';
      }
      
      calendarDays.push({
        dateKey: dateKey,
        day: day,
        score: score,
        isToday: isToday,
        classes: cellClass,
        isFutureDate: isFutureDate
      });
    }
    
    // 生成下个月的天数
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const remainingDays = 42 - calendarDays.length;
    
    for (let day = 1; day <= remainingDays; day++) {
      const dateKey = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = false;
      const score = null;
      
      calendarDays.push({
        dateKey: dateKey,
        day: day,
        score: score,
        isToday: isToday,
        classes: 'bg-stone-50 text-stone-300',
        isFutureDate: true
      });
    }
    
    // 更新数据
    this.setData({
      calendarDays: calendarDays
    });
    
    // 计算显示月份的统计数据
    this.calculateDisplayedMonthStats();
  },

  /**
   * 获取指定日期的得分
   */
  getScoreForDate(dateKey) {
    const taskStatusStr = wx.getStorageSync(`task_status_${dateKey}`);
    if (!taskStatusStr) {
      return null;
    }
    
    const taskStatus = JSON.parse(taskStatusStr);
    let score = 0;
    
    this.data.tasks.forEach(task => {
      score += taskStatus[task.id] ? task.points : 0;
    });
    
    return score;
  },

  /**
   * 检查是否为今天
   */
  isToday(date) {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  },

  /**
   * 计算显示月份的统计数据
   */
  calculateDisplayedMonthStats() {
    const date = this.data.viewDate;
    const year = date.getFullYear();
    const month = date.getMonth();
    
    let total = 0;
    let daysWithScore = 0;
    let perfectDays = 0;
    
    // 获取本地存储的所有键
    const keys = wx.getStorageInfoSync().keys;
    
    // 遍历所有键，计算积分
    keys.forEach(key => {
      if (key.startsWith('task_status_')) {
        const dateKey = key.replace('task_status_', '');
        const taskDate = new Date(dateKey);
        
        // 检查是否为当前显示的月份
        if (taskDate.getFullYear() === year && taskDate.getMonth() === month) {
          const taskStatusStr = wx.getStorageSync(key);
          const taskStatus = JSON.parse(taskStatusStr);
          
          // 计算当天得分
          let dayScore = 0;
          this.data.tasks.forEach(task => {
            dayScore += taskStatus[task.id] ? task.points : 0;
          });
          
          // 总分累加
          total += dayScore;
          
          // 如果得分大于0，计算天数
          if (dayScore > 0) {
            daysWithScore++;
          }
          
          // 检查是否为满分
          if (dayScore === 10) {
            perfectDays++;
          }
        }
      }
    });
    
    // 计算平均分
    const averageScore = daysWithScore > 0 ? Math.round((total / daysWithScore) * 10) / 10 : 0;
    
    // 更新数据
    this.setData({
      displayedMonthTotal: total,
      averageScore: averageScore,
      perfectDays: perfectDays
    });
  },

  /**
   * 切换月份
   */
  changeMonth(e) {
    const offset = parseInt(e.currentTarget.dataset.offset);
    const date = this.data.viewDate;
    const newDate = new Date(date.getFullYear(), date.getMonth() + offset, 1);
    
    this.setData({
      viewDate: newDate
    });
    
    this.generateCalendar();
  },

  /**
   * 设置查看日期
   */
  setViewDate(e) {
    const dateKey = e.currentTarget.dataset.date;
    const date = new Date(dateKey);
    
    this.setData({
      viewDate: date
    });
    
    this.generateCalendar();
  },

  /**
   * 绘制积分增长曲线
   */
  drawChart() {
    // 使用最新的Canvas 2D API获取上下文
    const query = wx.createSelectorQuery();
    query.select('#growthChart').fields({ node: true, size: true });
    query.exec((res) => {
      if (!res || !res[0]) {
        console.error('Canvas元素获取失败');
        return;
      }
      
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const width = res[0].width;
      const height = res[0].height;
      
      // 设置Canvas尺寸
      canvas.width = width;
      canvas.height = height;
      
      // 清空画布
      ctx.clearRect(0, 0, width, height);
      
      // 获取最近7天的数据
      const chartData = this.getChartData(7);
      
      // 转换数据，确保日期格式正确
      const processedData = chartData.map(item => {
        return {
          date: item.date,
          score: item.score || 0
        };
      });
      
      // 如果没有数据，显示提示
      if (processedData.length === 0) {
        // 绘制提示文字
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('暂无数据', width / 2, height / 2);
        return;
      }
      
      // 设置图表边距
      const margin = 30;
      const chartWidth = width - margin * 2;
      const chartHeight = height - margin * 2;
      
      // 设置坐标轴样式
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      
      // 绘制坐标轴
      ctx.beginPath();
      ctx.moveTo(margin, margin);
      ctx.lineTo(margin, height - margin);
      ctx.lineTo(width - margin, height - margin);
      ctx.stroke();
      
      // 绘制网格线
      ctx.strokeStyle = '#f3f4f6';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 10; i += 2) {
        const y = margin + (10 - i) / 10 * chartHeight;
        ctx.beginPath();
        ctx.moveTo(margin, y);
        ctx.lineTo(width - margin, y);
        ctx.stroke();
        
        // 绘制刻度标签
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(i.toString(), margin - 5, y + 4);
      }
      
      // 绘制填充区域
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.beginPath();
      ctx.moveTo(margin, height - margin);
      
      const pointSpacing = chartWidth / (processedData.length - 1);
      
      // 绘制填充区域
      processedData.forEach((item, index) => {
        const x = margin + index * pointSpacing;
        const y = margin + (10 - item.score) / 10 * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.lineTo(margin + (processedData.length - 1) * pointSpacing, height - margin);
      ctx.lineTo(margin, height - margin);
      ctx.closePath();
      ctx.fill();
      
      // 绘制数据点和连线
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.fillStyle = '#3b82f6';
      
      // 绘制连线
      ctx.beginPath();
      processedData.forEach((item, index) => {
        const x = margin + index * pointSpacing;
        const y = margin + (10 - item.score) / 10 * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      
      // 绘制数据点
      processedData.forEach((item, index) => {
        const x = margin + index * pointSpacing;
        const y = margin + (10 - item.score) / 10 * chartHeight;
        
        // 绘制点的外圈
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 绘制点的内圈
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制日期标签
        const date = new Date(item.date);
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        const month = date.getMonth() + 1;
        const day = date.getDate();
        ctx.fillText(`${month}/${day}`, x, height - margin + 15);
      });
    });
  },

  /**
   * 获取图表数据
   */
  getChartData(days) {
    const chartData = [];
    const today = new Date();
    
    // 生成最近days天的日期
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = this.formatDateKey(date);
      const score = this.getScoreForDate(dateKey) || 0;
      
      chartData.push({
        date: dateKey,
        score: score
      });
    }
    
    return chartData;
  }
});
