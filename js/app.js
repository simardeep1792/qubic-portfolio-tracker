/**
 * Main Application Module
 * Handles UI interactions and orchestrates the application
 */

class QubicPortfolioApp {
    constructor() {
        this.currentWallet = null;
        this.portfolioData = null;
        this.transactions = [];
        this.assets = [];
        this.refreshInterval = null;
        this.isLoading = false;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.setupEventListeners();
        this.loadRecentWallets();
        this.loadSettings();
        this.checkUrlParams();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Wallet input
        const walletInput = document.getElementById('wallet-input');
        const addWalletBtn = document.getElementById('add-wallet-btn');
        
        walletInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addWallet();
            }
        });
        
        addWalletBtn.addEventListener('click', () => this.addWallet());

        // Recent wallets dropdown
        const recentWalletsBtn = document.getElementById('recent-wallets-btn');
        const dropdown = document.getElementById('recent-wallets-dropdown');
        
        recentWalletsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
            this.loadRecentWallets();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });

        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Clear history button
        document.getElementById('clear-history-btn').addEventListener('click', () => {
            this.clearWalletHistory();
        });

        // Copy wallet button
        document.getElementById('copy-wallet-btn').addEventListener('click', () => {
            this.copyWalletAddress();
        });

        // Tab navigation
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Refresh buttons
        document.getElementById('refresh-all-btn').addEventListener('click', () => {
            this.loadAllData();
        });

        document.getElementById('refresh-tx-btn').addEventListener('click', () => {
            this.loadTransactions();
        });

        // Transaction filter
        document.getElementById('tx-filter').addEventListener('change', (e) => {
            this.filterTransactions(e.target.value);
        });
    }

    /**
     * Add wallet from input
     */
    addWallet() {
        const input = document.getElementById('wallet-input');
        const wallet = input.value.trim();
        
        if (!wallet) {
            this.showToast('Please enter a wallet address', 'error');
            return;
        }

        if (wallet.length < 50) {
            this.showToast('Invalid wallet address format', 'error');
            return;
        }

        // Save to history
        storage.addWallet(wallet);
        
        // Set as current wallet
        this.setCurrentWallet(wallet);
        
        // Clear input
        input.value = '';
        
        // Close dropdown
        document.getElementById('recent-wallets-dropdown').classList.remove('show');
    }

    /**
     * Set current wallet and load data
     */
    async setCurrentWallet(wallet) {
        if (this.currentWallet === wallet) return;
        
        this.currentWallet = wallet;
        storage.updateWalletAccess(wallet);
        
        // Update UI
        this.updateWalletDisplay();
        document.getElementById('wallet-info').style.display = 'flex';
        document.getElementById('main-content').style.display = 'block';
        document.getElementById('empty-state').style.display = 'none';
        
        // Load data
        await this.loadAllData();
        
        // Start auto-refresh
        this.startAutoRefresh();
    }

    /**
     * Update wallet display
     */
    updateWalletDisplay() {
        const walletAddress = document.getElementById('wallet-address');
        if (this.currentWallet) {
            walletAddress.textContent = 
                this.currentWallet.substring(0, 10) + '...' + 
                this.currentWallet.substring(this.currentWallet.length - 10);
        }
    }

    /**
     * Load recent wallets
     */
    loadRecentWallets() {
        const wallets = storage.getWallets();
        const walletList = document.getElementById('wallet-list');
        const walletCount = document.getElementById('wallet-count');
        
        walletCount.textContent = wallets.length;
        
        if (wallets.length === 0) {
            walletList.innerHTML = `
                <div class="empty-state">
                    <p>No recent wallets</p>
                </div>
            `;
            return;
        }

        walletList.innerHTML = wallets.map(wallet => `
            <div class="wallet-item" data-wallet="${wallet.address}">
                <div class="wallet-item-info">
                    <div class="wallet-item-address">
                        ${wallet.address.substring(0, 20)}...${wallet.address.substring(wallet.address.length - 20)}
                    </div>
                    <div class="wallet-item-time">
                        Last used: ${this.formatTimeAgo(wallet.lastAccessed)}
                    </div>
                </div>
                <div class="wallet-item-actions">
                    <button class="icon-btn" onclick="app.selectWallet('${wallet.address}')" title="Select wallet">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </button>
                    <button class="icon-btn" onclick="app.removeWallet('${wallet.address}')" title="Remove wallet">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Select wallet from history
     */
    selectWallet(wallet) {
        this.setCurrentWallet(wallet);
        document.getElementById('recent-wallets-dropdown').classList.remove('show');
    }

    /**
     * Remove wallet from history
     */
    removeWallet(wallet) {
        storage.removeWallet(wallet);
        this.loadRecentWallets();
        this.showToast('Wallet removed from history', 'success');
        
        // If it was the current wallet, clear the view
        if (this.currentWallet === wallet) {
            this.clearCurrentWallet();
        }
    }

    /**
     * Clear wallet history
     */
    clearWalletHistory() {
        if (confirm('Are you sure you want to clear all wallet history?')) {
            storage.clearWallets();
            this.loadRecentWallets();
            this.showToast('Wallet history cleared', 'success');
            this.clearCurrentWallet();
        }
    }

    /**
     * Clear current wallet
     */
    clearCurrentWallet() {
        this.currentWallet = null;
        this.stopAutoRefresh();
        document.getElementById('wallet-info').style.display = 'none';
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('empty-state').style.display = 'block';
    }

    /**
     * Copy wallet address
     */
    async copyWalletAddress() {
        if (!this.currentWallet) return;

        try {
            await navigator.clipboard.writeText(this.currentWallet);
            this.showToast('Wallet address copied!', 'success');
        } catch (error) {
            this.showToast('Failed to copy address', 'error');
        }
    }

    /**
     * Load all data
     */
    async loadAllData() {
        if (!this.currentWallet || this.isLoading) return;
        
        this.isLoading = true;
        this.updateRefreshIndicator(true);

        try {
            // Check cache first
            const cached = storage.getCachedPortfolioData(this.currentWallet);
            if (cached) {
                this.updatePortfolioDisplay(cached);
            }

            // Load fresh data
            const [balance, assets, networkStatus] = await Promise.all([
                qubicAPI.getBalance(this.currentWallet),
                qubicAPI.getAssets(this.currentWallet),
                qubicAPI.getNetworkStatus()
            ]);

            const portfolioData = {
                balance,
                assets,
                networkStatus,
                wallet: this.currentWallet
            };

            this.portfolioData = portfolioData;
            this.assets = assets;
            
            // Update cache
            storage.cachePortfolioData(this.currentWallet, portfolioData);
            
            // Update UI
            this.updatePortfolioDisplay(portfolioData);
            this.updateNetworkStatus(networkStatus);
            this.updateTimestamp();

            // Load transactions if tab is active
            const activeTab = document.querySelector('.tab-pane.active').id;
            if (activeTab === 'transactions-tab') {
                await this.loadTransactions();
            }

        } catch (error) {
            console.error('Error loading data:', error);
            this.showToast('Failed to load portfolio data', 'error');
        } finally {
            this.isLoading = false;
            this.updateRefreshIndicator(false);
        }
    }

    /**
     * Load transactions
     */
    async loadTransactions() {
        if (!this.currentWallet) return;

        try {
            const transactions = await qubicAPI.getTransactions(this.currentWallet);
            this.transactions = transactions;
            this.displayTransactions(transactions);
            this.updateAnalytics(transactions);
        } catch (error) {
            console.error('Error loading transactions:', error);
            this.showToast('Failed to load transactions', 'error');
        }
    }

    /**
     * Update portfolio display
     */
    updatePortfolioDisplay(data) {
        // Update balance
        const balanceEl = document.getElementById('qu-balance');
        balanceEl.innerHTML = `${(data.balance || 0).toLocaleString()} <span style="font-size: 16px;">QU</span>`;
        balanceEl.classList.remove('skeleton');

        // Update asset count
        const assetCountEl = document.getElementById('asset-count');
        assetCountEl.textContent = data.assets.length;
        assetCountEl.classList.remove('skeleton');

        // Update assets grid
        const assetsGrid = document.getElementById('assets-grid');
        if (data.assets.length === 0) {
            assetsGrid.innerHTML = '<div class="empty-state">No assets found</div>';
        } else {
            assetsGrid.innerHTML = data.assets.map(asset => `
                <div class="asset-item" onclick="app.showAssetDetails('${asset.name}', ${asset.amount})">
                    <div class="asset-header">
                        <span class="asset-name">${asset.name}</span>
                        <span class="asset-amount">${asset.amount.toLocaleString()}</span>
                    </div>
                    <div style="font-size: 12px; color: var(--gray-500);">Click for details</div>
                </div>
            `).join('');
        }
    }

    /**
     * Display transactions
     */
    displayTransactions(transactions) {
        const container = document.getElementById('transactions-container');
        
        if (transactions.length === 0) {
            container.innerHTML = '<div class="empty-state">No transactions found</div>';
            return;
        }

        const stats = this.calculateTransactionStats(transactions);
        
        container.innerHTML = `
            <div class="transaction-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div class="stat-card" style="background: var(--gray-50); padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 18px; font-weight: bold; color: var(--success);">${stats.incoming}</div>
                    <div style="font-size: 12px; color: var(--gray-500);">Incoming</div>
                </div>
                <div class="stat-card" style="background: var(--gray-50); padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 18px; font-weight: bold; color: var(--warning);">${stats.outgoing}</div>
                    <div style="font-size: 12px; color: var(--gray-500);">Outgoing</div>
                </div>
                <div class="stat-card" style="background: var(--gray-50); padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 18px; font-weight: bold; color: var(--primary);">${stats.totalReceived.toLocaleString()}</div>
                    <div style="font-size: 12px; color: var(--gray-500);">Total Received (QU)</div>
                </div>
                <div class="stat-card" style="background: var(--gray-50); padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 18px; font-weight: bold; color: var(--primary);">${stats.totalSent.toLocaleString()}</div>
                    <div style="font-size: 12px; color: var(--gray-500);">Total Sent (QU)</div>
                </div>
            </div>
            
            <div style="overflow-x: auto;">
                <table class="transaction-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Amount (QU)</th>
                            <th>Counterparty</th>
                            <th>Tick</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.map(tx => `
                            <tr>
                                <td data-label="Type" class="${tx.type === 'incoming' ? 'tx-incoming' : 'tx-outgoing'}">
                                    <strong>${tx.type === 'incoming' ? '↓ IN' : '↑ OUT'}</strong>
                                </td>
                                <td data-label="Amount" style="font-weight: bold;">
                                    ${tx.type === 'incoming' ? '+' : '-'}${tx.amount.toLocaleString()} QU
                                </td>
                                <td data-label="Counterparty" style="font-family: monospace; font-size: 11px;">
                                    ${this.truncateAddress(tx.type === 'incoming' ? tx.sourceId : tx.destId)}
                                </td>
                                <td data-label="Tick">${tx.tick.toLocaleString()}</td>
                                <td data-label="Status">
                                    <span style="display: inline-flex; align-items: center; gap: 4px;">
                                        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${tx.moneyFlew ? 'var(--success)' : 'var(--danger)'};"></span>
                                        <span style="font-size: 12px;">${tx.moneyFlew ? 'Success' : 'Failed'}</span>
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Calculate transaction statistics
     */
    calculateTransactionStats(transactions) {
        return {
            incoming: transactions.filter(tx => tx.type === 'incoming').length,
            outgoing: transactions.filter(tx => tx.type === 'outgoing').length,
            totalReceived: transactions
                .filter(tx => tx.type === 'incoming')
                .reduce((sum, tx) => sum + tx.amount, 0),
            totalSent: transactions
                .filter(tx => tx.type === 'outgoing')
                .reduce((sum, tx) => sum + tx.amount, 0)
        };
    }

    /**
     * Filter transactions
     */
    filterTransactions(filter) {
        if (!this.transactions.length) return;

        let filtered = this.transactions;
        if (filter !== 'all') {
            filtered = this.transactions.filter(tx => tx.type === filter);
        }

        this.displayTransactions(filtered);
    }

    /**
     * Update analytics
     */
    updateAnalytics(transactions) {
        const stats = this.calculateTransactionStats(transactions);
        
        document.getElementById('total-transactions').textContent = transactions.length;
        document.getElementById('incoming-count').textContent = stats.incoming;
        document.getElementById('outgoing-count').textContent = stats.outgoing;

        // Create charts
        const chartContainer = document.getElementById('portfolio-chart');
        
        if (this.assets.length > 0) {
            chartContainer.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; height: 300px;">
                    <div>
                        <h4 style="margin-bottom: 15px;">Transaction Flow</h4>
                        <canvas id="flowChart" style="max-height: 250px;"></canvas>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 15px;">Asset Distribution</h4>
                        <canvas id="assetDistributionChart" style="max-height: 250px;"></canvas>
                    </div>
                </div>
                <div style="margin-top: 40px;">
                    <h4 style="margin-bottom: 15px;">Balance Timeline</h4>
                    <div style="height: 300px;">
                        <canvas id="balanceChart"></canvas>
                    </div>
                </div>
            `;

            // Create charts after DOM update
            setTimeout(() => {
                chartManager.createFlowChart(transactions);
                chartManager.createAssetDistributionChart(this.assets);
                chartManager.createBalanceChart(transactions, this.portfolioData.balance);
            }, 100);
        } else {
            chartContainer.innerHTML = '<div class="empty-state">No data to analyze</div>';
        }
    }

    /**
     * Show asset details
     */
    showAssetDetails(assetName, amount) {
        this.switchTab('assets');
        
        const detailsContainer = document.getElementById('asset-details');
        const assetInfo = this.getAssetInfo(assetName);
        
        detailsContainer.innerHTML = `
            <div style="max-width: 800px;">
                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px;">
                    <div style="width: 60px; height: 60px; background: ${assetInfo.color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">
                        ${assetName.substring(0, 2)}
                    </div>
                    <div>
                        <h2 style="margin: 0; color: var(--gray-700);">${assetName}</h2>
                        <p style="margin: 5px 0 0 0; color: var(--gray-500);">${assetInfo.description}</p>
                    </div>
                </div>
                
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <div class="analytics-value">${amount.toLocaleString()}</div>
                        <div class="analytics-label">Your Holdings</div>
                    </div>
                    <div class="analytics-card">
                        <div class="analytics-value">${assetInfo.type}</div>
                        <div class="analytics-label">Asset Type</div>
                    </div>
                </div>
                
                <div style="margin-top: 30px;">
                    <button class="btn" onclick="app.switchTab('portfolio')">
                        ← Back to Portfolio
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Get asset information
     */
    getAssetInfo(assetName) {
        const assetDatabase = {
            'CFB': { description: 'Come-from-Beyond Token', type: 'Utility', color: '#667eea' },
            'QCAP': { description: 'Qubic Capital Token', type: 'Governance', color: '#764ba2' },
            'GARTH': { description: 'GARTH Community Token', type: 'Community', color: '#48bb78' },
            'MATILDA': { description: 'MATILDA Protocol Token', type: 'Protocol', color: '#ed8936' },
            'CODED': { description: 'CODED Development Token', type: 'Development', color: '#f56565' },
            'QMINE': { description: 'Qubic Mining Token', type: 'Mining', color: '#9f7aea' },
            'QXTRADE': { description: 'Qubic Exchange Token', type: 'Exchange', color: '#38b2ac' },
            'QDRAW': { description: 'Qubic Draw Token', type: 'Lottery', color: '#ed64a6' },
            'RL': { description: 'Random Lottery Token', type: 'Collectible', color: '#805ad5' }
        };

        return assetDatabase[assetName] || {
            description: 'Qubic Network Token',
            type: 'Token',
            color: '#718096'
        };
    }

    /**
     * Switch tabs
     */
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tabName}-tab`);
        });

        // Load data if needed
        if (tabName === 'transactions' && this.transactions.length === 0) {
            this.loadTransactions();
        } else if (tabName === 'analytics' && this.transactions.length === 0) {
            this.loadTransactions();
        }
    }

    /**
     * Update network status display
     */
    updateNetworkStatus(status) {
        const networkText = document.getElementById('network-text');
        const currentTick = document.getElementById('current-tick');
        
        networkText.textContent = `Tick: ${status.currentTick.toLocaleString()} | Epoch: ${status.epoch}`;
        currentTick.textContent = status.currentTick.toLocaleString();
    }

    /**
     * Update refresh indicator
     */
    updateRefreshIndicator(isLoading) {
        const indicator = document.getElementById('refresh-indicator');
        const dot = indicator.querySelector('.refresh-dot');
        const text = indicator.querySelector('.refresh-text');
        
        if (isLoading) {
            dot.style.background = '#ed8936';
            text.textContent = 'Updating...';
        } else {
            dot.style.background = '#48bb78';
            text.textContent = 'Live';
        }
    }

    /**
     * Start auto refresh
     */
    startAutoRefresh() {
        const settings = storage.getSettings();
        if (!settings.autoRefresh) return;

        this.stopAutoRefresh();
        this.refreshInterval = setInterval(() => {
            this.loadAllData();
        }, settings.refreshInterval);
    }

    /**
     * Stop auto refresh
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * Load settings
     */
    loadSettings() {
        const settings = storage.getSettings();
        // Apply settings as needed
    }

    /**
     * Check URL parameters
     */
    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const wallet = urlParams.get('wallet');
        
        if (wallet) {
            this.setCurrentWallet(wallet);
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${type === 'success' ? '<polyline points="20 6 9 17 4 12"/>' : 
                  type === 'error' ? '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>' :
                  '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'}
            </svg>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Format time ago
     */
    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    }

    /**
     * Truncate address
     */
    truncateAddress(address) {
        if (!address || address === 'Unknown') return address;
        return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
    }

    /**
     * Update timestamp
     */
    updateTimestamp() {
        const now = new Date().toLocaleString();
        document.getElementById('last-update').textContent = `Last updated: ${now}`;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new QubicPortfolioApp();
});