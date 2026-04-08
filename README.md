# United Credit Card Calculator

A tool to compare United Airlines credit cards (Gateway, Explorer, Quest, Club Infinite) based on your actual spending and travel patterns.

## Local Development

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

### Option A: Automatic (GitHub Actions)

1. Create a new GitHub repo named `united-card-calculator`
2. Push this folder to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/united-card-calculator.git
   git push -u origin main
   ```
3. Go to **Settings → Pages → Source** and select **GitHub Actions**
4. The workflow will build and deploy automatically on every push
5. Your site will be live at `https://YOUR_USERNAME.github.io/united-card-calculator/`

### Option B: Manual (`gh-pages` branch)

```bash
npm install
npm run build
npm run deploy
```

Then in your repo's **Settings → Pages**, set the source to the `gh-pages` branch.

## Customization

- Edit `vite.config.js` and change the `base` path if your repo has a different name
- Mile valuation, bag costs, and lounge values can be adjusted in `src/App.jsx`
