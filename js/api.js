/**
 * Qubic API Client Module
 * Handles all API interactions with the Qubic RPC endpoints
 * 
 * SECURITY NOTE: This only makes READ-ONLY calls to public blockchain data.
 * No private keys, no signing, no transactions - just reading public info.
 */

class QubicAPI {
    constructor() {
        this.baseUrl = 'https://rpc.qubic.org';
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 seconds
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
    }

    /**
     * Fetch with retry logic and caching
     */
    async fetchWithRetry(url, options = {}) {
        const cacheKey = `${url}${JSON.stringify(options)}`;
        
        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        let lastError;
        for (let i = 0; i < this.retryAttempts; i++) {
            try {
                const response = await fetch(url, {
                    ...options,
                    headers: {
                        'Accept': 'application/json',
                        ...options.headers
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                // Cache successful response
                this.cache.set(cacheKey, {
                    data,
                    timestamp: Date.now()
                });

                return data;
            } catch (error) {
                lastError = error;
                if (i < this.retryAttempts - 1) {
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
                }
            }
        }

        throw lastError;
    }

    /**
     * Get wallet balance
     */
    async getBalance(wallet) {
        if (!wallet) {
            throw new Error('Wallet address is required');
        }

        try {
            const data = await this.fetchWithRetry(`${this.baseUrl}/v1/balances/${wallet}`);
            return data.balance?.balance || 0;
        } catch (error) {
            console.error('Error fetching balance:', error);
            throw new Error(`Failed to fetch balance: ${error.message}`);
        }
    }

    /**
     * Get wallet assets
     */
    async getAssets(wallet) {
        if (!wallet) {
            throw new Error('Wallet address is required');
        }

        try {
            const data = await this.fetchWithRetry(`${this.baseUrl}/v1/assets/${wallet}/owned`);
            
            const assets = [];
            if (data.ownedAssets && Array.isArray(data.ownedAssets)) {
                for (const asset of data.ownedAssets) {
                    const assetData = asset.data || {};
                    const issuedAsset = assetData.issuedAsset || {};
                    
                    if (issuedAsset.name) {
                        assets.push({
                            name: issuedAsset.name,
                            amount: parseInt(assetData.numberOfUnits || 0)
                        });
                    }
                }
            }
            
            return assets;
        } catch (error) {
            console.error('Error fetching assets:', error);
            throw new Error(`Failed to fetch assets: ${error.message}`);
        }
    }

    /**
     * Get transaction history
     */
    async getTransactions(wallet, limit = 100) {
        if (!wallet) {
            throw new Error('Wallet address is required');
        }

        try {
            const data = await this.fetchWithRetry(`${this.baseUrl}/v2/identities/${wallet}/transfers`);
            
            const transactions = [];
            if (data.transactions && Array.isArray(data.transactions)) {
                for (const tickData of data.transactions) {
                    const tickNumber = tickData.tickNumber || 0;
                    const tickTransactions = tickData.transactions || [];
                    
                    for (const txWrapper of tickTransactions) {
                        const tx = txWrapper.transaction || {};
                        
                        transactions.push({
                            id: tx.id || `tx_${tickNumber}_${transactions.length}`,
                            sourceId: tx.sourceId || 'Unknown',
                            destId: tx.destId || 'Unknown',
                            amount: parseInt(tx.amount || 0),
                            tick: tickNumber,
                            timestamp: `Tick ${tickNumber}`,
                            type: tx.destId === wallet ? 'incoming' : 'outgoing',
                            moneyFlew: tx.moneyFlew !== false
                        });
                        
                        if (transactions.length >= limit) {
                            return transactions;
                        }
                    }
                }
            }
            
            return transactions;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw new Error(`Failed to fetch transactions: ${error.message}`);
        }
    }

    /**
     * Get network status
     */
    async getNetworkStatus() {
        try {
            const data = await this.fetchWithRetry(`${this.baseUrl}/v1/status`);
            
            return {
                currentTick: data.lastProcessedTick?.tickNumber || 0,
                epoch: data.epoch || 0,
                lastUpdate: data.lastProcessedTick?.timestamp || new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching network status:', error);
            throw new Error(`Failed to fetch network status: ${error.message}`);
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Set cache timeout
     */
    setCacheTimeout(timeout) {
        this.cacheTimeout = timeout;
    }
}

// Create and export singleton instance
const qubicAPI = new QubicAPI();

// For compatibility with existing code
window.QubicAPI = qubicAPI;