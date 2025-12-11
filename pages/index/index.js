// pages/index/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 任务列表
    tasks: [
      { id: 'skill1', icon: '📖', text: '学习技能1项', desc: '学习阅读、画画、练琴', points: 1 },
      { id: 'skill2', icon: '🎨', text: '学习技能1项', desc: '学习阅读、画画、练琴', points: 1 },
      { id: 'skill3', icon: '🎹', text: '学习技能1项', desc: '学习阅读、画画、练琴', points: 1 },
      { id: 'housework1', icon: '🧹', text: '做家务1项', desc: '帮大人扫地、擦桌子、洗碗', points: 1 },
      { id: 'housework2', icon: '🪑', text: '做家务1项', desc: '帮大人扫地、擦桌子、洗碗', points: 1 },
      { id: 'housework3', icon: '🥣', text: '做家务1项', desc: '帮大人扫地、擦桌子、洗碗', points: 1 },
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
    // 初始化当前日期，只包含日期部分，不包含时间部分
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    this.setData({
      currentDate: today,
      viewDate: today
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
    
    // 检查是否为未来日期 - 只比较日期部分，不比较时间部分
    const now = new Date();
    now.setHours(0, 0, 0, 0);
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
    
    // 生成空白格子以对齐到正确的星期几
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push({
        dateKey: null,
        day: null,
        score: null,
        isToday: false,
        classes: 'bg-transparent border-0 cursor-default',
        isFutureDate: true,
        isEmpty: true
      });
    }
    
    // 生成当月的天数
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const date = new Date(year, month, day);
      const isToday = this.isToday(date);
      const score = this.getScoreForDate(dateKey);
      
      // 只比较日期部分，不比较时间部分
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isFutureDate = date > today;
      
      // 检查是否为选中日期 - 使用日期字符串比较，避免时区和时间问题
      const selectedDateKey = this.formatDateKey(this.data.currentDate);
      const isSelected = dateKey === selectedDateKey;
      
      // 根据得分设置颜色 - 与index.html图例一致
      let cellClass = '';
      if (isToday) {
        cellClass += ' font-bold ';
        if (score === null) {
          cellClass += 'bg-stone-100 border border-stone-200 text-stone-500';
        } else if (score === 10) {
          cellClass += 'bg-green-500 text-white';
        } else if (score >= 6 && score <= 9) {
          cellClass += 'bg-blue-400 text-white';
        } else if (score >= 1 && score <= 5) {
          cellClass += 'bg-orange-300 text-white';
        } else {
          cellClass += 'bg-stone-100 border border-stone-200 text-stone-500';
        }
      } else {
        if (score === 10) {
          cellClass += 'bg-green-500 text-white';
        } else if (score >= 6 && score <= 9) {
          cellClass += 'bg-blue-400 text-white';
        } else if (score >= 1 && score <= 5) {
          cellClass += 'bg-orange-300 text-white';
        } else {
          cellClass += 'bg-stone-100 border border-stone-200 text-stone-500';
        }
      }
      
      // 添加选中日期的红色高亮描边
      if (isSelected && !isFutureDate) {
        cellClass += ' ring-4 ring-red-500 ring-offset-2 z-10';
      }
      
      calendarDays.push({
        dateKey: dateKey,
        day: day,
        score: score,
        isToday: isToday,
        classes: cellClass,
        isFutureDate: isFutureDate,
        isEmpty: false
      });
    }
    
    // 不再生成下个月的日期，只显示当月
    
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
   * 检查两个日期是否相同
   */
  isSameDate(date1, date2) {
    if (!date1 || !date2) {
      return false;
    }
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
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
    // 解析日期时确保使用本地时间，而不是UTC时间
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    // Only allow viewing/editing dates up to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date <= today) {
      this.setData({
        currentDate: date,
        viewDate: date
      });
      
      // 更新数据和UI
      this.loadData();
      this.generateCalendar();
      this.drawChart();
    }
  },

  /**
   * 绘制积分增长曲线
   */
  drawChart() {
    console.log('开始绘制积分增长曲线');
    
    try {
      // 对于type="2d"的canvas，需要使用新的Canvas 2D API
      const query = wx.createSelectorQuery();
      query.select('#growthChart').fields({ node: true, size: true });
      query.exec((res) => {
        if (!res || !res[0]) {
          console.error('Canvas元素获取失败');
          return;
        }
        
        console.log('获取Canvas元素成功', res[0]);
        
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const width = res[0].width;
        const height = res[0].height;
        
        // 设置Canvas尺寸
        canvas.width = width;
        canvas.height = height;
        
        console.log('Canvas尺寸:', width, height);
        
        // 清空画布
        ctx.clearRect(0, 0, width, height);
        
        // 绘制背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // 绘制一个简单的图表
        const chartData = this.getChartData(7);
        
        // 如果没有数据，显示提示
        if (chartData.length === 0) {
          ctx.fillStyle = '#6b7280';
          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('暂无数据', width / 2, height / 2);
          console.log('绘制提示文字');
          return;
        }
        
        console.log('图表数据:', chartData);
        
        // 设置图表边距
        const margin = 40;
        const chartWidth = width - margin * 2;
        const chartHeight = height - margin * 2;
        const pointSpacing = chartWidth / (chartData.length - 1);
        
        // 绘制坐标轴
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        // 绘制X轴和Y轴
        ctx.beginPath();
        // Y轴
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, height - margin);
        // X轴
        ctx.lineTo(width - margin, height - margin);
        ctx.stroke();
        
        // 绘制水平横线（网格线）
        ctx.strokeStyle = '#f3f4f6';
        ctx.lineWidth = 0.5;
        
        // 绘制10条横线，代表0-10分
        for (let i = 0; i <= 10; i++) {
          const y = margin + i / 10 * chartHeight;
          ctx.beginPath();
          ctx.moveTo(margin, y);
          ctx.lineTo(width - margin, y);
          ctx.stroke();
          
          // 绘制Y轴刻度标签
          ctx.fillStyle = '#6b7280';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText((10 - i).toString(), margin - 10, y + 4);
        }
        
        // 绘制折线
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        chartData.forEach((item, index) => {
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
        chartData.forEach((item, index) => {
          const x = margin + index * pointSpacing;
          const y = margin + (10 - item.score) / 10 * chartHeight;
          
          // 绘制点
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
          
          // 绘制X轴刻度标签（每隔一个点绘制一次）
          if (true) {
            const date = new Date(item.date);
            ctx.fillStyle = '#6b7280';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${date.getMonth() + 1}/${date.getDate()}`, x, height - margin + 20);
          }
        });
        
        console.log('绘制完成');
      });
    } catch (error) {
      console.error('绘制过程中出错:', error);
    }
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
