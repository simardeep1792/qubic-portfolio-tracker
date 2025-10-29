# Qubic Portfolio Tracker

A modern, responsive web application for tracking Qubic cryptocurrency portfolios. Built as a static site that can be hosted on GitHub Pages with no backend required.

![Qubic Portfolio Tracker](https://img.shields.io/badge/Qubic-Portfolio%20Tracker-667eea?style=for-the-badge)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Ready-48bb78?style=for-the-badge)
![Mobile Responsive](https://img.shields.io/badge/Mobile-Responsive-38b2ac?style=for-the-badge)

## Features

### 🎯 Core Features
- **Multi-Wallet Support**: Track multiple Qubic wallet addresses
- **Persistent History**: Stores up to 10 recent wallets in localStorage
- **Real-time Updates**: Auto-refresh every 30 seconds
- **Offline Support**: Cached data available when offline
- **Mobile Responsive**: Works perfectly on all devices

### 📊 Portfolio Features
- **Balance Display**: View your QU balance in real-time
- **Asset Holdings**: Track all your Qubic tokens (CFB, GARTH, etc.)
- **Transaction History**: See incoming/outgoing transactions
- **Analytics Dashboard**: Visualize portfolio distribution with charts
- **Network Status**: Monitor current tick and epoch

### 💻 Technical Features
- **100% Static**: No backend required - runs entirely in the browser
- **GitHub Pages Ready**: Deploy instantly with zero configuration
- **API Integration**: Direct connection to Qubic RPC endpoints
- **LocalStorage**: Wallet history and preferences saved locally
- **Chart.js Integration**: Beautiful, interactive charts

## Quick Start

### Option 1: Use Hosted Version
Visit the live app at: `https://[your-username].github.io/qubic-portfolio-tracker`

### Option 2: Run Locally
```bash
# Clone the repository
git clone https://github.com/[your-username]/qubic-portfolio-tracker.git

# Navigate to the project
cd qubic-portfolio-tracker

# Open in browser (or use any local server)
open index.html

# Or with Python
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Deployment

### Deploy to GitHub Pages

1. **Fork or Clone this Repository**
   ```bash
   git clone https://github.com/[your-username]/qubic-portfolio-tracker.git
   cd qubic-portfolio-tracker
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)
   - Click Save

4. **Access Your App**
   - Your app will be available at:
   - `https://[your-username].github.io/qubic-portfolio-tracker`

### Custom Domain (Optional)
1. Add a `CNAME` file with your domain
2. Configure DNS settings with your domain provider

## Usage

### Adding a Wallet
1. Enter a Qubic wallet address in the input field
2. Click "Add Wallet" or press Enter
3. The wallet is saved to your history automatically

### Managing Wallets
- **Switch Wallets**: Click "Recent Wallets" and select from history
- **Remove Wallet**: Click the X button next to any wallet
- **Clear History**: Click "Clear All" in the Recent Wallets dropdown

### Viewing Portfolio
- **Portfolio Tab**: See balance and all token holdings
- **Transactions Tab**: View transaction history with filters
- **Analytics Tab**: Visualize portfolio distribution
- **Asset Details**: Click any asset for detailed information

### Sharing
Share your portfolio with others using URL parameters:
```
https://[your-site]/qubic-portfolio-tracker?wallet=YOUR_WALLET_ADDRESS
```

## Architecture

### File Structure
```
qubic-portfolio-tracker/
├── index.html          # Main application HTML
├── css/
│   └── styles.css      # All styles (mobile-responsive)
├── js/
│   ├── app.js          # Main application logic
│   ├── api.js          # Qubic API client
│   ├── storage.js      # LocalStorage manager
│   └── charts.js       # Chart configurations
└── README.md           # This file
```

### Key Components

#### API Client (`js/api.js`)
- Direct integration with `rpc.qubic.org`
- Automatic retry logic with exponential backoff
- Response caching for performance

#### Storage Manager (`js/storage.js`)
- Wallet history management (max 10 wallets)
- Portfolio data caching (5-minute TTL)
- Settings persistence
- Import/export functionality

#### Chart Manager (`js/charts.js`)
- Balance timeline visualization
- Transaction flow charts
- Asset distribution pie charts
- Responsive chart sizing

#### Main App (`js/app.js`)
- UI state management
- Event handling
- Auto-refresh logic
- Toast notifications

## Development

### Prerequisites
- Modern web browser
- Text editor
- Local web server (optional)

### Local Development
```bash
# Install a simple HTTP server (if needed)
npm install -g http-server

# Run the server
http-server -p 8080

# Visit http://localhost:8080
```

### Making Changes
1. Edit files directly - no build process required
2. Refresh browser to see changes
3. Test on mobile using browser dev tools

### API Endpoints Used
- Balance: `GET https://rpc.qubic.org/v1/balances/{wallet}`
- Assets: `GET https://rpc.qubic.org/v1/assets/{wallet}/owned`
- Transactions: `GET https://rpc.qubic.org/v2/identities/{wallet}/transfers`
- Network Status: `GET https://rpc.qubic.org/v1/status`

## Security & Privacy

- **No Backend**: All data stays in your browser
- **No Analytics**: Zero tracking or data collection
- **Read-Only**: Can only view data, cannot make transactions
- **Local Storage**: Wallet addresses stored only in your browser
- **HTTPS Only**: Secure API connections

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers
- ⚠️ Internet Explorer (not supported)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

### Contribution Ideas
- [ ] Add CSV export functionality
- [ ] Implement price tracking
- [ ] Add more chart types
- [ ] Create a PWA manifest
- [ ] Add language translations
- [ ] Implement WebSocket updates

## Testing

### Manual Testing Checklist
- [ ] Add new wallet address
- [ ] Switch between wallets
- [ ] Remove wallet from history
- [ ] View all tabs
- [ ] Test on mobile device
- [ ] Test offline behavior
- [ ] Verify auto-refresh
- [ ] Check chart interactions

### Browser Testing
Test on multiple browsers and devices:
- Desktop: Chrome, Firefox, Safari
- Mobile: iOS Safari, Chrome Android
- Different screen sizes

## Troubleshooting

### Common Issues

**Wallet not loading?**
- Check internet connection
- Verify wallet address is correct
- Check browser console for errors

**Charts not displaying?**
- Ensure JavaScript is enabled
- Check for browser extensions blocking scripts
- Try refreshing the page

**Data not updating?**
- Auto-refresh runs every 30 seconds
- Click "Refresh All Data" for immediate update
- Check network status indicator

## Future Enhancements

### Planned Features
- **Price Integration**: Show QU/USD values
- **PWA Support**: Install as mobile app
- **Export Options**: CSV/PDF reports
- **WebSocket Updates**: Real-time data
- **Multi-language**: i18n support

### Technical Improvements
- Service Worker for offline support
- IndexedDB for larger data storage
- WebAssembly for performance
- Lazy loading for assets

## License

MIT License - feel free to use this project for any purpose.

## Acknowledgments

- Qubic Network for the RPC API
- Chart.js for visualization library
- GitHub Pages for free hosting

---

**Note**: This is an unofficial community project and is not affiliated with the Qubic Network team.

For issues and feature requests, please use the [GitHub Issues](https://github.com/[your-username]/qubic-portfolio-tracker/issues) page.