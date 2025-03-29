import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { StatisticsData } from '@shared/schema';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';
import ModelComparisonChart from '@/components/statistics/ModelComparisonChart';
import DestinationStats from '@/components/statistics/DestinationStats';
import TrendChart from '@/components/statistics/TrendChart';
import StatisticsSummary from '@/components/statistics/StatisticsSummary';

export default function Statistics() {
  const { data: statistics, isLoading, error } = useQuery<StatisticsData>({
    queryKey: ['/api/statistics'],
    queryFn: getQueryFn({ on401: 'throw' }),
    retry: false,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">AI Model Statistics</h1>
          <p className="text-xl text-muted-foreground mt-2">
            Insights into which AI models create the most compelling itineraries
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading statistics...</span>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-xl text-red-500">Error loading statistics</p>
            <p className="mt-2 text-muted-foreground">Please try again later or contact support.</p>
          </div>
        ) : statistics ? (
          <div className="space-y-8">
            <StatisticsSummary 
              totalItineraries={statistics.totalItineraries} 
              modelStats={statistics.aiModelStats} 
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ModelComparisonChart modelStats={statistics.aiModelStats} />
              <DestinationStats destinations={statistics.destinationStats} />
            </div>
            
            <TrendChart data={statistics.recentTrends} />
            
            <div className="bg-muted p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-2">About These Statistics</h2>
              <p className="text-muted-foreground mb-4">
                These statistics represent real user preferences when comparing itineraries created by different AI models.
                When users select which itinerary they prefer (without knowing which AI created it), we record their choices
                to help understand which model creates more compelling travel plans.
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>All data is anonymous and only shows aggregated preferences</li>
                <li>Models are constantly improving, so these statistics change over time</li>
                <li>Results vary by destination, budget, and traveler preferences</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-xl">No statistics available</p>
            <p className="mt-2 text-muted-foreground">Start creating itineraries to generate statistics.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}