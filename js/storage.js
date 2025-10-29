/**
 * Storage Manager Module
 * Handles localStorage operations for wallet history and cached data
 */

class StorageManager {
    constructor() {
        this.STORAGE_PREFIX = 'qubic_tracker_';
        this.WALLETS_KEY = `${this.STORAGE_PREFIX}wallets`;
        this.CACHE_KEY = `${this.STORAGE_PREFIX}cache`;
        this.SETTINGS_KEY = `${this.STORAGE_PREFIX}settings`;
        this.MAX_WALLETS = 10;
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get all saved wallets
     */
    getWallets() {
        try {
            const data = localStorage.getItem(this.WALLETS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading wallets:', error);
            return [];
        }
    }

    /**
     * Save a wallet to history
     */
    addWallet(address) {
        if (!address || typeof address !== 'string') {
            throw new Error('Invalid wallet address');
        }

        const wallets = this.getWallets();
        
        // Remove if already exists (to update timestamp)
        const filtered = wallets.filter(w => w.address !== address);
        
        // Add to beginning
        filtered.unshift({
            address: address,
            addedAt: new Date().toISOString(),
            lastAccessed: new Date().toISOString()
        });
        
        // Keep only MAX_WALLETS
        const trimmed = filtered.slice(0, this.MAX_WALLETS);
        
        try {
            localStorage.setItem(this.WALLETS_KEY, JSON.stringify(trimmed));
            return true;
        } catch (error) {
            console.error('Error saving wallet:', error);
            return false;
        }
    }

    /**
     * Update wallet last accessed time
     */
    updateWalletAccess(address) {
        const wallets = this.getWallets();
        const wallet = wallets.find(w => w.address === address);
        
        if (wallet) {
            wallet.lastAccessed = new Date().toISOString();
            try {
                localStorage.setItem(this.WALLETS_KEY, JSON.stringify(wallets));
            } catch (error) {
                console.error('Error updating wallet access:', error);
            }
        }
    }

    /**
     * Remove a wallet from history
     */
    removeWallet(address) {
        const wallets = this.getWallets();
        const filtered = wallets.filter(w => w.address !== address);
        
        try {
            localStorage.setItem(this.WALLETS_KEY, JSON.stringify(filtered));
            return true;
        } catch (error) {
            console.error('Error removing wallet:', error);
            return false;
        }
    }

    /**
     * Clear all wallets
     */
    clearWallets() {
        try {
            localStorage.removeItem(this.WALLETS_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing wallets:', error);
            return false;
        }
    }

    /**
     * Cache portfolio data
     */
    cachePortfolioData(wallet, data) {
        if (!wallet || !data) return;

        try {
            const cache = this.getCache();
            cache[wallet] = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
        } catch (error) {
            console.error('Error caching portfolio data:', error);
        }
    }

    /**
     * Get cached portfolio data
     */
    getCachedPortfolioData(wallet) {
        try {
            const cache = this.getCache();
            const cached = cache[wallet];
            
            if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
                return cached.data;
            }
            
            // Remove expired cache
            if (cached) {
                delete cache[wallet];
                localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
            }
            
            return null;
        } catch (error) {
            console.error('Error reading cached data:', error);
            return null;
        }
    }

    /**
     * Get all cache
     */
    getCache() {
        try {
            const data = localStorage.getItem(this.CACHE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error reading cache:', error);
            return {};
        }
    }

    /**
     * Clear all cache
     */
    clearCache() {
        try {
            localStorage.removeItem(this.CACHE_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing cache:', error);
            return false;
        }
    }

    /**
     * Get settings
     */
    getSettings() {
        try {
            const data = localStorage.getItem(this.SETTINGS_KEY);
            return data ? JSON.parse(data) : {
                autoRefresh: true,
                refreshInterval: 30000, // 30 seconds
                theme: 'light',
                compactView: false
            };
        } catch (error) {
            console.error('Error reading settings:', error);
            return {};
        }
    }

    /**
     * Save settings
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    /**
     * Get storage size info
     */
    getStorageInfo() {
        let totalSize = 0;
        const breakdown = {};

        for (const key in localStorage) {
            if (key.startsWith(this.STORAGE_PREFIX)) {
                const size = localStorage[key].length;
                totalSize += size;
                breakdown[key] = size;
            }
        }

        return {
            totalSize,
            breakdown,
            walletCount: this.getWallets().length,
            cacheCount: Object.keys(this.getCache()).length
        };
    }

    /**
     * Clear all data
     */
    clearAll() {
        const keys = [];
        for (const key in localStorage) {
            if (key.startsWith(this.STORAGE_PREFIX)) {
                keys.push(key);
            }
        }

        keys.forEach(key => localStorage.removeItem(key));
        return true;
    }

    /**
     * Export data
     */
    exportData() {
        const data = {
            wallets: this.getWallets(),
            settings: this.getSettings(),
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };

        return JSON.stringify(data, null, 2);
    }

    /**
     * Import data
     */
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (data.wallets && Array.isArray(data.wallets)) {
                localStorage.setItem(this.WALLETS_KEY, JSON.stringify(data.wallets));
            }
            
            if (data.settings) {
                localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(data.settings));
            }
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}

// Create and export singleton instance
const storage = new StorageManager();

// For compatibility
window.StorageManager = storage;