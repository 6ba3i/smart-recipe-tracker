import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card } from 'react-bootstrap';
import { useTheme } from '../../contexts/ThemeContext';

const MealPlanChart = ({ 
  mealPlan = {}, 
  title = 'Weekly Meal Plan Overview',
  height = 300,
  showCard = true,
  chartType = 'calendar' // 'calendar', 'distribution', or 'timeline'
}) => {
  const { getChartTheme } = useTheme();
  const chartTheme = getChartTheme();

  const chartOption = useMemo(() => {
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    const mealTypeColors = {
      'Breakfast': '#FFD93D',
      'Lunch': '#6BCF7F',
      'Dinner': '#4D96FF',
      'Snack': '#FF6B9D'
    };

    if (chartType === 'distribution') {
      // Pie chart showing meal type distribution
      const mealCounts = mealTypes.map(type => {
        let count = 0;
        Object.values(mealPlan).forEach(dayMeals => {
          if (dayMeals[type]) {
            count += dayMeals[type].length;
          }
        });
        return { name: type, value: count };
      });

      return {
        backgroundColor: chartTheme.backgroundColor,
        title: {
          text: title,
          left: 'center',
          textStyle: {
            color: chartTheme.textColor,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} meals ({d}%)'
        },
        legend: {
          orient: 'horizontal',
          bottom: '5%',
          textStyle: {
            color: chartTheme.textColor
          }
        },
        series: [{
          name: 'Meal Type',
          type: 'pie',
          radius: '70%',
          data: mealCounts.map(item => ({
            ...item,
            itemStyle: {
              color: mealTypeColors[item.name]
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

    if (chartType === 'timeline') {
      // Line chart showing meals planned over time
      const days = Object.keys(mealPlan).sort();
      const series = mealTypes.map(mealType => ({
        name: mealType,
        type: 'line',
        data: days.map(day => {
          const dayMeals = mealPlan[day];
          return dayMeals[mealType] ? dayMeals[mealType].length : 0;
        }),
        itemStyle: {
          color: mealTypeColors[mealType]
        }
      }));

      return {
        backgroundColor: chartTheme.backgroundColor,
        title: {
          text: title,
          left: 'center',
          textStyle: {
            color: chartTheme.textColor,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: mealTypes,
          bottom: '5%',
          textStyle: {
            color: chartTheme.textColor
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
              color: chartTheme.axisColor
            }
          },
          axisLabel: {
            color: chartTheme.textColor
          }
        },
        yAxis: {
          type: 'value',
          name: 'Number of Meals',
          nameTextStyle: {
            color: chartTheme.textColor
          },
          axisLine: {
            lineStyle: {
              color: chartTheme.axisColor
            }
          },
          axisLabel: {
            color: chartTheme.textColor
          },
          splitLine: {
            lineStyle: {
              color: chartTheme.gridColor
            }
          }
        },
        series
      };
    }

    // Default: Stacked bar chart (calendar-like view)
    const days = Object.keys(mealPlan).sort();
    const series = mealTypes.map(mealType => ({
      name: mealType,
      type: 'bar',
      stack: 'total',
      data: days.map(day => {
        const dayMeals = mealPlan[day];
        return dayMeals[mealType] ? dayMeals[mealType].length : 0;
      }),
      itemStyle: {
        color: mealTypeColors[mealType]
      }
    }));

    return {
      backgroundColor: chartTheme.backgroundColor,
      title: {
        text: title,
        left: 'center',
        textStyle: {
          color: chartTheme.textColor,
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
        bottom: '5%',
        textStyle: {
          color: chartTheme.textColor
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
            color: chartTheme.axisColor
          }
        },
        axisLabel: {
          color: chartTheme.textColor
        }
      },
      yAxis: {
        type: 'value',
        name: 'Number of Recipes',
        nameTextStyle: {
          color: chartTheme.textColor
        },
        axisLine: {
          lineStyle: {
            color: chartTheme.axisColor
          }
        },
        axisLabel: {
          color: chartTheme.textColor
        },
        splitLine: {
          lineStyle: {
            color: chartTheme.gridColor
          }
        }
      },
      series
    };
  }, [mealPlan, title, chartType, chartTheme]);

  const chart = (
    <ReactECharts 
      option={chartOption}
      style={{ height: `${height}px`, width: '100%' }}
      opts={{ renderer: 'svg' }}
    />
  );

  if (!showCard) {
    return chart;
  }

  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body>
        {chart}
      </Card.Body>
    </Card>
  );
};

export default MealPlanChart;