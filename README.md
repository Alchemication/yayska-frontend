# Yayska - Parent's Guide to School Success

Know more. Help better.

## About Yayska

Yayska is a mobile and web application designed to help parents support their children's learning journey in primary school mathematics. Built with Irish curriculum in mind, it provides parents with clear, practical insights into mathematical concepts their children are learning.

## Key Features

- **Curriculum-Aligned Content**: Mapped to the Irish primary school curriculum
- **Parent-Friendly Explanations**: Complex topics broken down into digestible information
- **Practical Applications**: Real-world examples and practice ideas
- **Multiple Children Support**: Manage different children at different class levels
- **Irish Context**: Examples and applications relevant to Irish daily life

## Concept Information

For each mathematical concept, parents can access:

- 🎯 **Why Important**
  - Practical value in daily life
  - Future learning implications
  - Modern relevance
- 📊 **Difficulty Guide**
  - Challenge level assessment
  - Common barriers
  - Reassuring perspectives
- 💡 **Parent Guide**
  - Key points to understand
  - Quick tips for helping
  - Practice ideas
- 🌍 **Real World Applications**
  - Irish context examples
  - Practical scenarios
  - Daily life connections
- ⏱️ **Time Guidelines**
  - Learning pace estimates
  - Practice recommendations

## Technical Details

- Built with React Native/Expo
- Supports both web and mobile platforms
- TypeScript for type safety
- Modern, responsive UI design

## Environment Setup

### Prerequisites

- Node.js 18.x or newer
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Environment Variables

When running in development mode, the app connects to a local backend by default. In production, it uses the deployed backend URL.

The API base URL is configured in `src/services/api.ts`:

```js
const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://yayska-backend.vercel.app/api/v1'
    : 'http://localhost:8000/api/v1';
```

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Deployment:

```
# Test production build locally
npm run build
npx serve dist

# Deploy
# First commit changes
git push origin main  # Vercel automatically deploys
```

## Architecture

The application uses:

- **Expo Router** for file-system based navigation
- **React Native** components for cross-platform UI
- **TypeScript** for type safety
- **AsyncStorage** for local data persistence
- **Fetch API** for backend communication

## Key Workflows

1. **User Onboarding**:

   - Users register their children with school years
   - Data persists locally using AsyncStorage

2. **Content Browsing**:

   - Fetches learning paths and concepts from the backend API
   - Organized by subjects and educational levels

3. **Child Management**:
   - Switch between multiple children profiles
   - View appropriate content based on child's education level

## Development Status

Currently in MVP phase, focusing on:

- Primary school mathematics
- Core concept explanations
- Basic parent guidance

Future plans include:

- Additional subjects
- Interactive assessments
- AI-powered chat support

## Project Structure

```
yayska-frontend/
├── app/ # Main application screens (Expo Router)
│ ├── _layout.tsx # Root navigation layout
│ ├── index.tsx # Welcome screen
│ ├── onboarding.tsx # Child registration
│ ├── home.tsx # Main dashboard
│ └── concept/ # Concept details
├── src/
│ ├── components/ # Reusable UI components
│ │ ├── Concept/ # Concept-related components
│ │ ├── Learning/ # Learning path components
│ │ └── Onboarding/ # Onboarding flow components
│ ├── services/ # API and external services
│ ├── types/ # TypeScript type definitions
│ ├── utils/ # Utility functions and storage
│ ├── hooks/ # Custom React hooks
│ └── theme/ # Global styling and colors
```

## Backend Integration

This frontend connects to a FastAPI + PostgreSQL backend. The API service is configured in `src/services/api.ts`.

## Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## Troubleshooting

- **API Connection Issues**: Make sure the backend is running on `http://localhost:8000` in development mode.
- **Build Errors**: Check Node.js version compatibility with the Expo SDK version.
- **AsyncStorage Errors**: May occur when schema changes, try clearing app data or using reset functionality.

## License

[License details]

## Contact

[Contact information]

---

Built with ❤️ for parents in Ireland
