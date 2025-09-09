/**
 * Chart Service for ECharts Integration
 * 
 * Features:
 * - Nutrition tracking charts
 * - Recipe analytics visualizations
 * - User behavior charts
 * - Responsive chart configurations
 * - Theme support
 * - Export capabilities
 */

class ChartService {
  constructor() {
    this.defaultColors = [
      '#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE',
      '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC', '#FF9F7F'
    ];
    
    this.nutritionColors = {
      calories: '#FF6B6B',
      protein: '#4ECDC4',
      carbs: '#45B7D1',
      fat: '#96CEB4',
      fiber: '#FECA57',
      sugar: '#FF9FF3',
      sodium: '#54A0FF'
    };

    this.chartThemes = {
      light: {
        backgroundColor: '#ffffff',
        textColor: '#333333',
        gridColor: '#f0f0f0',
        axisColor: '#cccccc'
      },
      dark: {
        backgroundColor: '#2c2c2c',
        textColor: '#ffffff',
        gridColor: '#404040',
        axisColor: '#666666'
      }
    };
  }

  // ====================================
  // NUTRITION CHARTS
  // ====================================

  createCaloriesProgressChart(consumed, goal, theme = 'light') {
    const remaining = Math.max(0, goal - consumed);
    const excess = consumed > goal ? consumed - goal : 0;
    
    return {
      backgroundColor: this.chartThemes[theme].backgroundColor,
      title: {
        text: 'Daily Calories',
        left: 'center',
        textStyle: {
          color: this.chartThemes[theme].textColor,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          return `${params.seriesName}<br/>${params.name}: ${params.value} cal (${params.percent}%)`;
        }
      },
      legend: {
        orient: 'horizontal',
        bottom: '0%',
        textStyle: {
          color: this.chartThemes[theme].textColor
        }
      },
      series: [{
        name: 'Calories',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        data: [
          {
            name: 'Consumed',
            value: Math.min(consumed, goal),
            itemStyle: { color: this.nutritionColors.calories }
          },
          ...(remaining > 0 ? [{
            name: 'Remaining',
            value: remaining,
            itemStyle: { color: '#E8E8E8' }
          }] : []),
          ...(excess > 0 ? [{
            name: 'Over Goal',
            value: excess,
            itemStyle: { color: '#FF4757' }
          }] : [])
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{d}%',
          color: this.chartThemes[theme].textColor
        }
      }]
    };
  }

