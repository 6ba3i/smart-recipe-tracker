import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, ProgressBar } from 'react-bootstrap';
import { useTheme } from '../../contexts/ThemeContext';
import { formatPercentage } from '../../utils/formatters';

const ProgressChart = ({ 
  data = [], 
  title = 'Progress Tracking',
  height = 300,
  showCard = true,
  progressType = 'line' // 'line', 'area', or 'bars'
}) => {
  const { getChartTheme } = useTheme();
  const chartTheme = getChartTheme();

  const chartOption = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        backgroundColor: chartTheme.backgroundColor,
        title: {
          text: 'No data available',
          left: 'center',
          top: 'middle',
          textStyle: {
            color: chartTheme.textColor,
            fontSize: 16
          }
        }
      };
    }

    const dates = data.map(item => item.date);
    const values = data.map(item => item.value || 0);
    const goals = data.map(item => item.goal || 0);

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
        formatter: (params) => {
          let tooltip = `${params[0].axisValue}<br/>`;
          params.forEach(param => {
            tooltip += `${param.seriesName}: ${param.value}<br/>`;
          });
          return tooltip;
        }
      },
      legend: {
        data: ['Actual', 'Goal'],
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
        data: dates,
        axisLine: {
          lineStyle: {
            color: chartTheme.axisColor
          }
        },
        axisLabel: {
          color: chartTheme.textColor,
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
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
          name: 'Actual',
          type: progressType === 'bars' ? 'bar' : 'line',
          data: values,
          smooth: progressType === 'line',
          itemStyle: {
            color: '#007bff'
          },
          ...(progressType === 'area' && {
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0,
                  color: 'rgba(0, 123, 255, 0.8)'
                }, {
                  offset: 1,
                  color: 'rgba(0, 123, 255, 0.1)'
                }]
              }
            }
          })
        },
        {
          name: 'Goal',
          type: 'line',
          data: goals,
          lineStyle: {
            type: 'dashed',
            color: '#28a745'
          },
          itemStyle: {
            color: '#28a745'
          }
        }
      ]
    };
  }, [data, title, progressType, chartTheme]);

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

  // Calculate summary stats
  const currentValue = data.length > 0 ? data[data.length - 1]?.value || 0 : 0;
  const currentGoal = data.length > 0 ? data[data.length - 1]?.goal || 0 : 0;
  const progress = currentGoal > 0 ? (currentValue / currentGoal) * 100 : 0;

  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body>
        {chart}
        <div className="mt-3">
          <div className="d-flex justify-content-between mb-2">
            <small className="text-muted">Current Progress</small>
            <small className="text-muted">{formatPercentage(currentValue, currentGoal)}</small>
          </div>
          <ProgressBar 
            now={Math.min(progress, 100)} 
            variant={progress >= 100 ? 'success' : progress >= 75 ? 'info' : progress >= 50 ? 'warning' : 'danger'}
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProgressChart;