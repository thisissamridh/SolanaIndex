# Solana Helius Indexer

A full-stack application for indexing and managing Solana blockchain data using Helius webhooks. This project allows users to create, manage, and monitor webhooks that track specific Solana blockchain activities and store the data in their preferred database.

![GitHub License](https://img.shields.io/github/license/yourusername/solana-helius-indexer)
![GitHub stars](https://img.shields.io/github/stars/yourusername/solana-helius-indexer)
![GitHub issues](https://img.shields.io/github/issues/yourusername/solana-helius-indexer)

## Features

### Current Features
- 🔐 **User Authentication** with Google Firebase Auth
- 📊 **Dashboard** for webhook management and monitoring
- 🔄 **Real-time webhook status monitoring** for active/inactive states
- 🗄️ **Database connection management** with support for PostgreSQL
- 📝 **Webhook creation and configuration** for Solana programs and accounts
- 📈 **Activity logging** for webhook events
- 🎯 **Custom data indexing options** for different blockchain data types
- 🔌 **Automatically generated database tables** for storing webhook data

### Planned Features
- [ ] Support for more authentication providers (GitHub, Discord, etc.)
- [ ] Webhook templates for common use cases (NFT tracking, token transfers, etc.)
- [ ] Data visualization tools for indexed blockchain data
- [ ] Export functionality for indexed data (CSV, JSON)
- [ ] Webhook testing tools with sample transaction data
- [ ] Rate limiting and quota management for API usage
- [ ] Webhook retry mechanisms for failed requests
- [ ] Advanced analytics for webhook activity and performance

## Tech Stack

### Frontend
- **Next.js 13+** (App Router) for frontend rendering
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Shadcn UI Components** for UI elements
- **Firebase Authentication** for user management

### Backend
- **Node.js** with Express for the server
- **TypeScript** for type safety
- **Firebase/Firestore** for data storage
- **Helius API** for Solana blockchain integration
- **PostgreSQL** for storing indexed blockchain data

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (optional, for local development)
- **Firebase CLI** for Firebase interactions
- **A Helius API key** for blockchain data access

## Environment Variables

### Frontend (.env.local)
```plaintext
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### Backend (.env)
```plaintext
PORT=3001
HELIUS_API_KEY=your_helius_api_key
SERVER_URL=http://localhost:3001
FIREBASE_DATABASE_URL=your_firebase_database_url
WEBHOOK_AUTH_HEADER=your-webhook-auth-header
```

## Project Structure

```
solana-helius-indexer/
├── client/                  # Next.js frontend application
│   ├── app/                 # App router components
│   ├── components/          # Reusable UI components
│   ├── contexts/            # React contexts (auth, etc.)
│   ├── lib/                 # Utility functions
│   └── public/              # Static assets
├── server/                  # Express backend application
│   ├── src/                 # Source code
│   │   ├── firebaseAdmin.ts # Firebase admin setup
│   │   ├── index.ts         # Main server entry point
│   │   ├── routes/          # API routes
│   │   └── webhooks/        # Webhook handlers
│   └── service.json         # Firebase service account
└── README.md                # Project documentation
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/solana-helius-indexer.git
   cd solana-helius-indexer
   ```

2. Install dependencies for all projects:
   ```bash
   npm run install-all
   ```

3. Set up environment variables:
   - Create `.env.local` in the client directory
   - Create `.env` in the server directory
   - Fill in the required values as described in the Environment Variables section

## Running the Application

1. Run both client and server in development mode:
   ```bash
   npm run dev
   ```

2. Or run them separately:
   ```bash
   # Run the client (Next.js)
   npm run client
   
   # Run the server (Express)
   npm run server
   ```

## Local Development with Webhooks

### Using Ngrok for Webhook Testing

To test webhooks locally, you'll need to expose your local server to the internet. We recommend using Ngrok:

1. Install Ngrok:
   ```bash
   # MacOS
   brew install ngrok
   
   # Windows
   choco install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. Run your server:
   ```bash
   npm run server
   ```

3. In a separate terminal, start Ngrok to create a tunnel:
   ```bash
   ngrok http 3001
   ```

4. Copy the Ngrok HTTPS URL (e.g., `https://your-tunnel.ngrok-free.app`)

5. Update your `.env` file with:
   ```
   SERVER_URL=https://your-tunnel.ngrok-free.app
   ```

6. Restart your server for the changes to take effect

### Using Cloudflare Tunnel (Alternative)

For a more robust solution, Cloudflare Tunnel can be used:

1. Install the Cloudflare CLI tool:
   ```bash
   # MacOS
   brew install cloudflare/cloudflare/cloudflared
   ```

2. Authenticate with Cloudflare:
   ```bash
   cloudflared tunnel login
   ```

3. Create a tunnel:
   ```bash
   cloudflared tunnel create solana-indexer
   ```

4. Start your tunnel:
   ```bash
   cloudflared tunnel run --url http://localhost:3001 solana-indexer
   ```

5. Update your environment variables with the provided URL

## Database Setup

The application works with PostgreSQL databases. For local development:

1. Install PostgreSQL if not already installed
2. Create a new database
3. Use the connection string in the application when connecting a database

For production, we recommend using a managed PostgreSQL service like:
- Neon (https://neon.tech)
- Supabase (https://supabase.com)
- AWS RDS (https://aws.amazon.com/rds/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Issues and Feature Requests

If you encounter any issues or have ideas for improvements, please file an issue:

### Common Issues

- **Webhook Not Receiving Data**: Ensure your Ngrok/Cloudflare tunnel is active and the URL is correctly configured in both your environment variables and Helius dashboard.
- **Database Connection Failures**: Check your connection string and ensure your PostgreSQL server is running and accessible.
- **Firebase Authentication Issues**: Verify your Firebase configuration and ensure you've set up the authentication providers correctly.

### Feature Requests

When submitting feature requests, please provide:
- A clear description of the feature
- Why it would be valuable
- Any technical details or implementation ideas you have

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Helius](https://helius.xyz) for their Solana indexing API
- [Solana Foundation](https://solana.com) for the blockchain platform
- [Firebase](https://firebase.google.com) for authentication and database services
- [Shadcn UI](https://ui.shadcn.com) for the component library
- [Next.js](https://nextjs.org) for the frontend framework

---

Built with ❤️ for the Solana ecosystem.