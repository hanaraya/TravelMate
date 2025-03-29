import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AIModelStats } from '@shared/schema';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';

interface ModelComparisonChartProps {
  modelStats: AIModelStats[];
  isLoading?: boolean;
}

export default function ModelComparisonChart({ modelStats, isLoading = false }: ModelComparisonChartProps) {
  // Format data for the chart
  const chartData = modelStats.map(stat => ({
    name: stat.modelName,
    Selections: stat.totalSelections,
    'Correct Guesses': stat.correctGuesses,
    percentageCorrect: stat.percentageCorrect
  }));

  // Define vibrant colors for each model
  const modelColors: Record<string, string> = {
    'GPT-4o': '#10a37f', // OpenAI green
    'Claude 3.7 Sonnet': '#6f42c1', // Claude purple
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Model Performance</CardTitle>
          <CardDescription>Comparison of model selections and correct guesses</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-48 w-full bg-gray-200 rounded"></div>
            <div className="mt-4 h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Model Performance</CardTitle>
        <CardDescription>Comparison of model selections and correct guesses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  return [value, name];
                }}
                labelFormatter={(value: string) => `Model: ${value}`}
              />
              <Legend />
              <Bar dataKey="Selections" name="Total Selections">
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={modelColors[entry.name] || '#8884d8'} 
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
              <Bar dataKey="Correct Guesses" name="Correct Guesses">
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={modelColors[entry.name] || '#8884d8'} 
                    fillOpacity={0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          {modelStats.map((stat, index) => (
            <div key={index} className="bg-muted p-4 rounded-lg">
              <div className="font-semibold mb-1">{stat.modelName}</div>
              <div className="text-sm text-muted-foreground mb-2">
                Success Rate: {stat.percentageCorrect}%
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${stat.percentageCorrect}%`,
                    backgroundColor: modelColors[stat.modelName] || '#8884d8' 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}