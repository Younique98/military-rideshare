# Base Link

Base Link is a secure, military-verified rideshare platform designed specifically for service members and their dependents. Built with Next.js 14 and modern web technologies, this platform provides safe, reliable transportation within the military community.

![Base Link](https://github.com/user-attachments/assets/baselink-preview.png)

## Tech Stack

- Frontend Framework: Next.js 14 (with App Router)
- Language: TypeScript
- Styling: Tailwind CSS + shadcn/ui
- Authentication: ID.me + Firebase Auth
- Database: Firebase Firestore
- Maps: Google Maps Platform
- Development Server: Webpack

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18.19.0 or higher)
- npm (v8 or higher)
- Git
- Firebase CLI

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/base-link.git
cd base-link
```

2. Install dependencies
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables
Create a `.env.local` file in the root directory and add the following:
```env
# App Configuration
NEXT_PUBLIC_APP_NAME=Base Link
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# ID.me Configuration
NEXT_PUBLIC_IDME_CLIENT_ID=
IDME_CLIENT_SECRET=

# API Keys
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Analytics
NEXT_PUBLIC_GA_TRACKING_ID=
```

4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure
```bash
base-link/
├── src/
│   ├── app/
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── verify/        # ID.me verification
│   │   │   └── login/         # Login pages
│   │   ├── (dashboard)/       # Protected routes
│   │   │   ├── rides/         # Ride management
│   │   │   └── profile/       # User profiles
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Auth endpoints
│   │   │   ├── rides/         # Ride endpoints
│   │   │   └── verification/  # ID.me verification
│   │   └── layout.tsx
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── shared/           # Shared components
│   │   └── features/         # Feature components
│   ├── lib/                  # Utility functions
│   │   ├── firebase/        # Firebase config
│   │   ├── maps/           # Maps utilities
│   │   ├── security/       # Security utilities
│   │   └── types/         # TypeScript types
│   └── styles/            # Global styles
├── public/               # Static files
└── package.json
```

## Database Schema

Our Firebase Firestore database includes the following main collections:

```typescript
// Users
interface User {
  id: string;
  email: string;
  name: string;
  militaryStatus: 'active' | 'dependent' | 'veteran';
  verificationStatus: 'pending' | 'verified' | 'expired';
  currentBase: string;
  profileComplete: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Rides
interface Ride {
  id: string;
  riderId: string;
  driverId?: string;
  pickup: GeoPoint;
  dropoff: GeoPoint;
  status: 'requested' | 'accepted' | 'inProgress' | 'completed';
  fare: number;
  scheduledTime: Timestamp;
  completedTime?: Timestamp;
  baseAccess: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Verification
interface Verification {
  userId: string;
  idmeToken: string;
  militaryStatus: string;
  verifiedAt: Timestamp;
  expiresAt: Timestamp;
}
```

## Security Features

Base Link implements comprehensive security measures:

1. Military Verification
- ID.me integration for military status verification
- Regular reverification requirements
- Secure credential storage

2. Location Security
- Military base geofencing
- Sensitive area masking
- Secure location tracking
- Data purging policies

3. User Protection
- End-to-end message encryption
- Secure data storage
- Regular security audits
- Emergency response system

## Development

To ensure secure development:

1. Security checks are run on every commit
2. All PR's require security review
3. Regular dependency updates
4. Automated vulnerability scanning

To create a new feature:
```bash
# Create feature branch
git checkout -b feature/YourFeature

# Run security checks
npm run security-check

# Run tests
npm test
```

## Working with Maps

Base Link uses Google Maps Platform for location services:

1. Initialize maps:
```typescript
import { initMaps } from '@/lib/maps';

const maps = await initMaps(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
```

2. Implement geofencing:
```typescript
import { checkBaseAccess } from '@/lib/security/geofencing';

const hasAccess = await checkBaseAccess(location);
```

## Deployment

The application can be deployed on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Set up build settings:
```bash
Build Command: npm run build
Output Directory: .next
Install Command: npm install --legacy-peer-deps
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Security Guidelines
- All PRs must include security review
- No sensitive data in commits
- Regular security audits required
- Compliance checks mandatory

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with shadcn/ui components
- Powered by Next.js
- Secured by ID.me
- Maps by Google Maps Platform
- Authentication by Firebase