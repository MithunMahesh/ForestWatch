# ForestWatch 🌲

An interactive web application for visualizing global deforestation data from 2001-2024 using the Hansen Global Forest Change dataset.

## Overview

ForestWatch provides real-time visualization of forest loss across nine major forest regions worldwide, raising awareness about deforestation.

## Features

- **Interactive Global Map**: Explore deforestation data across 9 major forest regions
- **Time-Lapse Visualization**: View forest loss progression from 2001-2024 with a dynamic slider
- **Real-Time Analytics**: Get instant statistics on deforestation area, carbon emissions, and cumulative loss
- **AI-Powered Insights**: Receive comparisons and summaries for each region and year

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Maps**: Google Maps API, @react-google-maps/api
- **Data**: Hansen Global Forest Change dataset (2024 v1.12)
- **AI**: Gemini, Groq, Together AI, OpenRouter APIs
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Maps API key
- At least one AI API key (Gemini, Groq, Together, or OpenRouter)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/forestwatch.git
cd forestwatch
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# AI APIs (at least one required)
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
TOGETHER_API_KEY=your_together_key
OPENROUTER_API_KEY=your_openrouter_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
forestwatch/
├── app/
│   ├── api/
│   │   └── summary/         # AI-powered deforestation analysis endpoint
│   ├── components/
│   │   └── MapView.tsx      # Main interactive map component
│   └── page.tsx             # Homepage
├── public/
│   └── hansen-forest-images/ # Pre-processed satellite imagery
└── README.md
```

## Forest Regions

The app tracks deforestation across 9 major forest regions:

1. **Amazon Rainforest** - South America's vital ecosystem
2. **Southeast Asian Forests** - Indonesia, Malaysia, and surrounding areas
3. **Mesoamerican Tropical Forests** - Central America's biodiversity hotspot
4. **Siberian Taiga** - World's largest forest biome
5. **Eastern Deciduous Forests** - Eastern United States
6. **Pacific Northwest Forests** - Western United States
7. **Canadian Boreal Forest** - Canada's vast northern forests
8. **Chinese Temperate Forests** - Eastern China's forest systems
9. **East European Taiga** - Russia and Eastern Europe

## Data Source

This project uses the Hansen Global Forest Change dataset (v1.12, 2024), which provides global forest loss data at 30-meter resolution from 2001-2024. The dataset is produced by the University of Maryland and available through Google Earth Engine.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Hansen/UMD/Google/USGS/NASA for the Global Forest Change dataset
- Google Earth Engine for data processing capabilities
- All the AI providers for analysis capabilities
