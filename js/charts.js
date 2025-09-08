// ECharts Configuration and Management
class ChartManager {
    constructor() {
        this.charts = new Map();
        this.theme = this.getChartTheme();
        this.initialized = false;
        
        // Wait for ECharts to be available
        this.initializeWhenReady();
    }

    initializeWhenReady() {
        if (typeof echarts !== 'undefined') {
            this.initialized = true;
            console.log('Chart Manager initialized with ECharts');
        } else {
            setTimeout(() => this.initializeWhenReady(), 100);
        }
    }

    getChartTheme() {
        return {
            color: [
                '#6366f1', '#8b5cf6', '#10b981', '#f59e0b', 
                '#ef4444', '#06b6d4', '#84cc16', '#f97316'
            ],
            backgroundColor: 'transparent',
            textStyle: {
                color: '#f8fafc',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
            },
            title: {
                textStyle: {
                    color: '#f8fafc',
                    fontSize: 18,
                    fontWeight: 600
                }
            },
            legend: {
                textStyle: {
                    color: '#cbd5e1'
                }
            },
            tooltip: {
                backgroundColor: '#1e293b',
                borderColor: '#475569',
                textStyle: {
                    color: '#f8fafc'
                }
            },
            grid: {
                borderColor: '#475569'
            },
            categoryAxis: {
                axisLine: {
                    lineStyle: {
                        color: '#475569'
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: '#475569'
                    }
                },
                axisLabel: {
                    color: '#cbd5e1'
                },
                splitLine: {
                    lineStyle: {
                        color: '#334155'
                    }
                }
            },
            valueAxis: {
                axisLine: {
                    lineStyle: {
                        color: '#475569'
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: '#475569'
                    }
                },
                axisLabel: {
                    color: '#cbd5e1'
                },
                splitLine: {
                    lineStyle: {
                        color: '#334155'
                    }
                }
            }
        };
    }

    // Create nutrition pie chart
    createNutritionChart(containerId, data) {
        if (!this.initialized) {
            setTimeout(() => this.createNutritionChart(containerId, data), 100);
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return null;
        }

        // Dispose existing chart
        if (this.charts.has(containerId)) {
            this.charts.get(containerId).dispose();
        }

        const chart = echarts.init(container, null, {
            renderer: 'canvas',
            useDirtyRect: false
        });

        const option = {
            title: {
                text: data.title || 'Nutrition Breakdown',
                left: 'center',
                top: 20,
                textStyle: this.theme.title.textStyle
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c}g ({d}%)',
                ...this.theme.tooltip
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                top: 'center',
                textStyle: this.theme.legend.textStyle
            },
            series: [
                {
                    name: 'Macronutrients',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['60%', '50%'],
                    avoidLabelOverlap: false,
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '16',
                            fontWeight: 'bold',
                            color: '#f8fafc'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: [
                        { 
                            value: data.protein * 4, 
                            name: 'Protein',
                            itemStyle: { color: this.theme.color[0] }
                        },
                        { 
                            value: data.carbs * 4, 
                            name: 'Carbohydrates',
                            itemStyle: { color: this.theme.color[1] }
                        },
                        { 
                            value: data.fat * 9, 
                            name: 'Fat',
                            itemStyle: { color: this.theme.color[2] }
                        }
                    ],
                    animationType: 'scale',
                    animationEasing: 'elasticOut',
                    animationDelay: (idx) => Math.random() * 200
                }
            ]
        };

        chart.setOption(option);
        this.charts.set(containerId, chart);

        // Auto-resize
        window.addEventListener('resize', () => {
            chart.resize();
        });

