/**
 * Advanced Analytics Module
 * Provides sophisticated portfolio analysis and insights
 */

class AdvancedAnalytics {
    constructor() {
        this.portfolioData = null;
        this.transactions = [];
        this.assets = [];
        this.timeframes = {
            '7d': 7,
            '30d': 30,
            '90d': 90,
            'all': null
        };
        this.currentTimeframe = '30d';
    }

    /**
     * Set data for analysis
     */
    setData(portfolioData, transactions, assets) {
        this.portfolioData = portfolioData;
        this.transactions = transactions || [];
        this.assets = assets || [];
    }

    /**
     * Calculate portfolio diversity score (0-100)
     */
    calculateDiversityScore() {
        if (!this.assets || this.assets.length === 0) return 0;
        
        const totalAssets = this.assets.reduce((sum, asset) => sum + asset.amount, 0);
        if (totalAssets === 0) return 0;

        // Calculate Herfindahl-Hirschman Index
        const hhi = this.assets.reduce((sum, asset) => {
            const share = asset.amount / totalAssets;
            return sum + (share * share);
        }, 0);

        // Convert to diversity score (inverted and scaled 0-100)
        const diversityScore = Math.max(0, Math.min(100, (1 - hhi) * 100));
        return Math.round(diversityScore);
    }

    /**
     * Calculate portfolio concentration risk
     */
    calculateConcentrationRisk() {
        if (!this.assets || this.assets.length === 0) return { level: 'Unknown', percentage: 0 };
        
        const totalAssets = this.assets.reduce((sum, asset) => sum + asset.amount, 0);
        const sortedAssets = this.assets.sort((a, b) => b.amount - a.amount);
        
        // Top asset concentration
        const topAssetPercentage = totalAssets > 0 ? (sortedAssets[0].amount / totalAssets) * 100 : 0;
        
        let riskLevel;
        if (topAssetPercentage > 70) riskLevel = 'High';
        else if (topAssetPercentage > 50) riskLevel = 'Medium';
        else if (topAssetPercentage > 30) riskLevel = 'Low';
        else riskLevel = 'Very Low';

        return {
            level: riskLevel,
            percentage: Math.round(topAssetPercentage),
            topAsset: sortedAssets[0]?.name || 'None'
        };
    }

    /**
     * Analyze transaction patterns
     */
    analyzeTransactionPatterns() {
        if (!this.transactions || this.transactions.length === 0) {
            return {
                averageAmount: 0,
                frequency: 0,
                pattern: 'Insufficient data',
                peakHours: [],
                topCounterparties: []
            };
        }

        // Average transaction amount
        const avgAmount = this.transactions.reduce((sum, tx) => sum + tx.amount, 0) / this.transactions.length;

        // Transaction frequency (transactions per day)
        const daySpan = this.getDaySpan();
        const frequency = daySpan > 0 ? this.transactions.length / daySpan : 0;

        // Activity pattern
        let pattern = 'Low Activity';
        if (frequency > 5) pattern = 'High Activity';
        else if (frequency > 2) pattern = 'Moderate Activity';
        else if (frequency > 0.5) pattern = 'Low Activity';

        // Top counterparties
        const counterparties = {};
        this.transactions.forEach(tx => {
            const counterparty = tx.type === 'incoming' ? tx.sourceId : tx.destId;
            if (counterparty && counterparty !== 'Unknown') {
                counterparties[counterparty] = (counterparties[counterparty] || 0) + 1;
            }
        });

        const topCounterparties = Object.entries(counterparties)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([address, count]) => ({
                address: this.truncateAddress(address),
                transactions: count
            }));

