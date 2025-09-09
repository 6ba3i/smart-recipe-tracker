import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card } from 'react-bootstrap';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMacronutrient } from '../../utils/formatters';

const NutritionChart = ({ 
  data = {}, 
  goals = {}, 
  title = 'Macronutrients',
  height = 300,
  showCard = true,
  chartType = 'bar' // 'bar' or 'pie'
}) => {
  const { getChartTheme } = useTheme();
  const chartTheme = getChartTheme();

  const chartOption = useMemo(() => {
    const macros = ['protein', 'carbs', 'fat'];
    const colors = ['#28a745', '#ffc107', '#dc3545'];

    if (chartType === 'pie') {
      const pieData = macros.map((macro, index) => ({
        name: macro.charAt(0).toUpperCase() + macro.slice(1),
        value: data[macro] || 0,
        itemStyle: { color: colors[index] }
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
          trigger: 'item',
          formatter: (params) => {
            return `${params.name}: ${formatMacronutrient(params.value)} (${params.percent}%)`;
          }
        },
        legend: {
          orient: 'horizontal',
          bottom: '5%',
          textStyle: {
            color: chartTheme.textColor
          }
        },
        series: [{
          name: 'Macronutrients',
          type: 'pie',
          radius: '70%',
          data: pieData,
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

    // Bar chart
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
        },
        formatter: (params) => {
          let tooltip = `${params[0].axisValue}<br/>`;
          params.forEach(param => {
            tooltip += `${param.seriesName}: ${formatMacronutrient(param.value)}<br/>`;
          });
          return tooltip;
        }
      },
      legend: {
        data: ['Consumed', 'Goal'],
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
        data: macros.map(macro => macro.charAt(0).toUpperCase() + macro.slice(1)),
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
        name: 'Grams',
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
      series: [
        {
          name: 'Consumed',
          type: 'bar',
          data: macros.map((macro, index) => ({
            value: data[macro] || 0,
            itemStyle: {
              color: colors[index]
            }
          }))
        },
        {
          name: 'Goal',
          type: 'bar',
          data: macros.map((macro, index) => ({
            value: goals[macro] || 0,
            itemStyle: {
              color: colors[index],
              opacity: 0.3
            }
          }))
        }
      ]
    };
  }, [data, goals, title, chartType, chartTheme]);

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

export default NutritionChart;