        return chart;
    }

    // Create weekly progress chart
    createWeeklyChart(containerId, data) {
        if (!this.initialized) {
            setTimeout(() => this.createWeeklyChart(containerId, data), 100);
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return null;
        }

        // Dispose existing chart
        if (this.charts.has(containerId)) {
            this.charts.get(containerId).dispose();
        }

        const chart = echarts.init(container);

        const option = {
            title: {
                text: data.title || 'Weekly Progress',
                left: 'center',
                textStyle: this.theme.title.textStyle
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                },
                ...this.theme.tooltip
            },
            legend: {
                data: ['Calories', 'Protein', 'Goal'],
                top: 40,
                textStyle: this.theme.legend.textStyle
            },
            xAxis: [
                {
                    type: 'category',
                    data: data.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    axisPointer: {
                        type: 'shadow'
                    },
                    ...this.theme.categoryAxis
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: 'Calories',
                    min: 0,
                    max: 2500,
                    interval: 500,
                    axisLabel: {
                        formatter: '{value} cal',
                        color: this.theme.categoryAxis.axisLabel.color
                    },
                    ...this.theme.valueAxis
                },
                {
                    type: 'value',
                    name: 'Protein (g)',
                    min: 0,
                    max: 200,
                    interval: 50,
                    axisLabel: {
                        formatter: '{value} g',
                        color: this.theme.categoryAxis.axisLabel.color
                    },
                    ...this.theme.valueAxis
                }
            ],
            series: [
                {
                    name: 'Calories',
                    type: 'bar',
                    data: data.calories || [1800, 1950, 2100, 1750, 2200, 1600, 1900],
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: this.theme.color[0] },
                            { offset: 1, color: this.theme.color[0] + '80' }
                        ])
                    },
                    emphasis: {
                        itemStyle: {
                            color: this.theme.color[0]
                        }
                    }
                },
                {
                    name: 'Protein',
                    type: 'line',
                    yAxisIndex: 1,
                    data: data.protein || [120, 135, 140, 110, 155, 95, 130],
                    smooth: true,
                    lineStyle: {
                        color: this.theme.color[1],
                        width: 3
                    },
                    itemStyle: {
                        color: this.theme.color[1]
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: this.theme.color[1] + '40' },
                            { offset: 1, color: this.theme.color[1] + '10' }
                        ])
                    }
                },
                {
                    name: 'Goal',
                    type: 'line',
                    data: Array(7).fill(data.calorieGoal || 2000),
                    lineStyle: {
                        color: this.theme.color[2],
                        type: 'dashed',
                        width: 2
                    },
                    itemStyle: {
                        color: this.theme.color[2]
                    },
                    symbol: 'none'
                }
            ],
            animation: true,
            animationDuration: 1000,
            animationEasing: 'cubicOut'
        };

        chart.setOption(option);
        this.charts.set(containerId, chart);

        // Auto-resize
        window.addEventListener('resize', () => {
            chart.resize();
        });

        return chart;
    }

    // Create health metrics chart
    createHealthMetricsChart(containerId, data) {
        if (!this.initialized) {
            setTimeout(() => this.createHealthMetricsChart(containerId, data), 100);
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) return null;

        if (this.charts.has(containerId)) {
            this.charts.get(containerId).dispose();
        }

        const chart = echarts.init(container);

        const option = {
            title: {
                text: 'Health Metrics Trend',
                left: 'center',
                textStyle: this.theme.title.textStyle
            },
            tooltip: {
                trigger: 'axis',
                ...this.theme.tooltip
            },
            legend: {
                data: ['Weight', 'Body Fat %', 'Muscle Mass'],
                top: 40,
                textStyle: this.theme.legend.textStyle
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: data.dates || ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                ...this.theme.categoryAxis
            },
            yAxis: {
                type: 'value',
                ...this.theme.valueAxis
            },
            series: [
                {
                    name: 'Weight',
                    type: 'line',
                    stack: 'Total',
                    data: data.weight || [70, 69.5, 69.2, 68.8],
                    smooth: true,
                    lineStyle: { color: this.theme.color[0] },
                    itemStyle: { color: this.theme.color[0] }
                },
                {
                    name: 'Body Fat %',
                    type: 'line',
                    stack: 'Total',
                    data: data.bodyFat || [15.2, 14.8, 14.5, 14.1],
                    smooth: true,
                    lineStyle: { color: this.theme.color[1] },
                    itemStyle: { color: this.theme.color[1] }
                },
                {
                    name: 'Muscle Mass',
                    type: 'line',
                    stack: 'Total',
                    data: data.muscleMass || [32.1, 32.3, 32.5, 32.8],
                    smooth: true,
                    lineStyle: { color: this.theme.color[2] },
                    itemStyle: { color: this.theme.color[2] }
                }
            ]
        };

        chart.setOption(option);
        this.charts.set(containerId, chart);

        window.addEventListener('resize', () => {
            chart.resize();
        });

        return chart;
    }

    // Create recipe analytics chart
    createRecipeAnalyticsChart(containerId, data) {
        if (!this.initialized) {
            setTimeout(() => this.createRecipeAnalyticsChart(containerId, data), 100);
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) return null;

        if (this.charts.has(containerId)) {
            this.charts.get(containerId).dispose();
        }

        const chart = echarts.init(container);

        const option = {
            title: {
                text: 'Recipe Performance Analytics',
                left: 'center',
                textStyle: this.theme.title.textStyle
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                ...this.theme.tooltip
            },
            legend: {
                data: ['Accuracy %', 'User Satisfaction'],
                top: 40,
                textStyle: this.theme.legend.textStyle
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['K-Means', 'Collaborative', 'Decision Tree', 'Genetic Algorithm'],
                ...this.theme.categoryAxis
            },
            yAxis: {
                type: 'value',
                max: 100,
                ...this.theme.valueAxis
            },
            series: [
                {
                    name: 'Accuracy %',
                    type: 'bar',
                    data: data.accuracy || [78, 85, 82, 88],
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: this.theme.color[0] },
                            { offset: 1, color: this.theme.color[0] + '60' }
                        ])
                    }
                },
                {
                    name: 'User Satisfaction',
                    type: 'bar',
                    data: data.satisfaction || [72, 80, 77, 84],
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: this.theme.color[1] },
                            { offset: 1, color: this.theme.color[1] + '60' }
                        ])
                    }
                }
            ]
        };

        chart.setOption(option);
        this.charts.set(containerId, chart);

        window.addEventListener('resize', () => {
            chart.resize();
        });

        return chart;
    }

    // Create meal plan optimization chart
    createMealPlanChart(containerId, data) {
        if (!this.initialized) {
            setTimeout(() => this.createMealPlanChart(containerId, data), 100);
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) return null;

        if (this.charts.has(containerId)) {
            this.charts.get(containerId).dispose();
        }

        const chart = echarts.init(container);

        const option = {
            title: {
                text: 'Meal Plan Optimization',
                subtext: 'Nutrition vs Cost vs Time',
                left: 'center',
                textStyle: this.theme.title.textStyle
            },
            tooltip: {
                trigger: 'item',
                formatter: (params) => {
                    return `${params.data.name}<br/>
                            Nutrition Score: ${params.data.value[0]}<br/>
                            Cost: $${params.data.value[1]}<br/>
                            Time: ${params.data.value[2]} min`;
                },
                ...this.theme.tooltip
            },
            legend: {
                data: ['Optimized Plans', 'Alternative Plans'],
                top: 60,
                textStyle: this.theme.legend.textStyle
            },
            xAxis: {
                type: 'value',
                name: 'Nutrition Score',
                nameLocation: 'middle',
                nameGap: 30,
                ...this.theme.valueAxis
            },
            yAxis: {
                type: 'value',
                name: 'Cost ($)',
                nameLocation: 'middle',
                nameGap: 40,
                ...this.theme.valueAxis
            },
            series: [
                {
                    name: 'Optimized Plans',
                    type: 'scatter',
                    data: data.optimized || [
                        { name: 'Plan A', value: [85, 35, 120] },
                        { name: 'Plan B', value: [90, 42, 105] },
                        { name: 'Plan C', value: [88, 38, 110] }
                    ],
                    symbolSize: (data) => data[2] / 3, // Size based on time
                    itemStyle: {
                        color: this.theme.color[0],
                        opacity: 0.8
                    },
                    emphasis: {
                        itemStyle: {
                            color: this.theme.color[0]
                        }
                    }
                },
                {
                    name: 'Alternative Plans',
                    type: 'scatter',
                    data: data.alternatives || [
                        { name: 'Alt 1', value: [70, 25, 90] },
                        { name: 'Alt 2', value: [75, 30, 100] },
                        { name: 'Alt 3', value: [65, 20, 85] }
                    ],
                    symbolSize: (data) => data[2] / 3,
                    itemStyle: {
                        color: this.theme.color[3],
                        opacity: 0.6
                    }
                }
            ]
        };

        chart.setOption(option);
        this.charts.set(containerId, chart);

        window.addEventListener('resize', () => {
            chart.resize();
        });

        return chart;
    }

    // Update chart data
    updateChart(containerId, newData) {
        const chart = this.charts.get(containerId);
        if (chart) {
            const option = chart.getOption();
            // Update series data
            if (newData.series) {
                option.series = newData.series;
            }
            if (newData.xAxis) {
                option.xAxis.data = newData.xAxis;
            }
            chart.setOption(option, true);
        }
    }

    // Resize all charts
    resizeAllCharts() {
        this.charts.forEach(chart => {
            chart.resize();
        });
    }

    // Dispose chart
    disposeChart(containerId) {
        const chart = this.charts.get(containerId);
        if (chart) {
            chart.dispose();
            this.charts.delete(containerId);
        }
    }

    // Dispose all charts
    disposeAllCharts() {
        this.charts.forEach((chart, containerId) => {
            chart.dispose();
        });
        this.charts.clear();
    }

    // Get chart instance
    getChart(containerId) {
        return this.charts.get(containerId);
    }

    // Check if chart exists
    hasChart(containerId) {
        return this.charts.has(containerId);
    }

    // Export chart as image
    exportChart(containerId, format = 'png') {
        const chart = this.charts.get(containerId);
        if (chart) {
            return chart.getDataURL({
                type: format,
                pixelRatio: 2,
                backgroundColor: '#1e293b'
            });
        }
        return null;
    }

    // Create responsive chart wrapper
    createResponsiveChart(containerId, chartType, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        // Add responsive container class
        container.classList.add('chart-responsive');

        let chart;
        switch (chartType) {
            case 'nutrition':
                chart = this.createNutritionChart(containerId, data);
                break;
            case 'weekly':
                chart = this.createWeeklyChart(containerId, data);
                break;
            case 'health':
                chart = this.createHealthMetricsChart(containerId, data);
                break;
            case 'analytics':
                chart = this.createRecipeAnalyticsChart(containerId, data);
                break;
            case 'mealplan':
                chart = this.createMealPlanChart(containerId, data);
                break;
            default:
                console.error(`Unknown chart type: ${chartType}`);
                return null;
        }

        // Add intersection observer for lazy loading
        if (options.lazyLoad) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && chart) {
                        chart.resize();
                        observer.unobserve(entry.target);
                    }
                });
            });
            observer.observe(container);
        }

        return chart;
    }
}

// Initialize chart manager
const chartManager = new ChartManager();

// Export for global use
window.chartManager = chartManager;

// Add CSS for responsive charts
const chartCSS = `
.chart-responsive {
    width: 100%;
    height: 400px;
    min-height: 300px;
}

@media (max-width: 768px) {
    .chart-responsive {
        height: 300px;
        min-height: 250px;
    }
}

.chart-container {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    box-shadow: var(--shadow-medium);
    border: 1px solid var(--border-color);
}

.chart-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
    color: var(--text-secondary);
}
`;

// Inject CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = chartCSS;
document.head.appendChild(styleSheet);

console.log('Chart Manager loaded successfully');