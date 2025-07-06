# Yayska - Parent's Guide to School Success

Know more. Help better.

## About Yayska

Yayska is a mobile and web application designed to help parents support their children's learning journey in primary school subjects. Built with Irish curriculum in mind, it provides parents with clear, practical insights into concepts their children are learning.

## How to Use Yayska

Yayska is designed to guide you through your child's learning journey with a structured approach:

### 1. 📅 Monthly Learning Overview

- **Home Screen**: View the monthly curriculum carousel showing what your child should focus on
- **Key Concepts**: Essential concepts for the current month that form the foundation
- **Next Steps**: Important concepts that build on the key concepts and prepare for future learning
- **Progress Tracking**: See at a glance which concepts have been studied (📖) and discussed (💬)

### 2. 🔍 Explore All Subjects

- **Subject Overview**: Browse all subjects your child will learn this year
- **Comprehensive View**: See every concept organized by subject with expandable sections
- **Progress Monitoring**: Track your engagement across all subjects and concepts

### 3. 📚 Deep Dive into Concepts

For each concept, you can:

- **Study the Details**: Access comprehensive information about why it's important, difficulty level, and practical applications
- **Get Parent Guidance**: Find key points, quick tips, and assessment approaches
- **Understand Real-World Context**: See Irish-specific examples and practice ideas
- **Track Time Investment**: Get realistic expectations for learning pace

### 4. 💬 Chat with Yay

- **AI-Powered Support**: Ask questions about any concept to get personalized explanations
- **Contextual Help**: Get specific guidance tailored to your child's learning level
- **Practice Ideas**: Receive suggestions for activities and exercises
- **Feedback Loop**: Rate responses to help improve the experience

### 5. 📊 Progress Tracking

Your engagement is automatically tracked:

- **📖 Studied**: Concepts you've read for at least 15 seconds
- **💬 Chatted**: Concepts you've discussed with Yay using your own questions (not just suggested prompts)

This system helps you:

- **Stay Organized**: Know what to focus on each month
- **Build Confidence**: Understand concepts before helping your child
- **Track Progress**: See your learning journey and identify areas for more attention
- **Get Personalized Help**: Use AI chat for specific questions and scenarios

## Key Features

- **Curriculum-Aligned Content**: Mapped to the Irish primary school curriculum
- **Parent-Friendly Explanations**: Complex topics broken down into digestible information
- **Practical Applications**: Real-world examples and practice ideas
- **Multiple Children Support**: Manage different children at different class levels
- **Irish Context**: Examples and applications relevant to Irish daily life

## Concept Information

For each concept, parents can access:

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

2. **Learning Journey**:

   - Monthly curriculum overview guides focus areas
   - Explore view provides comprehensive subject access
   - Concept details offer in-depth understanding
   - AI chat provides personalized support

3. **Child Management**:
   - Switch between multiple children profiles
   - View appropriate content based on child's education level

## Development Status

Currently in MVP phase, focusing on:

- Primary school subjects
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

## Analytics

Yayska includes a privacy-focused analytics system to understand user journeys and improve the product experience.

### How It Works

- **Session Management**: Uses UUID v4 session IDs for privacy
- **Smart Sessions**: New sessions start on app launch, after 20+ minutes in background, or on new days
- **Privacy First**: Only anonymized usage patterns are tracked, no personal information
- **Reliable**: Analytics failures never break the app experience

### Usage

Track events anywhere in the app:

```typescript
import { trackEvent } from '../utils/analytics';

// Track user interactions
await trackEvent('CONCEPT_CLICKED', {
  concept_id: 123,
  concept_name: 'Addition',
  subject_name: 'Mathematics',
});
```

### What We Track

- User authentication and onboarding flows
- Screen navigation and content interaction
- Learning content engagement patterns
- App usage sessions and timing

### Backend Integration

Events are sent to `POST /api/v1/events/` with the structure:

```json
{
  "event_type": "CONCEPT_CLICKED",
  "payload": { "concept_id": 123, "timestamp": "2025-01-15T14:30:00.000Z" },
  "session_id": "uuid-v4-session-id"
}
```

The system is configured in `src/utils/analytics.ts` and automatically initialized in the app layout.

## Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## Troubleshooting

- **API Connection Issues**: Make sure the backend is running on `http://localhost:8000` in development mode.
- **Build Errors**: Check Node.js version compatibility with the Expo SDK version.
- **AsyncStorage Errors**: May occur when schema changes, try clearing app data or using reset functionality.

## License

MIT License

Copyright (c) 2025 Yayska

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Contact

For questions or support, please [create an issue](https://github.com/alchemication/yayska-frontend/issues).

---

Built with ❤️ for parents in Ireland
