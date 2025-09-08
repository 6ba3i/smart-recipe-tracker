/**
 * ECharts Configuration for Dark Theme
 * Creates interactive charts for nutrition, health, and meal planning data
 */

class ChartManager {
    constructor() {
        this.charts = {};
        this.darkTheme = {
            backgroundColor: 'transparent',
            textStyle: {
                color: '#f8fafc'
            },
            title: {
                textStyle: {
                    color: '#f8fafc'
                }
            },
            legend: {
                textStyle: {
                    color: '#cbd5e1'
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
        
        this.colorPalette = {
            primary: '#6366f1',
            secondary: '#8b5cf6',
            accent: '#06b6d4',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#3b82f6'
        };
        
        this.gradientColors = [
            ['#6366f1', '#8b5cf6'],
            ['#10b981', '#06b6d4'],
            ['#f59e0b', '#ef4444'],
            ['#3b82f6', '#6366f1']
        ];
        
        this.initializeCharts();
    }

    initializeCharts() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Set up resize listener
        window.addEventListener('resize', () => this.resizeAll());
    }

    // Create gradient for charts
    createGradient(chart, colors) {
        return {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
                { offset: 0, color: colors[0] },
                { offset: 1, color: colors[1] }
            ]
        };
    }

    // Nutrition Dashboard Charts
    createNutritionPieChart() {
        const container = document.getElementById('nutritionChart');
        if (!container) return;

        const chart = echarts.init(container, 'dark');
        
        const option = {
            ...this.darkTheme,
            title: {
                text: 'Daily Macronutrients',
                left: 'center',
                textStyle: {
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#f8fafc'
                }
            },
            tooltip: {
                trigger: 'item',
                backgroundColor: '#1e293b',
                borderColor: '#475569',
                textStyle: {
                    color: '#f8fafc'
                },
                formatter: function(params) {
                    return `${params.name}<br/>
                            Amount: ${params.value}g<br/>
                            Percentage: ${params.percent}%<br/>
                            Calories: ${params.data.calories || 0} cal`;
                }
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                top: 'center',
                textStyle: {
                    color: '#cbd5e1'
                }
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
                            fontSize: '18',
                            fontWeight: 'bold',
                            color: '#f8fafc'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: [
                        { 
                            value: 0, 
                            name: 'Protein', 
                            calories: 0,
                            itemStyle: { 
                                color: this.createGradient(chart, ['#3b82f6', '#6366f1'])
                            } 
                        },
                        { 
                            value: 0, 
                            name: 'Carbs', 
                            calories: 0,
                            itemStyle: { 
                                color: this.createGradient(chart, ['#10b981', '#06b6d4'])
                            } 
                        },
                        { 
                            value: 0, 
                            name: 'Fat', 
                            calories: 0,
                            itemStyle: { 
                                color: this.createGradient(chart, ['#f59e0b', '#ef4444'])
                            } 
                        },
                        { 
                            value: 0, 
                            name: 'Fiber', 
                            calories: 0,
                            itemStyle: { 
                                color: this.createGradient(chart, ['#8b5cf6', '#d946ef'])
                            } 
                        }
                    ],
                    animationType: 'scale',
                    animationEasing: 'elasticOut',
                    animationDelay: function (idx) {
                        return Math.random() * 200;
                    }
                }
            ]
        };

        chart.setOption(option);
        this.charts.nutritionPie = chart;
        return chart;
    }

