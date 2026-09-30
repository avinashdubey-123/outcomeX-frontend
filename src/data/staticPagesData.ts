// src/data/staticPagesData.ts
// Content for all static pages reachable via /page/:slug
// Edit sections here — StaticPage.tsx renders whatever is here automatically.

export interface StaticSection {
  heading: string
  content: string[] // each string = one paragraph
}

export interface StaticPageData {
  title: string
  subtitle: string
  sections: StaticSection[]
}

// keyed by slug — must match footerData.ts slugs exactly
export const STATIC_PAGES: Record<string, StaticPageData> = {
  "how-it-works": {
    title: "How It Works",
    subtitle: "Learn how prediction markets work on OutcomeX",
    sections: [
      {
        heading: "What is a Prediction Market?",
        content: [
          "A prediction market is a platform where people can trade on the outcomes of future events. Prices reflect the collective wisdom of all traders — the higher the price of a YES share, the more likely the crowd thinks the event will happen.",
          "On OutcomeX, every market resolves to either YES or NO. If you believe an event will happen, you buy YES shares. If you believe it won't, you buy NO shares. When the market resolves, winning shares pay out $1.00 each and losing shares pay $0.00.",
        ],
      },
      {
        heading: "Trading YES and NO Shares",
        content: [
          "Each market has two types of shares — YES and NO. The price of each share reflects the probability of that outcome, ranging from 1¢ to 99¢. If YES is trading at 65¢, the market believes there is a 65% chance the event occurs.",
          "You can buy or sell shares at any time before the market resolves. If you bought YES at 40¢ and the price rises to 70¢, you can sell your shares for a profit without waiting for resolution.",
        ],
      },
      {
        heading: "How Markets Resolve",
        content: [
          "Each market has a designated resolution source — typically a trusted news outlet, official government data, or a verified public statement. Once the outcome is known, the market resolves and winning shares are paid out.",
          "After resolution, holders of winning shares can redeem them for $1.00 USDC each by calling the smart contract. This process is called redemption and happens on the Polygon blockchain.",
        ],
      },
      {
        heading: "Fees",
        content: [
          "OutcomeX charges a 2% fee on all trades. This fee is built into the order and collected automatically by the smart contract at the time of the trade.",
          "There are no additional fees for depositing, withdrawing, or redeeming resolved positions.",
        ],
      },
    ],
  },

  "market-rules": {
    title: "Market Rules",
    subtitle: "Guidelines for how markets are created and resolved",
    sections: [
      {
        heading: "Market Creation",
        content: [
          "Markets on OutcomeX are created around specific, verifiable questions with clear resolution criteria. Each market must have a defined resolution date and a primary resolution source.",
          "Markets must be binary — they resolve either YES or NO. Multi-outcome markets are not supported on this platform.",
        ],
      },
      {
        heading: "Resolution Criteria",
        content: [
          "Every market has explicit resolution criteria stated at the time of creation. These criteria define exactly what must happen for the market to resolve YES.",
          "If the resolution criteria are ambiguous or the primary source is unavailable, the market may use secondary sources or be delayed. In rare cases of complete ambiguity, markets may be resolved as N/A and all positions refunded.",
        ],
      },
      {
        heading: "Resolution Sources",
        content: [
          "Resolution sources are specified in the market description and typically include major news outlets such as Associated Press, Reuters, BBC News, or official government and institutional data.",
          "In the event of conflicting reports, the market will wait for official confirmation before resolving. Early resolution is possible if the outcome is unambiguous and confirmed by the primary source.",
        ],
      },
      {
        heading: "Disputes",
        content: [
          "If you believe a market has been resolved incorrectly, you may submit a dispute within 48 hours of resolution. Disputes are reviewed by the OutcomeX team and resolved based on the stated resolution criteria.",
          "All resolution decisions are final once the dispute period has passed and funds have been distributed.",
        ],
      },
    ],
  },

  "rewards-program": {
    title: "Rewards Program",
    subtitle: "Earn XP and climb the leaderboard",
    sections: [
      {
        heading: "How Rewards Work",
        content: [
          "The OutcomeX Rewards Program lets you earn XP (experience points) by trading, achieving milestones, and maintaining accuracy. XP contributes to your level and leaderboard ranking.",
          "Rewards are automatically tracked and updated in real time. You can view your current progress in the Rewards section of your profile.",
        ],
      },
      {
        heading: "Earning XP",
        content: [
          "XP is earned through a variety of activities including placing trades, achieving win streaks, reaching volume milestones, and completing special challenges.",
          "Bonus XP is awarded for particularly accurate predictions — the higher the difficulty of the market and the larger your position, the more XP you can earn.",
        ],
      },
      {
        heading: "Levels and Leaderboard",
        content: [
          "As you accumulate XP, you progress through levels. Higher levels unlock profile badges and increase your visibility on the leaderboard.",
          "The global leaderboard ranks all traders by profit, win rate, and trading volume. Leaderboard rankings are updated daily.",
        ],
      },
    ],
  },

  help: {
    title: "Help Center",
    subtitle: "Answers to common questions",
    sections: [
      {
        heading: "Getting Started",
        content: [
          "To start trading on OutcomeX, connect a wallet using MetaMask or sign in with your email via Magic Link. You will need USDC on the Polygon network to place trades.",
          "If you don't have USDC, you can deposit funds directly through the Deposit button in the top navigation bar. Magic wallet users can purchase USDC with a credit card. MetaMask users should transfer USDC from an exchange.",
        ],
      },
      {
        heading: "Deposits and Withdrawals",
        content: [
          "Deposits are processed on the Polygon Amoy testnet for this simulation. Send USDC to your wallet address shown in the deposit modal.",
          "Withdrawals work by transferring USDC from your trading wallet back to any external wallet or exchange. Withdrawal transactions are processed on-chain and typically confirm within 30 seconds.",
        ],
      },
      {
        heading: "Placing Trades",
        content: [
          "To place a trade, navigate to any market and select whether you want to buy YES or NO shares. You can place Market orders (immediate fill at current price) or Limit orders (fill only at your specified price).",
          "All orders require you to sign a message with your wallet. This signature is free (no gas) and authorizes the trade. USDC is only deducted when your order is matched and filled by the exchange.",
        ],
      },
      {
        heading: "Redeeming Winnings",
        content: [
          "When a market resolves, navigate to your Portfolio and find the resolved position. If your prediction was correct, a green Redeem button will appear. Click it and confirm the transaction in your wallet.",
          "Redemption sends $1.00 USDC per winning share to your wallet. This is an on-chain transaction and requires a small amount of POL (MATIC) for gas fees.",
        ],
      },
      {
        heading: "Contact Support",
        content: [
          "For issues not covered here, join our Discord community where the team and community members can help. You can also reach us at support@OutcomeX.com.",
          "For urgent issues related to funds or security, email security@OutcomeX.com directly.",
        ],
      },
    ],
  },
}
