// src/data/termsData.ts
// Edit this file to update terms and conditions content
// Replace mock content with real legal text when ready

export const TERMS_META = {
  lastUpdated: "March 20, 2026",
  effectiveDate: "January 1, 2026",
  version: "1.0",
  contactEmail: "legal@OutcomeX.com",
}

export interface TermsSection {
  id: string
  title: string
  content: string[] // each string = one paragraph
}

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: [
      'By accessing or using OutcomeX (the "Platform"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you may not access or use the Platform.',
      'We reserve the right to modify these Terms at any time. We will notify users of any material changes by updating the "Last Updated" date at the top of this page. Your continued use of the Platform after any changes constitutes your acceptance of the new Terms.',
      "These Terms apply to all visitors, users, and others who access or use the Platform.",
    ],
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    content: [
      "You must be at least 18 years of age to use this Platform. By using the Platform, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms.",
      "The Platform is not available to users in jurisdictions where prediction markets or similar activities are prohibited by law. It is your responsibility to ensure that your use of the Platform complies with all applicable laws and regulations in your jurisdiction.",
      "We reserve the right to refuse access to the Platform to any person for any reason at our sole discretion.",
    ],
  },
  {
    id: "platform",
    title: "3. Platform Description",
    content: [
      "OutcomeX is a decentralized prediction market platform that allows users to trade on the outcomes of real-world events using cryptocurrency. All trades are executed via smart contracts on the Polygon blockchain.",
      'The Platform is provided on an "as is" and "as available" basis. We do not guarantee the accuracy, completeness, or timeliness of any information on the Platform, including market prices and probabilities.',
      "Markets on the Platform are resolved based on publicly available information and the decisions of designated resolvers. Resolution decisions are final and binding.",
    ],
  },
  {
    id: "trading",
    title: "4. Trading and Financial Risk",
    content: [
      "Trading on prediction markets involves significant financial risk. You may lose some or all of your invested capital. You should not trade with funds you cannot afford to lose.",
      "Past performance of any market or trader is not indicative of future results. The Platform does not provide financial, investment, legal, or tax advice. All trading decisions are made solely at your own risk.",
      "You acknowledge that the value of prediction market shares can be highly volatile and can decrease to zero if your predicted outcome does not occur.",
      "We are not responsible for any financial losses incurred through the use of the Platform, including but not limited to losses resulting from market volatility, technical failures, or smart contract bugs.",
    ],
  },
  {
    id: "wallet",
    title: "5. Wallets and Funds",
    content: [
      "To use the Platform, you must connect a compatible cryptocurrency wallet. You are solely responsible for the security of your wallet and private keys. We do not have access to your private keys and cannot recover lost wallets or funds.",
      "All transactions on the Platform are irreversible once confirmed on the blockchain. You are responsible for ensuring the accuracy of all transaction details before confirming.",
      "We support USDC on the Polygon network as the primary collateral token. It is your responsibility to ensure you have sufficient funds and gas tokens (POL/MATIC) to execute transactions.",
    ],
  },
  {
    id: "prohibited",
    title: "6. Prohibited Activities",
    content: [
      "You agree not to engage in any of the following activities: market manipulation, wash trading, front-running, or any other activity intended to artificially influence market prices.",
      "You may not use the Platform for any illegal purpose, including but not limited to money laundering, fraud, or financing of terrorism.",
      "Automated trading bots or scripts are permitted only through our official API with prior written consent. Unauthorized scraping or automated access to the Platform is prohibited.",
      "You may not attempt to circumvent any security measures, access controls, or geographic restrictions implemented by the Platform.",
    ],
  },
  {
    id: "intellectual",
    title: "7. Intellectual Property",
    content: [
      "The Platform and its original content, features, and functionality are owned by OutcomeX and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.",
      "You are granted a limited, non-exclusive, non-transferable license to access and use the Platform for your personal, non-commercial use. You may not reproduce, distribute, modify, or create derivative works of any content without our express written permission.",
    ],
  },
  {
    id: "privacy",
    title: "8. Privacy",
    content: [
      "Your use of the Platform is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices.",
      "By using the Platform, you consent to the collection and use of information as described in our Privacy Policy. As this is a blockchain-based platform, certain transaction data is publicly visible on the Polygon blockchain.",
    ],
  },
  {
    id: "liability",
    title: "9. Limitation of Liability",
    content: [
      "To the maximum extent permitted by applicable law, OutcomeX and its affiliates, officers, employees, agents, partners, and licensors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill.",
      "Our total liability to you for any claims arising from these Terms or your use of the Platform shall not exceed the total fees paid by you to the Platform in the twelve months preceding the claim.",
      "Some jurisdictions do not allow the exclusion of certain warranties or limitations on liability, so the above limitations may not apply to you.",
    ],
  },
  {
    id: "dispute",
    title: "10. Dispute Resolution",
    content: [
      "Any disputes arising out of or relating to these Terms or the Platform shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.",
      "You waive any right to participate in a class action lawsuit or class-wide arbitration against OutcomeX.",
      "These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which OutcomeX is incorporated, without regard to its conflict of law provisions.",
    ],
  },
  {
    id: "contact",
    title: "11. Contact Us",
    content: [
      `If you have any questions about these Terms and Conditions, please contact us at ${TERMS_META.contactEmail}.`,
      "We will make reasonable efforts to respond to all inquiries within 5 business days.",
    ],
  },
]
