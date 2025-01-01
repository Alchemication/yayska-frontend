# Yayska Frontend

Yayska is a mobile application designed to support parents in Ireland with their children's primary school education. The app provides detailed concept explanations, practical examples, and parent guides across various subjects.

## 🎯 Overview

Built with React Native and Expo Router, Yayska offers an intuitive interface for parents to:

- Track multiple children across different primary school years
- Access detailed concept explanations with practical Irish context
- Get guidance on supporting their children's learning journey
- Navigate through subjects and concepts easily

## 🏗️ Project Structure

```
yayska-frontend/
├── app/ # Main application screens
│ ├── layout.tsx # Root navigation layout
│ ├── index.tsx # Welcome screen
│ ├── onboarding.tsx # Child registration
│ ├── home.tsx # Main dashboard
│ └── concept/ # Concept details
├── src/
│ ├── components/ # Reusable UI components
│ │ ├── Concept/ # Concept-related components
│ │ └── Onboarding/ # Onboarding flow components
│ └── theme/ # Global styling and colors
```

## 🎨 Features

### Welcome Screen

- Irish-themed welcome page with tricolor stripe
- "Fáilte go Yayska!" greeting
- Simple onboarding flow initiation

### Onboarding

- Add multiple children
- Select school year (Junior Infants through 6th Class)
- Flexible child management (add/remove children)

### Home Dashboard

- Child selector with year display
- Subject categorization
- Concept grid navigation
- Clean, intuitive interface

### Concept Details

- Three-section layout:
  1. Why Important (practical value, future learning, modern relevance)
  2. Difficulty Stats (challenge level, common barriers, reassurance)
  3. Parent Guide (key points, quick tips)
- Interactive section navigation
- Context-specific Irish examples

## 🎨 Design System

### Colors

- Primary palette inspired by Irish flag:
  - Green (`#169B62`)
  - White (`#FFFFFF`)
  - Orange (`#FF8C37`)
- Semantic colors for:
  - Success/Error states
  - Text hierarchy
  - Backgrounds
  - UI accents

### UI Components

- Consistent border radius system
- Standardized shadow effects
- Responsive button states
- Accessible text sizing

## 🚀 Getting Started

1. Install dependencies:

```
npm install
```

2. Start the development server:

```bash
npx expo start
```

3. Run on your preferred platform:

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

## 📱 Platform Support

- iOS
- Android
- Expo Go compatible

## 🔜 Upcoming Features

- API integration for dynamic content
- User authentication
- Progress tracking
- Additional subjects beyond Mathematics
- Customized learning paths
- Chatbot for quick questions