        return {
            averageAmount: Math.round(avgAmount),
            frequency: Math.round(frequency * 10) / 10,
            pattern,
            topCounterparties
        };
    }

    /**
     * Calculate asset performance metrics
     */
    calculateAssetPerformance() {
        if (!this.assets || this.assets.length === 0) return [];

        return this.assets.map(asset => {
            // Calculate relative performance metrics
            const relatedTxs = this.transactions.filter(tx => 
                tx.sourceId === asset.name || tx.destId === asset.name
            );

            const incomingTxs = relatedTxs.filter(tx => tx.type === 'incoming');
            const outgoingTxs = relatedTxs.filter(tx => tx.type === 'outgoing');

            return {
                name: asset.name,
                amount: asset.amount,
                incomingCount: incomingTxs.length,
                outgoingCount: outgoingTxs.length,
                netFlow: incomingTxs.length - outgoingTxs.length,
                activity: relatedTxs.length,
                trend: this.calculateAssetTrend(asset.name)
            };
        }).sort((a, b) => b.amount - a.amount);
    }

    /**
     * Calculate asset trend (simplified)
     */
    calculateAssetTrend(assetName) {
        const recentTxs = this.transactions
            .filter(tx => tx.sourceId === assetName || tx.destId === assetName)
            .slice(-10); // Last 10 transactions

        if (recentTxs.length < 3) return 'stable';

        const incomingRecent = recentTxs.filter(tx => tx.type === 'incoming').length;
        const outgoingRecent = recentTxs.filter(tx => tx.type === 'outgoing').length;

        if (incomingRecent > outgoingRecent * 1.5) return 'increasing';
        if (outgoingRecent > incomingRecent * 1.5) return 'decreasing';
        return 'stable';
    }

    /**
     * Analyze network activity
     */
    analyzeNetworkActivity() {
        if (!this.transactions || this.transactions.length === 0) {
            return {
                tickRange: { min: 0, max: 0 },
                tickSpan: 0,
                averageTicksPerTx: 0,
                networkUtilization: 'Unknown'
            };
        }

        const ticks = this.transactions.map(tx => tx.tick).filter(tick => tick > 0);
        if (ticks.length === 0) {
            return {
                tickRange: { min: 0, max: 0 },
                tickSpan: 0,
                averageTicksPerTx: 0,
                networkUtilization: 'Unknown'
            };
        }

        const minTick = Math.min(...ticks);
        const maxTick = Math.max(...ticks);
        const tickSpan = maxTick - minTick;
        const averageTicksPerTx = tickSpan / this.transactions.length;

        let utilization = 'Low';
        if (averageTicksPerTx < 100) utilization = 'High';
        else if (averageTicksPerTx < 500) utilization = 'Medium';

        return {
            tickRange: { min: minTick, max: maxTick },
            tickSpan,
            averageTicksPerTx: Math.round(averageTicksPerTx),
            networkUtilization: utilization
        };
    }

    /**
     * Generate portfolio insights and recommendations
     */
    generateInsights() {
        const insights = [];
        const diversityScore = this.calculateDiversityScore();
        const concentrationRisk = this.calculateConcentrationRisk();
        const patterns = this.analyzeTransactionPatterns();

        // Diversity insights
        if (diversityScore < 30) {
            insights.push({
                type: 'warning',
                title: 'Low Portfolio Diversity',
                message: `Your portfolio diversity score is ${diversityScore}/100. Consider diversifying across more assets.`,
                action: 'Diversify holdings'
            });
        } else if (diversityScore > 70) {
            insights.push({
                type: 'success',
                title: 'Well Diversified Portfolio',
                message: `Excellent diversity score of ${diversityScore}/100. Your portfolio is well-balanced.`,
                action: 'Maintain balance'
            });
        }

        // Concentration risk insights
        if (concentrationRisk.level === 'High') {
            insights.push({
                type: 'warning',
                title: 'High Concentration Risk',
                message: `${concentrationRisk.percentage}% of your portfolio is in ${concentrationRisk.topAsset}. This increases risk.`,
                action: 'Consider rebalancing'
            });
        }

        // Activity insights
        if (patterns.frequency > 5) {
            insights.push({
                type: 'info',
                title: 'High Trading Activity',
                message: `You average ${patterns.frequency} transactions per day. Monitor transaction costs.`,
                action: 'Review trading strategy'
            });
        } else if (patterns.frequency < 0.1) {
            insights.push({
                type: 'info',
                title: 'Low Activity Portfolio',
                message: 'Your portfolio shows minimal activity. This could be a long-term holding strategy.',
                action: 'Consider periodic rebalancing'
            });
        }

        return insights;
    }

    /**
     * Calculate real balance timeline from transactions
     */
    calculateRealBalanceTimeline() {
        if (!this.transactions || this.transactions.length === 0) {
            return { labels: [], balances: [] };
        }

        // Sort transactions by tick
        const sortedTxs = [...this.transactions].sort((a, b) => a.tick - b.tick);
        const currentBalance = this.portfolioData?.balance || 0;
        
        // Work backwards from current balance
        let runningBalance = currentBalance;
        const dataPoints = [];
        
        // Add current point
        dataPoints.unshift({
            tick: sortedTxs[sortedTxs.length - 1]?.tick || 0,
            balance: currentBalance,
            date: new Date()
        });

        // Calculate historical balances
        for (let i = sortedTxs.length - 1; i >= 0; i--) {
            const tx = sortedTxs[i];
            
            // Reverse the transaction effect
            if (tx.type === 'incoming') {
                runningBalance -= tx.amount;
            } else {
                runningBalance += tx.amount;
            }
            
            // Add data point every few transactions or at significant changes
            if (i % 5 === 0 || Math.abs(tx.amount) > currentBalance * 0.1) {
                dataPoints.unshift({
                    tick: tx.tick,
                    balance: Math.max(0, runningBalance),
                    date: new Date(Date.now() - (sortedTxs.length - i) * 3600000) // Approximate timestamps
                });
            }
        }

        // Limit to last 20 points for chart readability
        const limitedData = dataPoints.slice(-20);
        
        return {
            labels: limitedData.map(point => point.date.toLocaleDateString()),
            balances: limitedData.map(point => point.balance),
            ticks: limitedData.map(point => point.tick)
        };
    }

    /**
     * Helper: Get day span of transactions
     */
    getDaySpan() {
        if (!this.transactions || this.transactions.length < 2) return 1;
        
        const ticks = this.transactions.map(tx => tx.tick).filter(tick => tick > 0);
        if (ticks.length < 2) return 1;
        
        const minTick = Math.min(...ticks);
        const maxTick = Math.max(...ticks);
        
        // Approximate: 1 day = ~8640 ticks (assuming 10 ticks per second)
        return Math.max(1, (maxTick - minTick) / 8640);
    }

    /**
     * Helper: Truncate address
     */
    truncateAddress(address) {
        if (!address || address === 'Unknown') return address;
        return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
    }

    /**
     * Get comprehensive analytics summary
     */
    getAnalyticsSummary() {
        return {
            diversity: this.calculateDiversityScore(),
            concentration: this.calculateConcentrationRisk(),
            patterns: this.analyzeTransactionPatterns(),
            performance: this.calculateAssetPerformance(),
            network: this.analyzeNetworkActivity(),
            insights: this.generateInsights(),
            timeline: this.calculateRealBalanceTimeline()
        };
    }
}

// Create and export singleton instance
const advancedAnalytics = new AdvancedAnalytics();

// For compatibility
window.AdvancedAnalytics = advancedAnalytics;