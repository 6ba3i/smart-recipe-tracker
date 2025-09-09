import { useState, useCallback, useMemo } from 'react';

const useChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Common chart color palette
  const colors = useMemo(() => ({
    primary: '#007bff',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
    gradient: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8']
  }), []);

  // Create pie chart configuration
  const createPieChart = useCallback((data, title = '') => {
    return {
      title: {
        text: title,
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      series: [{
        name: title,
        type: 'pie',
        radius: ['40%', '70%'],
        data: data.map((item, index) => ({
          ...item,
          itemStyle: {
            color: colors.gradient[index % colors.gradient.length]
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
  }, [colors]);

  // Create bar chart configuration
  const createBarChart = useCallback((data, title = '', xAxisData = []) => {
    return {
      title: {
        text: title,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: xAxisData
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: data.map((value, index) => ({
          value,
          itemStyle: {
            color: colors.gradient[index % colors.gradient.length]
          }
        })),
        type: 'bar'
      }]
    };
  }, [colors]);

  // Create line chart configuration
  const createLineChart = useCallback((data, title = '', xAxisData = []) => {
    return {
      title: {
        text: title,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: xAxisData
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: data,
        type: 'line',
        smooth: true,
        itemStyle: {
          color: colors.primary
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: colors.primary
            }, {
              offset: 1, color: 'rgba(0, 123, 255, 0.1)'
            }]
          }
        }
      }]
    };
  }, [colors]);

  // Process nutrition data for charts
  const processNutritionData = useCallback((nutritionEntries) => {
    setLoading(true);
    
    try {
      const totals = nutritionEntries.reduce((acc, entry) => {
        acc.calories += entry.calories || 0;
        acc.protein += entry.protein || 0;
        acc.carbs += entry.carbs || 0;
        acc.fat += entry.fat || 0;
        return acc;
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

      const macroData = [
        { name: 'Protein', value: totals.protein },
        { name: 'Carbs', value: totals.carbs },
        { name: 'Fat', value: totals.fat }
      ];

      const result = {
        totals,
        macroChart: createPieChart(macroData, 'Macronutrient Distribution'),
        caloriesChart: createPieChart([
          { name: 'Calories Consumed', value: totals.calories },
          { name: 'Remaining', value: Math.max(0, 2000 - totals.calories) }
        ], 'Daily Calories')
      };

      setChartData(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, [createPieChart]);

  // Process favorites data for charts
  const processFavoritesData = useCallback((favorites) => {
    setLoading(true);
    
    try {
      const cuisineCount = {};
      const dishTypeCount = {};
      
      favorites.forEach(recipe => {
        if (recipe.cuisines) {
          recipe.cuisines.forEach(cuisine => {
            cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1;
          });
        }
        if (recipe.dishTypes) {
          recipe.dishTypes.forEach(type => {
            dishTypeCount[type] = (dishTypeCount[type] || 0) + 1;
          });
        }
      });

      const cuisineData = Object.entries(cuisineCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }));

      const dishTypeData = Object.entries(dishTypeCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }));

      const result = {
        cuisineChart: createPieChart(cuisineData, 'Favorite Cuisines'),
        dishTypeChart: createBarChart(
          dishTypeData.map(item => item.value),
          'Favorite Dish Types',
          dishTypeData.map(item => item.name)
        )
      };

      setChartData(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, [createPieChart, createBarChart]);

  return {
    chartData,
    loading,
    colors,
    createPieChart,
    createBarChart,
    createLineChart,
    processNutritionData,
    processFavoritesData,
    setChartData
  };
};

export default useChart;