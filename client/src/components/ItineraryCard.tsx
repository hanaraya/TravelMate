import React, { useState } from 'react';
import { ItineraryResult, Day } from '@shared/schema';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HIGHLIGHT_COLORS } from '@/lib/constants';

interface ItineraryCardProps {
  itinerary: ItineraryResult;
  type: 'openai' | 'anthropic';
  onSelectItinerary: (type: 'openai' | 'anthropic') => void;
  revealed?: boolean;
}

export default function ItineraryCard({ 
  itinerary, 
  type, 
  onSelectItinerary,
  revealed = false 
}: ItineraryCardProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0]));
  
  const colors = HIGHLIGHT_COLORS[type];
  const bgGradient = type === 'openai' 
    ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
    : 'bg-gradient-to-r from-teal-500 to-teal-600';
  
  const toggleDay = (index: number) => {
    const newExpandedDays = new Set(expandedDays);
    if (newExpandedDays.has(index)) {
      newExpandedDays.delete(index);
    } else {
      newExpandedDays.add(index);
    }
    setExpandedDays(newExpandedDays);
  };

  const renderDayActivities = (day: Day, dayIndex: number) => {
    const isExpanded = expandedDays.has(dayIndex);
    
    return (
      <div className="pl-11 space-y-4">
        {isExpanded ? (
          <>
            {/* Morning */}
            <div>
              <h5 className="font-medium text-gray-800 mb-2">Morning</h5>
              {day.activities.filter(a => a.time?.includes('Morning')).map((activity, idx) => (
                <div key={idx} className="flex items-start mb-3">
                  <i className={`fas ${getActivityIcon(activity.type)} text-gray-500 mt-1 mr-3`}></i>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    {activity.location && (
                      <p className="text-xs text-gray-500 mt-1">
                        <i className="fas fa-map-marker-alt mr-1"></i> {activity.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Afternoon */}
            <div>
              <h5 className="font-medium text-gray-800 mb-2">Afternoon</h5>
              {day.activities.filter(a => a.time?.includes('Afternoon')).map((activity, idx) => (
                <div key={idx} className="flex items-start mb-3">
                  <i className={`fas ${getActivityIcon(activity.type)} text-gray-500 mt-1 mr-3`}></i>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    {activity.location && (
                      <p className="text-xs text-gray-500 mt-1">
                        <i className="fas fa-map-marker-alt mr-1"></i> {activity.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Evening */}
            <div>
              <h5 className="font-medium text-gray-800 mb-2">Evening</h5>
              {day.activities.filter(a => a.time?.includes('Evening')).map((activity, idx) => (
                <div key={idx} className="flex items-start mb-3">
                  <i className={`fas ${getActivityIcon(activity.type)} text-gray-500 mt-1 mr-3`}></i>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    {activity.location && (
                      <p className="text-xs text-gray-500 mt-1">
                        <i className="fas fa-map-marker-alt mr-1"></i> {activity.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              className={`${colors.text} font-medium flex items-center hover:underline`}
              onClick={() => toggleDay(dayIndex)}
            >
              Hide day details
              <i className="fas fa-chevron-up ml-1"></i>
            </button>
          </>
        ) : (
          <>
            {/* Activity Preview in Collapsed State */}
            {day.activities.slice(0, 2).map((activity, idx) => (
              <div key={idx} className="flex items-start">
                <i className={`fas ${getActivityIcon(activity.type)} text-gray-500 mt-1 mr-3`}></i>
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-600 line-clamp-1">{activity.description}</p>
                </div>
              </div>
            ))}
            
            {/* See More Button */}
            <button 
              className={`${colors.text} font-medium flex items-center hover:underline`}
              onClick={() => toggleDay(dayIndex)}
            >
              See full day details
              <i className="fas fa-chevron-down ml-1"></i>
            </button>
          </>
        )}
      </div>
    );
  };

  const getActivityIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'food': return 'fa-utensils';
      case 'dining': return 'fa-utensils';
      case 'culture': return 'fa-landmark';
      case 'adventure': return 'fa-hiking';
      case 'nature': return 'fa-tree';
      case 'shopping': return 'fa-shopping-bag';
      case 'transport': return 'fa-car';
      case 'entertainment': return 'fa-theater-masks';
      case 'nightlife': return 'fa-moon';
      case 'relaxation': return 'fa-spa';
      default: return 'fa-map-marker-alt';
    }
  };

  return (
    <Card className="border overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow">
      <CardHeader className={`p-4 text-white ${bgGradient}`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-heading font-semibold text-xl">
              Itinerary {type === 'openai' ? 'A' : 'B'}
            </h3>
            <p className="text-sm opacity-90">
              AI Expert {type === 'openai' ? 'A' : 'B'}
              {revealed && (
                <span className="ml-2 font-bold">({itinerary.model})</span>
              )}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <i className="fas fa-robot text-xl"></i>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5">
        {/* Summary */}
        <div className="mb-6">
          <p className="text-gray-600">{itinerary.summary}</p>
        </div>
        
        {/* Highlights */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-2">Highlights</h4>
          <ul className="space-y-1">
            {itinerary.highlights.map((highlight, idx) => (
              <li key={idx} className="flex items-start">
                <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Days */}
        {itinerary.days.map((day, dayIndex) => (
          <div key={dayIndex} className={dayIndex < itinerary.days.length - 1 ? "mb-8" : ""}>
            <div className="flex items-center mb-3">
              <div className={`w-8 h-8 rounded-full ${colors.light} flex items-center justify-center ${colors.text} font-bold mr-3`}>
                {dayIndex + 1}
              </div>
              <h4 className="font-heading font-semibold text-lg">{day.title}</h4>
            </div>
            {renderDayActivities(day, dayIndex)}
          </div>
        ))}
        
        {/* Tips */}
        {itinerary.tips && itinerary.tips.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h4 className="font-semibold mb-2">Travel Tips</h4>
            <ul className="space-y-2">
              {itinerary.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start">
                  <i className="fas fa-lightbulb text-yellow-500 mt-1 mr-2"></i>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-50 p-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 w-full">
          <div>
            <div className="flex items-center mb-1">
              <i className="fas fa-tag text-gray-500 mr-2"></i>
              <span className="text-sm font-medium">{itinerary.focus}</span>
            </div>
            <div className="flex items-center">
              {Array.from({ length: Math.floor(itinerary.rating || 4) }).map((_, i) => (
                <i key={i} className="fas fa-star text-yellow-400"></i>
              ))}
              {itinerary.rating && itinerary.rating % 1 !== 0 && (
                <i className="fas fa-star-half-alt text-yellow-400"></i>
              )}
            </div>
          </div>
          <Button 
            className={`w-full sm:w-auto ${type === 'openai' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-teal-600 hover:bg-teal-700'} text-white`}
            onClick={() => onSelectItinerary(type)}
          >
            Choose This Itinerary
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
