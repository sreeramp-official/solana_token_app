# Solana Token App

Solana Token App is a Next.js-based frontend application that allows users to create, mint, send, and track SPL tokens on the Solana blockchain (devnet). The app features seamless wallet integration, real-time transaction history, and a responsive design with a dark/light theme toggle.

## Features

- **Wallet Integration:**  
  Connect your Solana wallet (e.g., Phantom) for secure blockchain interactions.

- **Token Creation:**  
  Easily create new SPL tokens with custom parameters.

- **Token Minting:**  
  Mint additional tokens to an existing token mint with clear verification of token authority.

- **Token Transfer:**  
  Send tokens to other Solana addresses, with built-in validation for recipient addresses and sufficient balance.

- **Transaction History:**  
  View your recent token transactions and track blockchain activity.

- **Theme Toggle:**  
  Switch between dark and light themes using a responsive mode toggle.

- **Responsive Design:**  
  The app is fully responsive, ensuring an optimal experience on both mobile and desktop devices.

## Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**

   Navigate to [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment

The app is deployed on Netlify and can be accessed at:  
[https://solanatokenappsth.netlify.app/](https://solanatokenappsth.netlify.app/)

## Project Structure

- **app/**: Contains Next.js pages and layouts.  
- **components/**: Holds React components such as the wallet integration, token creation/minting/sending interfaces, navigation, and UI components.  
- **styles/**: Global CSS and Tailwind configuration.  
- **lib/**: Utility functions used across the app.

## Running on Devnet

This project is configured to interact with Solana's devnet. Use a devnet faucet to obtain test SOL for transactions.