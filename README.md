# ♠️ Kaachu Logs (Judgment Card Game Score Keeper)

A modern, fast, mobile-friendly **Offline Score Keeper** and automatic points calculator for playing **Kaachuful** (also known as *Judgment* / *Call Bridge*) card games offline with friends and family.

Live Web App: [https://chaishah.github.io/kaachulogs/](https://chaishah.github.io/kaachulogs/)

---

## 🌟 Key Features

- **⚡ Fast 1-Tap Round Logging:** Enter bids and log results with simple Pass/Fail toggle buttons or exact trick counters.
- **♠️ Gujarati Suit Rotation (KAACHUFUL):**
  - **K**ari (Spades ♠)
  - **C**hukat (Diamonds ♦)
  - **F**alli (Clubs ♣)
  - **L**al (Hearts ♥)
  - *No Trump (NT)* option
- **🃏 Automated Round & Dealer Tracking:** Auto-calculates card count progression (Up & Down, Descending, Ascending) and indicates current Dealer position.
- **🛡️ Dealer Hook Rule Validation:** Auto-detects and warns if the dealer bids a number that makes the total bids equal to total cards dealt.
- **📈 Real-Time Standings & Matrix:** Live leaderboards with winning streak indicators, rank badges, and a full round-by-round score matrix.
- **📱 100% Offline & PWA Supported:** Powered by Service Workers and `localStorage` state persistence. Never lose score data on browser refresh.
- **🎉 Victory Celebration:** Confetti animations and summary report for game winners.

---

## 🚀 Local Development

```bash
# 1. Clone repository
git clone https://github.com/chaishah/kaachulogs.git
cd kaachulogs

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Run tests
npm test

# 5. Build production bundle
npm run build
```

---

## 🌐 Deploying to GitHub Pages

This repository includes a pre-configured GitHub Actions workflow (`.github/workflows/deploy.yml`).

1. Push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Initial commit for Kaachu Logs"
   git branch -M main
   git remote add origin https://github.com/chaishah/kaachulogs.git
   git push -u origin main
   ```

2. Enable GitHub Pages in Repository Settings:
   - Navigate to **Settings** ➔ **Pages**
   - Under **Source**, select **GitHub Actions**

Your app will automatically build and publish to `https://chaishah.github.io/kaachulogs/`!

---

## 📜 Rules of Kaachuful

1. **Bidding:** Before cards are played in a round, each player bids how many tricks they will win.
2. **Dealer Hook:** The dealer cannot bid a number that makes `sum(all bids) == cards dealt`.
3. **Scoring:**
   - **Made Bid:** `10 + Bid` points.
   - **Missed Bid:** `0` points.
