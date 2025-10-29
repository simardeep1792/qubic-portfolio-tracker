/**
 * Chart Configuration Module
 * Handles all Chart.js configurations and chart creation
 */

class ChartManager {
    constructor() {
        this.charts = new Map();
        this.defaultColors = [
            '#667eea', '#764ba2', '#48bb78', '#ed8936', 
            '#f56565', '#9f7aea', '#38b2ac', '#ed64a6',
            '#805ad5', '#d69e2e', '#e53e3e', '#38a169'
        ];
    }

    /**
     * Get or create a chart
     */
    getChart(canvasId, type, data, options) {
        // Destroy existing chart if it exists
        if (this.charts.has(canvasId)) {
            this.charts.get(canvasId).destroy();
        }

        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const chart = new Chart(ctx, {
            type,
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                ...options
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    /**
     * Create balance timeline chart
     */
    createBalanceChart(transactions, currentBalance) {
        const timelineData = this.generateTimelineData(transactions, currentBalance);
        
        return this.getChart('balanceChart', 'line', {
            labels: timelineData.labels,
            datasets: [{
                label: 'QU Balance',
                data: timelineData.balances,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        }, {
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: (value) => value.toLocaleString() + ' QU'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (context) => context.parsed.y.toLocaleString() + ' QU'
                    }
                }
            }
        });
    }

    /**
     * Create transaction flow chart
     */
    createFlowChart(transactions) {
        const incoming = transactions.filter(tx => tx.type === 'incoming').length;
        const outgoing = transactions.filter(tx => tx.type === 'outgoing').length;

        return this.getChart('flowChart', 'doughnut', {
            labels: ['Incoming', 'Outgoing'],
            datasets: [{
                data: [incoming, outgoing],
                backgroundColor: ['#48bb78', '#ed8936'],
                borderWidth: 0
            }]
        }, {
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        });
    }

    /**
     * Create asset distribution chart
     */
    createAssetDistributionChart(assets) {
        const sortedAssets = [...assets].sort((a, b) => b.amount - a.amount);
        const top10 = sortedAssets.slice(0, 10);
        const others = sortedAssets.slice(10);
        
        const labels = top10.map(a => a.name);
        const data = top10.map(a => a.amount);
        
        if (others.length > 0) {
            labels.push('Others');
            data.push(others.reduce((sum, a) => sum + a.amount, 0));
        }

        return this.getChart('assetDistributionChart', 'pie', {
            labels,
            datasets: [{
                data,
                backgroundColor: this.defaultColors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        }, {
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.label || '';
                            const value = context.parsed.toLocaleString();
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        });
    }

    /**
     * Create asset comparison chart
     */
    createComparisonChart(currentBalance, assets, selectedAssets) {
        const datasets = [{
            label: 'QU Balance',
            data: this.generateTrendData(currentBalance / 1000000, 30),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
            yAxisID: 'y'
        }];

        selectedAssets.forEach((assetName, index) => {
            const asset = assets.find(a => a.name === assetName);
            if (asset) {
                datasets.push({
                    label: assetName,
                    data: this.generateTrendData(asset.amount / 1000000, 30, index * 0.1),
                    borderColor: this.defaultColors[index + 1],
                    backgroundColor: `rgba(${this.hexToRgb(this.defaultColors[index + 1])}, 0.1)`,
                    tension: 0.4,
                    yAxisID: 'y1'
                });
            }
        });

        return this.getChart('comparisonChart', 'line', {
            labels: this.generateDateLabels(30),
            datasets
        }, {
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'QU (Millions)',
                        color: '#667eea'
                    },
                    ticks: {
                        color: '#667eea',
                        callback: (value) => value.toFixed(1) + 'M'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Assets (Millions)',
                        color: '#48bb78'
                    },
                    ticks: {
                        color: '#48bb78',
                        callback: (value) => value.toFixed(1) + 'M'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        });
    }

    /**
     * Generate timeline data from transactions
     */
    generateTimelineData(transactions, currentBalance) {
        const sortedTxs = [...transactions].sort((a, b) => a.tick - b.tick);
        const recentTxs = sortedTxs.slice(-20);
        
        const labels = [];
        const balances = [];
        let balance = currentBalance;

        // Work backwards to calculate historical balances
        for (let i = recentTxs.length - 1; i >= 0; i--) {
            const tx = recentTxs[i];
            const date = new Date(Date.now() - (recentTxs.length - i) * 86400000);
            
            labels.unshift(date.toLocaleDateString());
            balances.unshift(balance);
            
            // Reverse the transaction to get previous balance
            if (tx.type === 'incoming') {
                balance -= tx.amount;
            } else {
                balance += tx.amount;
            }
        }

        return { labels, balances };
    }

    /**
     * Generate trend data with some variation
     */
    generateTrendData(baseValue, days, offset = 0) {
        const data = [];
        for (let i = 0; i < days; i++) {
            const variation = Math.sin((i + offset) * 0.2) * 0.1 + (Math.random() * 0.05 - 0.025);
            data.push(Math.max(0, baseValue * (1 + variation)));
        }
        return data;
    }

    /**
     * Generate date labels
     */
    generateDateLabels(days) {
        const labels = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(Date.now() - i * 86400000);
            labels.push(date.toLocaleDateString());
        }
        return labels;
    }

    /**
     * Convert hex to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
            '0, 0, 0';
    }

    /**
     * Update chart data
     */
    updateChart(canvasId, newData) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.data = newData;
            chart.update();
        }
    }

    /**
     * Destroy a chart
     */
    destroyChart(canvasId) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.destroy();
            this.charts.delete(canvasId);
        }
    }

    /**
     * Destroy all charts
     */
    destroyAll() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }
}

// Create and export singleton instance
const chartManager = new ChartManager();

// For compatibility
window.ChartManager = chartManager;