# Qubic Portfolio Tracker

A web app I built to track my Qubic cryptocurrency portfolio. Got tired of manually checking wallet balances, so I made this to do it automatically. Works great on desktop and mobile.

![Qubic Portfolio Tracker](https://img.shields.io/badge/Qubic-Portfolio%20Tracker-667eea?style=for-the-badge)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Ready-48bb78?style=for-the-badge)
![Mobile Responsive](https://img.shields.io/badge/Mobile-Responsive-38b2ac?style=for-the-badge)

## What it does

Track your Qubic (QU) wallets and see:
- Current balance and all your tokens (CFB, GARTH, CODED, etc.)
- Transaction history with smart analytics
- Portfolio insights and risk analysis  
- Asset distribution charts
- Trading patterns and network activity

**Features that actually matter:**
- Multi-wallet support (track as many as you want)
- Auto-refreshes every 30 seconds
- Works offline with smart caching
- Mobile-friendly design
- All data stays in your browser (zero servers involved)
- Real portfolio analytics (diversity scores, risk warnings)
- Copy-paste wallet addresses easily

## Quick start

**Use it right now:** [your-username.github.io/qubic-portfolio-tracker](https://your-username.github.io/qubic-portfolio-tracker)

Or run it locally:
```bash
git clone https://github.com/your-username/qubic-portfolio-tracker.git
cd qubic-portfolio-tracker
python3 -m http.server 8000
# Open http://localhost:8000
```

## How to use it

1. Enter your Qubic wallet address (those long 60-character ones)
2. Hit "Add Wallet" and watch it load your data
3. Switch between Portfolio, Transactions, and Analytics tabs
4. App remembers your recent wallets and auto-refreshes every 30 seconds

**Pro tip:** Bookmark with your wallet in the URL: `?wallet=YOURWALLETADDRESS`

## Privacy & Security

**What we store:** Just your wallet addresses in your browser's localStorage  
**What we don't store:** Private keys, personal info, nothing on our servers  
**What we send:** Only read-only API calls to get public blockchain data  
**Bottom line:** This is safer than most crypto apps because there's no backend

Your wallet addresses are public on the blockchain anyway, so no privacy concerns there.

## Deployment

### GitHub Pages (easiest)
1. Fork this repo
2. Go to Settings → Pages  
3. Select "Deploy from branch" → main
4. Done! Your app is live

### Other hosts
Works on Vercel, Netlify, or any static host. Just upload the files.

## Technical stuff

- Pure HTML/CSS/JavaScript (no frameworks)
- Connects directly to Qubic's public API at rpc.qubic.org
- Chart.js for the pretty graphs
- localStorage for your wallet history
- GitHub Pages ready (just push and deploy)

## Contributing

Found a bug? Have an idea? Open an issue or send a PR. I'm pretty responsive.

Some ideas for improvements:
- Price tracking (when Qubic gets on exchanges)
- Export to CSV  
- More chart types
- Dark mode

## Browser support

Works on anything modern from the last 3 years. Chrome, Firefox, Safari, Edge, mobile browsers.

## Known issues

- Transaction data limited to what the API returns (usually last ~100)
- No price data yet (because Qubic isn't on major exchanges)

## License

MIT - do whatever you want with it.

## Disclaimers

This is a hobby project. Not financial advice. The Qubic team didn't make this.

If you find it useful, star the repo or tell someone about it. That's all the payment I need.

---

Built with ☕ and frustration at manually checking wallet balances.