  createMacronutrientChart(data, goals, theme = 'light') {
    const macros = ['protein', 'carbs', 'fat'];
    
    return {
      backgroundColor: this.chartThemes[theme].backgroundColor,
      title: {
        text: 'Macronutrients',
        left: 'center',
        textStyle: {
          color: this.chartThemes[theme].textColor,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params) {
          let tooltip = `${params[0].axisValue}<br/>`;
          params.forEach(param => {
            tooltip += `${param.seriesName}: ${param.value}g<br/>`;
          });
          return tooltip;
        }
      },
      legend: {
        data: ['Consumed', 'Goal'],
        bottom: '0%',
        textStyle: {
          color: this.chartThemes[theme].textColor
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: macros.map(macro => macro.charAt(0).toUpperCase() + macro.slice(1)),
        axisLine: {
          lineStyle: {
            color: this.chartThemes[theme].axisColor
          }
        },
        axisLabel: {
          color: this.chartThemes[theme].textColor
        }
      },
      yAxis: {
        type: 'value',
        name: 'Grams',
        nameTextStyle: {
          color: this.chartThemes[theme].textColor
        },
        axisLine: {
          lineStyle: {
            color: this.chartThemes[theme].axisColor
          }
        },
        axisLabel: {
          color: this.chartThemes[theme].textColor
        },
        splitLine: {
          lineStyle: {
            color: this.chartThemes[theme].gridColor
          }
        }
      },
      series: [
        {
          name: 'Consumed',
          type: 'bar',
          data: macros.map(macro => ({
            value: data[macro] || 0,
            itemStyle: {
              color: this.nutritionColors[macro]
            }
          }))
        },
        {
          name: 'Goal',
          type: 'bar',
          data: macros.map(macro => ({
            value: goals[macro] || 0,
            itemStyle: {
              color: this.nutritionColors[macro],
              opacity: 0.3
            }
          }))
        }
      ]
    };
  }

  createWeeklyNutritionTrend(weekData, nutrient = 'calories', theme = 'light') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return {
      backgroundColor: this.chartThemes[theme].backgroundColor,
      title: {
        text: `Weekly ${nutrient.charAt(0).toUpperCase() + nutrient.slice(1)} Trend`,
        left: 'center',
        textStyle: {
          color: this.chartThemes[theme].textColor,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          const param = params[0];
          return `${param.axisValue}<br/>${param.seriesName}: ${param.value}${nutrient === 'calories' ? ' cal' : 'g'}`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: days,
        axisLine: {
          lineStyle: {
            color: this.chartThemes[theme].axisColor
          }
        },
        axisLabel: {
          color: this.chartThemes[theme].textColor
        }
      },
      yAxis: {
        type: 'value',
        name: nutrient === 'calories' ? 'Calories' : 'Grams',
        nameTextStyle: {
          color: this.chartThemes[theme].textColor
        },
        axisLine: {
          lineStyle: {
            color: this.chartThemes[theme].axisColor
          }
        },
        axisLabel: {
          color: this.chartThemes[theme].textColor
        },
        splitLine: {
          lineStyle: {
            color: this.chartThemes[theme].gridColor
          }
        }
      },
      series: [{
        name: nutrient.charAt(0).toUpperCase() + nutrient.slice(1),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: weekData.map(day => day[nutrient] || 0),
        itemStyle: {
          color: this.nutritionColors[nutrient] || this.defaultColors[0]
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: this.nutritionColors[nutrient] || this.defaultColors[0]
            }, {
              offset: 1,
              color: 'rgba(0,0,0,0)'
            }]
          }
        }
      }]
    };
  }

  // ====================================
  // RECIPE ANALYTICS CHARTS
  // ====================================

  createCuisineDistribution(cuisineData, theme = 'light') {
    const sortedData = Object.entries(cuisineData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8); // Top 8 cuisines

    return {
      backgroundColor: this.chartThemes[theme].backgroundColor,
      title: {
        text: 'Favorite Cuisines',
        left: 'center',
        textStyle: {
          color: this.chartThemes[theme].textColor,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} recipes ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'right',
        top: 'middle',
        textStyle: {
          color: this.chartThemes[theme].textColor
        }
      },
      series: [{
        name: 'Cuisines',
        type: 'pie',
        radius: '70%',
        center: ['40%', '50%'],
        data: sortedData.map(([name, value], index) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
          itemStyle: {
            color: this.defaultColors[index % this.defaultColors.length]
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  }

  createCookingTimeAnalysis(recipes, theme = 'light') {
    const timeRanges = {
      '0-15 min': 0,
      '15-30 min': 0,
      '30-45 min': 0,
      '45-60 min': 0,
      '60+ min': 0
    };

    recipes.forEach(recipe => {
      const time = recipe.readyInMinutes || 0;
      if (time <= 15) timeRanges['0-15 min']++;
      else if (time <= 30) timeRanges['15-30 min']++;
      else if (time <= 45) timeRanges['30-45 min']++;
      else if (time <= 60) timeRanges['45-60 min']++;
      else timeRanges['60+ min']++;
    });

    return {
      backgroundColor: this.chartThemes[theme].backgroundColor,
      title: {
        text: 'Cooking Time Preferences',
        left: 'center',
        textStyle: {
          color: this.chartThemes[theme].textColor,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: Object.keys(timeRanges),
        axisLine: {
          lineStyle: {
            color: this.chartThemes[theme].axisColor
          }
        },
        axisLabel: {
          color: this.chartThemes[theme].textColor,
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: 'Number of Recipes',
        nameTextStyle: {
          color: this.chartThemes[theme].textColor
        },
        axisLine: {
          lineStyle: {
            color: this.chartThemes[theme].axisColor
          }
        },
        axisLabel: {
          color: this.chartThemes[theme].textColor
        },
        splitLine: {
          lineStyle: {
            color: this.chartThemes[theme].gridColor
          }
        }
      },
      series: [{
        name: 'Recipes',
        type: 'bar',
        data: Object.values(timeRanges).map((value, index) => ({
          value,
          itemStyle: {
            color: this.defaultColors[index % this.defaultColors.length]
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  }

  createHealthScoreDistribution(recipes, theme = 'light') {
    const scoreRanges = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0
    };

    recipes.forEach(recipe => {
      const score = recipe.healthScore || recipe.spoonacularScore || 0;
      if (score <= 20) scoreRanges['0-20']++;
      else if (score <= 40) scoreRanges['21-40']++;
      else if (score <= 60) scoreRanges['41-60']++;
      else if (score <= 80) scoreRanges['61-80']++;
      else scoreRanges['81-100']++;
    });

    return {
      backgroundColor: this.chartThemes[theme].backgroundColor,
      title: {
        text: 'Recipe Health Score Distribution',
        left: 'center',
        textStyle: {
          color: this.chartThemes[theme].textColor,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} recipes ({d}%)'
      },
      series: [{
        name: 'Health Score',
        type: 'pie',
        radius: ['30%', '70%'],
        roseType: 'radius',
        data: Object.entries(scoreRanges).map(([name, value], index) => ({
          name,
          value,
          itemStyle: {
            color: this.getHealthScoreColor(index)
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  }

  // ====================================
  // MEAL PLANNING CHARTS
  // ====================================

  createMealPlanCalorieDistribution(mealPlan, theme = 'light') {
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    const calorieData = mealTypes.map(type => {
      let totalCalories = 0;
      Object.values(mealPlan).forEach(dayMeals => {
        if (dayMeals[type]) {
          dayMeals[type].forEach(recipe => {
            totalCalories += recipe.calories || 0;
          });
        }
      });
      return totalCalories;
    });

    return {
      backgroundColor: this.chartThemes[theme].backgroundColor,
      title: {
        text: 'Weekly Meal Plan - Calories by Meal Type',
        left: 'center',
        textStyle: {
          color: this.chartThemes[theme].textColor,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} cal ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: '0%',
        textStyle: {
          color: this.chartThemes[theme].textColor
        }
      },
      series: [{
        name: 'Meal Type',
        type: 'pie',
        radius: '70%',
        data: mealTypes.map((type, index) => ({
          name: type,
          value: calorieData[index],
          itemStyle: {
            color: this.getMealTypeColor(type)
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  }

  createWeeklyMealPlanOverview(mealPlan, theme = 'light') {
    const days = Object.keys(mealPlan).sort();
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    
    const series = mealTypes.map(mealType => ({
      name: mealType,
      type: 'bar',
      stack: 'total',
      data: days.map(day => {
        const dayMeals = mealPlan[day];
        return dayMeals[mealType] ? dayMeals[mealType].length : 0;
      }),
      itemStyle: {
        color: this.getMealTypeColor(mealType)
      }
    }));

    return {
      backgroundColor: this.chartThemes[theme].backgroundColor,
      title: {
        text: 'Weekly Meal Plan Overview',
        left: 'center',
        textStyle: {
          color: this.chartThemes[theme].textColor,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: mealTypes,
        bottom: '0%',
        textStyle: {
          color: this.chartThemes[theme].textColor
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: days.map(day => new Date(day).toLocaleDateString('en-US', { weekday: 'short' })),
        axisLine: {
          lineStyle: {
            color: this.chartThemes[theme].axisColor
          }
        },
        axisLabel: {
          color: this.chartThemes[theme].textColor
        }
      },
      yAxis: {
        type: 'value',
        name: 'Number of Recipes',
        nameTextStyle: {
          color: this.chartThemes[theme].textColor
        },
        axisLine: {
          lineStyle: {
            color: this.chartThemes[theme].axisColor
          }
        },
        axisLabel: {
          color: this.chartThemes[theme].textColor
        },
        splitLine: {
          lineStyle: {
            color: this.chartThemes[theme].gridColor
          }
        }
      },
      series
    };
  }

  // ====================================
  // UTILITY FUNCTIONS
  // ====================================

  getHealthScoreColor(index) {
    const colors = ['#FF6B6B', '#FFA500', '#FFD700', '#90EE90', '#32CD32'];
    return colors[index] || this.defaultColors[0];
  }

  getMealTypeColor(mealType) {
    const colors = {
      'Breakfast': '#FFD93D',
      'Lunch': '#6BCF7F',
      'Dinner': '#4D96FF',
      'Snack': '#FF6B9D'
    };
    return colors[mealType] || this.defaultColors[0];
  }

  // ====================================
  // EXPORT FUNCTIONALITY
  // ====================================

  exportChartAsImage(chartInstance, filename = 'chart.png') {
    if (!chartInstance) {
      console.error('Chart instance is required for export');
      return;
    }

    try {
      const url = chartInstance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
      });

      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting chart:', error);
    }
  }

  exportChartData(data, filename = 'chart-data.json') {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting chart data:', error);
    }
  }

  // ====================================
  // RESPONSIVE UTILITIES
  // ====================================

  getResponsiveOptions(containerWidth) {
    const isMobile = containerWidth < 768;
    const isTablet = containerWidth >= 768 && containerWidth < 1024;

    return {
      grid: {
        left: isMobile ? '5%' : '3%',
        right: isMobile ? '5%' : '4%',
        bottom: isMobile ? '20%' : '10%',
        containLabel: true
      },
      legend: {
        orient: isMobile ? 'horizontal' : 'vertical',
        bottom: isMobile ? '0%' : 'auto',
        left: isMobile ? 'center' : 'right',
        itemWidth: isMobile ? 15 : 25,
        itemHeight: isMobile ? 10 : 14,
        textStyle: {
          fontSize: isMobile ? 10 : 12
        }
      },
      title: {
        textStyle: {
          fontSize: isMobile ? 14 : 16
        }
      }
    };
  }
}

export default new ChartService();