import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card } from 'react-bootstrap';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCalories } from '../../utils/formatters';

const CalorieChart = ({ 
  consumed = 0, 
  goal = 2000, 
  title = 'Daily Calories',
  height = 300,
  showCard = true 
}) => {
  const { getChartTheme } = useTheme();
  const chartTheme = getChartTheme();

  const chartOption = useMemo(() => {
    const remaining = Math.max(0, goal - consumed);
    const excess = consumed > goal ? consumed - goal : 0;

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
          return `${params.seriesName}<br/>${params.name}: ${formatCalories(params.value)} (${params.percent}%)`;
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
        name: 'Calories',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '40%'],
        data: [
          {
            name: 'Consumed',
            value: Math.min(consumed, goal),
            itemStyle: { color: '#007bff' }
          },
          ...(remaining > 0 ? [{
            name: 'Remaining',
            value: remaining,
            itemStyle: { color: '#e9ecef' }
          }] : []),
          ...(excess > 0 ? [{
            name: 'Over Goal',
            value: excess,
            itemStyle: { color: '#dc3545' }
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
          color: chartTheme.textColor
        }
      }]
    };
  }, [consumed, goal, title, chartTheme]);

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
        <div className="text-center mt-2">
          <small className="text-muted">
            {formatCalories(consumed)} of {formatCalories(goal)} consumed
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CalorieChart;