    createNutritionTrendChart() {
        const container = document.getElementById('weeklyTrendChart');
        if (!container) return;

        const chart = echarts.init(container, 'dark');
        
        const option = {
            ...this.darkTheme,
            title: {
                text: 'Weekly Nutrition Trends',
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#f8fafc'
                }
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#1e293b',
                borderColor: '#475569',
                textStyle: {
                    color: '#f8fafc'
                },
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6366f1'
                    }
                }
            },
            legend: {
                data: ['Calories', 'Protein', 'Carbs', 'Fat'],
                top: 30,
                textStyle: {
                    color: '#cbd5e1'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
                borderColor: '#475569'
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                axisLine: {
                    lineStyle: {
                        color: '#475569'
                    }
                },
                axisLabel: {
                    color: '#cbd5e1'
                }
            },
            yAxis: {
                type: 'value',
                axisLine: {
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
            series: [
                {
                    name: 'Calories',
                    type: 'line',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    smooth: true,
                    lineStyle: {
                        width: 3,
                        color: this.colorPalette.primary
                    },
                    areaStyle: {
                        color: this.createGradient(chart, [this.colorPalette.primary + '40', this.colorPalette.primary + '10'])
                    }
                },
                {
                    name: 'Protein',
                    type: 'line',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    smooth: true,
                    lineStyle: {
                        width: 2,
                        color: this.colorPalette.info
                    }
                },
                {
                    name: 'Carbs',
                    type: 'line',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    smooth: true,
                    lineStyle: {
                        width: 2,
                        color: this.colorPalette.success
                    }
                },
                {
                    name: 'Fat',
                    type: 'line',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    smooth: true,
                    lineStyle: {
                        width: 2,
                        color: this.colorPalette.warning
                    }
                }
            ],
            animation: true,
            animationDuration: 2000,
            animationEasing: 'quadraticOut'
        };

        chart.setOption(option);
        this.charts.nutritionTrend = chart;
        return chart;
    }

    // Health Tracking Charts
    createHealthProgressChart() {
        const container = document.getElementById('healthProgressChart');
        if (!container) return;

        const chart = echarts.init(container, 'dark');
        
        const option = {
            ...this.darkTheme,
            title: {
                text: 'Health Metrics Progress',
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#f8fafc'
                }
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#1e293b',
                borderColor: '#475569',
                textStyle: {
                    color: '#f8fafc'
                }
            },
            legend: {
                data: ['Weight (lbs)', 'Energy Level', 'Sleep Hours', 'Exercise (min)'],
                top: 30,
                textStyle: {
                    color: '#cbd5e1'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
                borderColor: '#475569'
            },
            xAxis: {
                type: 'category',
                data: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                axisLine: {
                    lineStyle: {
                        color: '#475569'
                    }
                },
                axisLabel: {
                    color: '#cbd5e1'
                }
            },
            yAxis: [
                {
                    type: 'value',
                    name: 'Weight (lbs)',
                    position: 'left',
                    axisLine: {
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
                {
                    type: 'value',
                    name: 'Score/Minutes',
                    position: 'right',
                    axisLine: {
                        lineStyle: {
                            color: '#475569'
                        }
                    },
                    axisLabel: {
                        color: '#cbd5e1'
                    },
                    splitLine: {
                        show: false
                    }
                }
            ],
            series: [
                {
                    name: 'Weight (lbs)',
                    type: 'line',
                    yAxisIndex: 0,
                    data: [],
                    lineStyle: {
                        width: 3,
                        color: this.colorPalette.danger
                    },
                    smooth: true,
                    markLine: {
                        data: [
                            { type: 'average', name: 'Average' }
                        ]
                    }
                },
                {
                    name: 'Energy Level',
                    type: 'line',
                    yAxisIndex: 1,
                    data: [],
                    lineStyle: {
                        color: this.colorPalette.warning
                    },
                    smooth: true
                },
                {
                    name: 'Sleep Hours',
                    type: 'line',
                    yAxisIndex: 1,
                    data: [],
                    lineStyle: {
                        color: this.colorPalette.info
                    },
                    smooth: true
                },
                {
                    name: 'Exercise (min)',
                    type: 'bar',
                    yAxisIndex: 1,
                    data: [],
                    itemStyle: {
                        color: this.createGradient(chart, [this.colorPalette.success, this.colorPalette.accent])
                    },
                    opacity: 0.8
                }
            ],
            animation: true,
            animationDuration: 2000
        };

        chart.setOption(option);
        this.charts.healthProgress = chart;
        return chart;
    }

    // Weekly Nutrition Balance Radar Chart
    createWeeklyNutritionChart() {
        const container = document.getElementById('weeklyNutritionChart');
        if (!container) return;

        const chart = echarts.init(container, 'dark');
        
        const option = {
            ...this.darkTheme,
            title: {
                text: 'Weekly Nutrition Balance',
                textStyle: {
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#f8fafc'
                }
            },
            tooltip: {
                trigger: 'item',
                backgroundColor: '#1e293b',
                borderColor: '#475569',
                textStyle: {
                    color: '#f8fafc'
                }
            },
            radar: {
                indicator: [
                    { name: 'Protein', max: 100 },
                    { name: 'Carbs', max: 100 },
                    { name: 'Fat', max: 100 },
                    { name: 'Fiber', max: 100 },
                    { name: 'Vitamins', max: 100 },
                    { name: 'Minerals', max: 100 }
                ],
                shape: 'polygon',
                splitNumber: 4,
                axisName: {
                    color: '#cbd5e1',
                    fontSize: 12
                },
                splitLine: {
                    lineStyle: {
                        color: '#334155'
                    }
                },
                splitArea: {
                    show: true,
                    areaStyle: {
                        color: ['rgba(99, 102, 241, 0.05)', 'rgba(99, 102, 241, 0.1)']
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: '#475569'
                    }
                }
            },
            series: [
                {
                    name: 'Nutrition Balance',
                    type: 'radar',
                    data: [
                        {
                            value: [0, 0, 0, 0, 0, 0],
                            name: 'Current Week',
                            areaStyle: {
                                color: this.colorPalette.primary + '30'
                            },
                            lineStyle: {
                                color: this.colorPalette.primary,
                                width: 2
                            },
                            itemStyle: {
                                color: this.colorPalette.primary
                            }
                        },
                        {
                            value: [80, 85, 85, 85, 80, 85],
                            name: 'Target',
                            areaStyle: {
                                color: this.colorPalette.success + '20'
                            },
                            lineStyle: {
                                color: this.colorPalette.success,
                                width: 1,
                                type: 'dashed'
                            },
                            itemStyle: {
                                color: this.colorPalette.success
                            }
                        }
                    ]
                }
            ]
        };

        chart.setOption(option);
        this.charts.weeklyNutrition = chart;
        return chart;
    }

    // Shopping Summary Chart
    createShoppingSummaryChart() {
        const container = document.getElementById('shoppingSummaryChart');
        if (!container) return;

        const chart = echarts.init(container, 'dark');
        
        const option = {
            ...this.darkTheme,
            title: {
                text: 'Shopping Summary',
                textStyle: {
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#f8fafc'
                }
            },
            tooltip: {
                trigger: 'item',
                backgroundColor: '#1e293b',
                borderColor: '#475569',
                textStyle: {
                    color: '#f8fafc'
                },
                formatter: '{a} <br/>{b}: ${c} ({d}%)'
            },
            series: [
                {
                    name: 'Shopping Categories',
                    type: 'pie',
                    radius: '70%',
                    data: [
                        { 
                            value: 45, 
                            name: 'Produce',
                            itemStyle: { 
                                color: this.createGradient(chart, [this.colorPalette.success, this.colorPalette.accent])
                            }
                        },
                        { 
                            value: 35, 
                            name: 'Proteins',
                            itemStyle: { 
                                color: this.createGradient(chart, [this.colorPalette.info, this.colorPalette.primary])
                            }
                        },
                        { 
                            value: 25, 
                            name: 'Pantry',
                            itemStyle: { 
                                color: this.createGradient(chart, [this.colorPalette.warning, this.colorPalette.danger])
                            }
                        },
                        { 
                            value: 15, 
                            name: 'Dairy',
                            itemStyle: { 
                                color: this.createGradient(chart, [this.colorPalette.secondary, '#d946ef'])
                            }
                        }
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    label: {
                        color: '#f8fafc',
                        formatter: '{b}\n${c}'
                    }
                }
            ]
        };

        chart.setOption(option);
        this.charts.shoppingSummary = chart;
        return chart;
    }

    // Update chart data methods
    updateNutritionChart(data) {
        if (this.charts.nutritionPie) {
            const option = {
                series: [{
                    data: [
                        { 
                            value: data.protein || 0, 
                            name: 'Protein', 
                            calories: (data.protein || 0) * 4 
                        },
                        { 
                            value: data.carbs || 0, 
                            name: 'Carbs', 
                            calories: (data.carbs || 0) * 4 
                        },
                        { 
                            value: data.fat || 0, 
                            name: 'Fat', 
                            calories: (data.fat || 0) * 9 
                        },
                        { 
                            value: data.fiber || 0, 
                            name: 'Fiber', 
                            calories: 0 
                        }
                    ]
                }]
            };
            this.charts.nutritionPie.setOption(option);
        }
    }

    updateTrendChart(weeklyData) {
        if (this.charts.nutritionTrend && weeklyData) {
            const option = {
                series: [
                    {
                        data: weeklyData.calories || [0, 0, 0, 0, 0, 0, 0]
                    },
                    {
                        data: weeklyData.protein || [0, 0, 0, 0, 0, 0, 0]
                    },
                    {
                        data: weeklyData.carbs || [0, 0, 0, 0, 0, 0, 0]
                    },
                    {
                        data: weeklyData.fat || [0, 0, 0, 0, 0, 0, 0]
                    }
                ]
            };
            this.charts.nutritionTrend.setOption(option);
        }
    }

    updateHealthChart(data) {
        if (this.charts.healthProgress && data) {
            const option = {
                xAxis: {
                    data: data.dates || ['Week 1', 'Week 2', 'Week 3', 'Week 4']
                },
                series: [
                    {
                        data: data.weight || []
                    },
                    {
                        data: data.energy || []
                    },
                    {
                        data: data.sleep || []
                    },
                    {
                        data: data.exercise || []
                    }
                ]
            };
            this.charts.healthProgress.setOption(option);
        }
    }

    updateWeeklyNutritionChart(data) {
        if (this.charts.weeklyNutrition && data) {
            const option = {
                series: [{
                    data: [
                        {
                            value: data.current || [0, 0, 0, 0, 0, 0],
                            name: 'Current Week'
                        },
                        {
                            value: [80, 85, 85, 85, 80, 85],
                            name: 'Target'
                        }
                    ]
                }]
            };
            this.charts.weeklyNutrition.setOption(option);
        }
    }

    // Create Recipe Nutrition Analysis Chart
    createRecipeNutritionChart() {
        const container = document.getElementById('recipeNutritionChart');
        if (!container) return;

        const chart = echarts.init(container, 'dark');
        
        const option = {
            ...this.darkTheme,
            tooltip: {
                trigger: 'item',
                backgroundColor: '#1e293b',
                borderColor: '#475569',
                textStyle: {
                    color: '#f8fafc'
                },
                formatter: '{a} <br/>{b}: {c}g ({d}%)'
            },
            series: [
                {
                    name: 'Recipe Nutrition',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '60%'],
                    data: [
                        { 
                            value: 0, 
                            name: 'Protein', 
                            itemStyle: { color: this.colorPalette.info } 
                        },
                        { 
                            value: 0, 
                            name: 'Carbs', 
                            itemStyle: { color: this.colorPalette.success } 
                        },
                        { 
                            value: 0, 
                            name: 'Fat', 
                            itemStyle: { color: this.colorPalette.warning } 
                        },
                        { 
                            value: 0, 
                            name: 'Fiber', 
                            itemStyle: { color: this.colorPalette.secondary } 
                        }
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    label: {
                        formatter: '{b}\n{c}g',
                        color: '#f8fafc'
                    }
                }
            ]
        };

        chart.setOption(option);
        this.charts.recipeNutrition = chart;
        return chart;
    }

    updateRecipeNutritionChart(nutrition) {
        if (this.charts.recipeNutrition && nutrition) {
            const option = {
                series: [{
                    data: [
                        { value: nutrition.protein || 0, name: 'Protein' },
                        { value: nutrition.carbs || 0, name: 'Carbs' },
                        { value: nutrition.fat || 0, name: 'Fat' },
                        { value: nutrition.fiber || 0, name: 'Fiber' }
                    ]
                }]
            };
            this.charts.recipeNutrition.setOption(option);
        }
    }

    // Utility methods
    resizeAll() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                setTimeout(() => chart.resize(), 100);
            }
        });
    }

    dispose() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.dispose === 'function') {
                chart.dispose();
            }
        });
        this.charts = {};
    }

    // Get chart instance
    getChart(name) {
        return this.charts[name];
    }

    // Set chart theme
    setTheme(themeName) {
        Object.entries(this.charts).forEach(([name, chart]) => {
            if (chart) {
                // Recreate chart with new theme
                const container = chart.getDom();
                chart.dispose();
                this.charts[name] = echarts.init(container, themeName);
            }
        });
    }
}

// Initialize chart manager
const chartManager = new ChartManager();

// Export for global use
window.chartManager = chartManager;

// Helper functions for easy chart creation
window.initNutritionCharts = function() {
    chartManager.createNutritionPieChart();
    chartManager.createNutritionTrendChart();
};

window.initHealthCharts = function() {
    chartManager.createHealthProgressChart();
};

window.initMealPlanningCharts = function() {
    chartManager.createWeeklyNutritionChart();
};

window.initShoppingCharts = function() {
    chartManager.createShoppingSummaryChart();
};

// Update functions for real-time data
window.updateNutritionDisplay = function(nutritionData) {
    if (nutritionData) {
        chartManager.updateNutritionChart(nutritionData);
        chartManager.updateTrendChart(nutritionData.weekly);
    }
};

window.updateHealthDisplay = function(healthData) {
    if (healthData) {
        chartManager.updateHealthChart(healthData);
    }
};

window.updateWeeklyNutrition = function(data) {
    chartManager.updateWeeklyNutritionChart(data);
};

console.log('Charts manager loaded with dark theme');