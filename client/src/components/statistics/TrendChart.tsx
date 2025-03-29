import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface TrendChartProps {
  data: {
    openaiTrend: number[];
    anthropicTrend: number[];
    labels: string[];
  };
  isLoading?: boolean;
}

export default function TrendChart({ data, isLoading = false }: TrendChartProps) {
  // Format data for the chart
  const chartData = data.labels.map((label, index) => ({
    date: label,
    'OpenAI': data.openaiTrend[index],
    'Anthropic': data.anthropicTrend[index],
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Preferences Trend</CardTitle>
          <CardDescription>How preferences have changed over the last 10 days</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center w-full">
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
        <CardTitle>User Preferences Trend</CardTitle>
        <CardDescription>How preferences have changed over the last 10 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis allowDecimals={false} />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  return [`${value} choices`, name];
                }}
                labelFormatter={(value: string) => `Date: ${value}`}
              />
              <Legend verticalAlign="top" height={36} />
              <Line 
                type="monotone" 
                dataKey="OpenAI" 
                stroke="#10a37f" 
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="Anthropic" 
                stroke="#6f42c1" 
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 bg-muted p-4 rounded-lg">
          <div className="text-sm font-medium">Insights:</div>
          <p className="text-sm text-muted-foreground mt-1">
            This chart shows which AI model users preferred over the last 10 days.
            {data.openaiTrend.reduce((a, b) => a + b, 0) > data.anthropicTrend.reduce((a, b) => a + b, 0) 
              ? ' Overall, OpenAI has been the more popular choice.' 
              : ' Overall, Anthropic has been the more popular choice.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}