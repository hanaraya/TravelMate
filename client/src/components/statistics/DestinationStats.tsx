import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DestinationStats as DestinationStatsType } from '@shared/schema';
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Legend } from 'recharts';

interface DestinationStatsProps {
  destinations: DestinationStatsType[];
  isLoading?: boolean;
}

export default function DestinationStats({ destinations, isLoading = false }: DestinationStatsProps) {
  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#1890FF'];
  
  const pieData = destinations.map((destination, index) => ({
    name: destination.destination,
    value: destination.totalCount,
    openai: destination.openaiCount,
    anthropic: destination.anthropicCount,
    color: COLORS[index % COLORS.length]
  }));
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Destinations</CardTitle>
          <CardDescription>Most popular destinations and AI model preferences</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-48 w-full bg-gray-200 rounded-full"></div>
            <div className="mt-4 h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // If there's no data, show a message
  if (destinations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Destinations</CardTitle>
          <CardDescription>Most popular destinations and AI model preferences</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>No destination data available yet.</p>
            <p className="text-sm mt-2">Generate more itineraries to see statistics.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Destinations</CardTitle>
        <CardDescription>Most popular destinations and AI model preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string, props: any) => {
                  if (name === 'value') return [`Total: ${value}`, 'Selections'];
                  return [value, name === 'openai' ? 'OpenAI' : 'Anthropic'];
                }}
                labelFormatter={(name: string) => `Destination: ${name}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 space-y-4">
          {destinations.map((destination, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <div className="flex-grow">
                <div className="flex justify-between">
                  <span className="font-medium">{destination.destination}</span>
                  <span className="text-muted-foreground">{destination.totalCount} trips</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full mt-1 overflow-hidden flex">
                  <div 
                    className="h-full" 
                    style={{ 
                      width: `${(destination.openaiCount / destination.totalCount) * 100}%`,
                      backgroundColor: '#10a37f' // OpenAI green 
                    }}
                  ></div>
                  <div 
                    className="h-full" 
                    style={{ 
                      width: `${(destination.anthropicCount / destination.totalCount) * 100}%`,
                      backgroundColor: '#6f42c1' // Claude purple
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>OpenAI: {destination.openaiCount}</span>
                  <span>Anthropic: {destination.anthropicCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}