'use client';

import { ArrowRight, Globe, TrendingDown, Users, Leaf, ExternalLink, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from 'react'
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./modules/Map'), {
  ssr: false,
});

export default function Home() {
  const [showMap, setShowMap] = useState(false);

  if (showMap) {
    return (
      <div className="w-full h-screen bg-black text-white fixed inset-0 overflow-hidden">
        {/* Small ForestWatch logo and back button in bottom left */}
        <div className="absolute bottom-4 left-20 z-50 flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMap(false)}
            className="text-green-400 hover:text-green-300 hover:bg-green-500/20 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2"
          >
            ← Back
          </Button>
          <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-md flex items-center justify-center">
              <Globe className="w-4 h-4 text-black" />
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
              ForestWatch
            </span>
          </div>
        </div>
        <main className="w-full h-full">
          <MapView />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-green-900/20 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                ForestWatch
              </span>
            </div>
            <Button
              variant="outline"
              className="border-green-500 text-green-400 hover:bg-green-500 hover:text-black bg-transparent"
              onClick={() => setShowMap(true)}
            >
              View Data
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-black to-red-900/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-300">Deforestation Data</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  Track Global{" "}
                  <span className="bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text text-transparent">
                    Forest Loss
                  </span>{" "}
                  in Real Time
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                  Monitor deforestation across the world's 15 most critical forest regions. Visualize yearly data,
                  understand trends, and join the fight to protect our planet's lungs.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-black font-semibold px-8 py-4 text-lg"
                  onClick={() => setShowMap(true)}
                >
                  Explore Forest Data
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>

            </div>

            <div className="relative">
              <div className="relative w-full h-96 bg-gradient-to-br from-green-900/20 to-black rounded-2xl border border-green-500/20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_70%)]" />
                <div className="absolute top-4 left-4 right-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-400">Global Forest Coverage</span>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border-4 border-green-500/30 flex items-center justify-center relative">
                    <div className="w-32 h-32 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Globe className="w-16 h-16 text-green-400" />
                    </div>
                    {/* Animated red dots representing deforestation */}
                    <div className="absolute top-8 right-12 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <div className="absolute bottom-12 left-8 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse delay-300" />
                    <div className="absolute top-16 left-6 w-1 h-1 bg-red-500 rounded-full animate-pulse delay-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Information Card */}
      <section className="py-16 bg-gradient-to-b from-black to-green-950/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-green-950/20 border-green-500/30 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="w-6 h-6 text-green-400" />
              </div>
              <CardTitle className="text-2xl text-green-300">How to Use ForestWatch</CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Navigate our interactive platform to explore global deforestation data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-green-400 font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-green-300">Select a Forest</h3>
                  <p className="text-sm text-gray-400">
                    Choose from 15 major forest regions worldwide to explore detailed deforestation data.
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-green-400 font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-green-300">View Yearly Trends</h3>
                  <p className="text-sm text-gray-400">
                    Analyze year-over-year changes with interactive charts and visual representations.
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-red-400 font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-red-300">Track Red Zones</h3>
                  <p className="text-sm text-gray-400">
                    Red dots on our map indicate areas of active deforestation and critical concern.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How You Can Help Section */}
      <section className="py-20 bg-gradient-to-b from-green-950/10 to-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              How You Can Help{" "}
              <span className="bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                Fight Deforestation
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Every action counts. Join these organizations and movements working tirelessly to protect our forests and
              combat climate change.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* World Wildlife Fund */}
            <Card className="bg-green-950/20 border-green-500/30 hover:border-green-400/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Leaf className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-green-300 group-hover:text-green-200 transition-colors">
                  World Wildlife Fund
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Leading conservation organization protecting forests worldwide through policy and direct action.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-green-500 text-green-400 hover:bg-green-500 hover:text-black bg-transparent"
                  asChild
                >
                  <a href="https://www.worldwildlife.org/initiatives/forests" target="_blank" rel="noopener noreferrer">
                    Learn More <ExternalLink className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Rainforest Alliance */}
            <Card className="bg-green-950/20 border-green-500/30 hover:border-green-400/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <TrendingDown className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-green-300 group-hover:text-green-200 transition-colors">
                  Rainforest Alliance
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Working with communities to protect rainforests and promote sustainable agriculture practices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-green-500 text-green-400 hover:bg-green-500 hover:text-black bg-transparent"
                  asChild
                >
                  <a href="https://www.rainforest-alliance.org/" target="_blank" rel="noopener noreferrer">
                    Get Involved <ExternalLink className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Amazon Conservation */}
            <Card className="bg-green-950/20 border-green-500/30 hover:border-green-400/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-green-300 group-hover:text-green-200 transition-colors">
                  Amazon Conservation
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Dedicated to protecting the Amazon rainforest through science, innovation, and partnerships.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-green-500 text-green-400 hover:bg-green-500 hover:text-black bg-transparent"
                  asChild
                >
                  <a href="https://www.amazonconservation.org/" target="_blank" rel="noopener noreferrer">
                    Support Now <ExternalLink className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* One Tree Planted */}
            <Card className="bg-green-950/20 border-green-500/30 hover:border-green-400/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Leaf className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-green-300 group-hover:text-green-200 transition-colors">
                  One Tree Planted
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Simple reforestation efforts - for every dollar donated, one tree is planted in areas of need.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-green-500 text-green-400 hover:bg-green-500 hover:text-black bg-transparent"
                  asChild
                >
                  <a href="https://onetreeplanted.org/" target="_blank" rel="noopener noreferrer">
                    Plant Trees <ExternalLink className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Greenpeace */}
            <Card className="bg-green-950/20 border-green-500/30 hover:border-green-400/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-green-300 group-hover:text-green-200 transition-colors">
                  Greenpeace Forests
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Global environmental activism focused on protecting ancient forests and stopping deforestation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-green-500 text-green-400 hover:bg-green-500 hover:text-black bg-transparent"
                  asChild
                >
                  <a
                    href="https://www.greenpeace.org/international/act/forests/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Take Action <ExternalLink className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Forest Stewardship Council */}
            <Card className="bg-green-950/20 border-green-500/30 hover:border-green-400/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-green-300 group-hover:text-green-200 transition-colors">
                  Forest Stewardship Council
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Promoting responsible forest management through certification and sustainable practices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-green-500 text-green-400 hover:bg-green-500 hover:text-black bg-transparent"
                  asChild
                >
                  <a href="https://fsc.org/en" target="_blank" rel="noopener noreferrer">
                    Learn About FSC <ExternalLink className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 mb-6">
              Small actions create big impact. Choose sustainable products, reduce paper consumption, and spread
              awareness.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-green-900/20 bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                ForestWatch
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              Created using the Hansen Global Forest Change Dataset
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}