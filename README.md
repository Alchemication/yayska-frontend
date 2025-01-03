# Yayska - Supporting Parents with Primary School Mathematics

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

## Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## License

[License details]

## Contact

[Contact information]

---

Built with ❤️ for parents in Ireland
