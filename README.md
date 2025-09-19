# Kalā-Yug: AI-Powered Platform for Indian Artisans

Kalā-Yug is a generative AI-powered platform that serves as a creative and marketing partner for local Indian artisans. The name combines "Kalā" (art) and "Yug" (age), signifying the start of a new era for artisans powered by AI.

## Project Overview

Kalā-Yug helps bridge the gap between traditional craftsmanship and contemporary consumer trends by providing:

- **Generative Design Assistant (GDA)**: An AI tool that takes an artisan's original motif or product image and generates new design mockups on different products.
- **AI Storyteller**: An AI tool that converts simple, conversational input (text or audio) into rich, engaging product descriptions, social media captions, and short product narratives.

## Core Value Proposition

- **Empowerment**: Provides artisans with digital tools to help them modernize their craft, create new designs, and reach a wider market without compromising the authenticity of their work.
- **Preservation**: Helps to document and celebrate the rich narratives and cultural heritage behind each craft, giving consumers a deeper appreciation for the product.

## Technical Stack

- **Frontend**: React.js/Next.js with Tailwind CSS
- **Backend**: Node.js/Express.js
- **AI/ML**: Google Cloud Vertex AI (Imagen 2.0 and Gemini API)
- **Data Storage**: Cloud Storage and Firestore
- **Authentication**: Firebase Authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Platform account
- Firebase account

### Installation

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Backend

```bash
cd backend
npm install
npm run dev
```

## Project Structure

```
├── frontend/               # Next.js frontend application
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── pages/         # Next.js pages
│   │   ├── styles/        # CSS styles
│   │   └── utils/         # Utility functions
│   └── ...                # Configuration files
├── backend/               # Node.js/Express backend
│   ├── src/               # Source code
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Data models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   └── ...                # Configuration files
└── ...                    # Root configuration files
```

## Features

- User authentication (email/password)
- Generative Design Assistant for image-to-image mockups
- AI Storyteller for text generation
- Product profile pages for public viewing
- Social media caption generation and hashtag suggestions

## License

This project is licensed under the MIT License - see the LICENSE file for details.