# Fundis & Freelancers Booking Bot 🔧

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/your-site-name/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

A WhatsApp-based booking platform that connects clients with trusted local service providers (fundis, cleaners, tutors, etc.) in Kenya. Built with scalability and monetization in mind.

## 🚀 Live Demo

- **Admin Dashboard**: [https://your-site-name.netlify.app](https://your-site-name.netlify.app)
- **API Documentation**: [https://your-site-name.netlify.app/api/docs](https://your-site-name.netlify.app/api/docs)

## 🌟 Features

### For Clients
- 📱 **WhatsApp Integration** - Book services directly through WhatsApp
- 🔍 **Smart Search** - Find service providers by location, rating, and availability
- 💳 **M-Pesa Integration** - Secure payments through Kenya's mobile money platform
- ⭐ **Rating System** - Rate and review service providers
- 📅 **Flexible Scheduling** - Book for immediate or future appointments
- 📲 **Real-time Updates** - Get booking confirmations and status updates

### For Service Providers (Fundis)
- 📝 **Easy Registration** - Simple WhatsApp-based onboarding
- 💼 **Profile Management** - Showcase skills, photos, and work portfolio
- 📊 **Earnings Dashboard** - Track bookings, payments, and performance
- 🔔 **Instant Notifications** - Receive booking requests immediately
- 💰 **Flexible Pricing** - Set your own rates and availability
- 🏆 **Reputation Building** - Build trust through verified reviews

### For Administrators
- 🎛️ **Admin Dashboard** - Comprehensive platform management
- 📈 **Analytics & Reporting** - Track platform performance and revenue
- 👥 **User Management** - Manage service providers and clients
- 💸 **Revenue Tracking** - Monitor subscriptions and commissions
- 🛡️ **Fraud Prevention** - Advanced security and verification systems

## 🚀 Deployment to Netlify

### Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
3. **Environment Variables** - Prepare your API keys and secrets

### Step 1: Deploy to Netlify

1. **Connect Repository**:
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your GitHub account
   - Select your repository

2. **Configure Build Settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
   - **Functions directory**: `netlify/functions`

3. **Set Environment Variables**:
   Go to Site Settings → Environment Variables and add:
   ```
   NODE_ENV=production
   JWT_SECRET=your_jwt_secret_here
   WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
   WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
   MPESA_CONSUMER_KEY=your_mpesa_consumer_key
   MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
   MPESA_SHORTCODE=your_mpesa_shortcode
   MPESA_PASSKEY=your_mpesa_passkey
   ```

4. **Deploy**:
   - Click "Deploy site"
   - Wait for the build to complete
   - Your site will be available at `https://your-site-name.netlify.app`

### Step 2: Configure WhatsApp Webhook

1. **Update Webhook URL**:
   - Go to your WhatsApp Business API settings
   - Set webhook URL to: `https://your-site-name.netlify.app/api/webhook/whatsapp`
   - Use your `WHATSAPP_WEBHOOK_VERIFY_TOKEN` for verification

2. **Update M-Pesa Callback**:
   - In your M-Pesa dashboard, set callback URL to:
   - `https://your-site-name.netlify.app/api/payments/callback`

### Step 3: Test Your Deployment

1. **Admin Dashboard**: Visit your Netlify URL
2. **Login**: Use phone number `0700000000` (demo admin)
3. **API Health**: Check `https://your-site-name.netlify.app/api/health`
4. **WhatsApp**: Send a message to your WhatsApp Business number

## 🏗️ Architecture

### Deployment Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │   Netlify        │    │   SQLite DB     │
│   (Frontend)    │◄──►│   Functions      │◄──►│   (Serverless)  │
│                 │    │   (Backend API)  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   External APIs  │
                       │   WhatsApp, M-Pesa│
                       └──────────────────┘
```

### Tech Stack

**Frontend:**
- React.js with TypeScript
- Tailwind CSS for styling
- Redux Toolkit for state management
- Deployed as static files on Netlify

**Backend:**
- Node.js with Express.js
- Deployed as Netlify Functions (serverless)
- SQLite database (file-based, perfect for serverless)
- JWT authentication

**Integrations:**
- WhatsApp Business Cloud API
- Safaricom M-Pesa Daraja API
- Africa's Talking SMS API

## 🔧 Local Development

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v8.0.0 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fundis-booking-bot.git
   cd fundis-booking-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run db:setup
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000` and the admin dashboard at `http://localhost:5173`.

## 📊 Monitoring & Analytics

### Health Checks

- **General Health**: `GET /api/health`
- **Database Health**: `GET /api/health/database`
- **WhatsApp Status**: `GET /api/health/whatsapp`

### Admin Dashboard Features

- **Real-time Analytics**: User registrations, bookings, revenue
- **User Management**: Activate/deactivate users and providers
- **Booking Oversight**: Monitor all platform bookings
- **Payment Tracking**: View transaction history and revenue

## 🔐 Security Features

- **JWT Authentication**: Secure API access
- **Input Validation**: Joi schema validation
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Secure cross-origin requests
- **Helmet.js**: Security headers
- **Environment Variables**: Secure credential management

## 📱 WhatsApp Bot Commands

### For Clients
- `hi` or `hello` - Show main menu
- `1` or `book service` - Start booking process
- `2` or `my bookings` - View booking history
- `help` - Get support information

### For Service Providers
- `accept [booking_id]` - Accept a booking
- `decline [booking_id]` - Decline a booking
- `3` or `become provider` - Register as provider

## 💳 Payment Integration

### M-Pesa STK Push
- Automatic payment prompts
- Real-time payment verification
- Secure callback handling
- Transaction tracking

### Payment Flow
1. Client initiates payment via WhatsApp
2. M-Pesa STK push sent to client's phone
3. Client enters M-Pesa PIN
4. Payment confirmed via callback
5. Booking status updated automatically

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run the test suite (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- 📧 **Email**: support@fundisbookingbot.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/fundis-booking-bot/issues)
- 📖 **Documentation**: [Project Wiki](https://github.com/yourusername/fundis-booking-bot/wiki)

### Demo Credentials

- **Admin Login**: Phone `0700000000`
- **Test Client**: Phone `0712345678`
- **Test Provider**: Phone `0723456789`

## 🚀 Roadmap

### Phase 1: MVP ✅
- [x] WhatsApp bot integration
- [x] Basic booking flow
- [x] M-Pesa payments
- [x] Provider verification
- [x] Admin dashboard
- [x] Netlify deployment

### Phase 2: Growth (Q2 2025)
- [ ] Mobile web app
- [ ] Advanced search filters
- [ ] Subscription management
- [ ] Multi-language support
- [ ] Referral program

### Phase 3: Scale (Q3 2025)
- [ ] Multi-city expansion
- [ ] API for third-party integrations
- [ ] Advanced analytics
- [ ] Machine learning recommendations
- [ ] Enterprise features

## 📞 Contact

**Project Maintainer**: Your Name  
**Email**: your.email@example.com  
**LinkedIn**: [Your LinkedIn Profile](https://linkedin.com/in/yourprofile)  
**GitHub**: [@yourusername](https://github.com/yourusername)

---

**Built with ❤️ in Kenya for the African market**

*Making local services accessible, one WhatsApp message at a time.*

**Deployed on Netlify** 🚀