import React, { useState } from 'react';
import { ItineraryResult, Day } from '@shared/schema';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
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
    
    // Group activities by time (Morning, Afternoon, Evening) with consistent order
    const timeGroups = ['Morning', 'Afternoon', 'Evening'];
    const groupedActivities: Record<string, typeof day.activities> = {};
    
    // Initialize groups
    timeGroups.forEach(time => {
      groupedActivities[time] = day.activities.filter(a => 
        a.time?.includes(time) || 
        // If no time specified, make a best guess based on activity order
        (!a.time && 
          ((time === 'Morning' && day.activities.indexOf(a) < day.activities.length / 3) ||
           (time === 'Afternoon' && day.activities.indexOf(a) >= day.activities.length / 3 && day.activities.indexOf(a) < 2 * day.activities.length / 3) ||
           (time === 'Evening' && day.activities.indexOf(a) >= 2 * day.activities.length / 3))
        )
      );
    });
    
    // Ensure each time period has at least one empty slot for alignment
    timeGroups.forEach(time => {
      if (groupedActivities[time].length === 0) {
        groupedActivities[time] = [{ 
          title: "Free time", 
          description: "No specific activity scheduled for this time period.",
          type: "relaxation",
          isPlaceholder: true
        }];
      }
    });
    
    return (
      <div className="pl-11 space-y-4 pb-2">
        {isExpanded ? (
          <>
            {timeGroups.map(time => (
              <div key={time} className="mb-4">
                <div className={`rounded-md p-2 mb-3 ${
                  time === 'Morning' ? 'bg-amber-50 border border-amber-100' : 
                  time === 'Afternoon' ? 'bg-sky-50 border border-sky-100' : 
                  'bg-indigo-50 border border-indigo-100'
                }`}>
                  <div className="flex items-center">
                    <span className={`inline-block w-5 h-5 rounded-full mr-2 flex-shrink-0 ${
                      time === 'Morning' ? 'bg-amber-200' : 
                      time === 'Afternoon' ? 'bg-sky-200' : 
                      'bg-indigo-200'
                    }`}></span>
                    <h5 className="font-medium text-gray-800">{time}</h5>
                  </div>
                </div>
                {groupedActivities[time].length > 0 ? (
                  <div className="space-y-4">
                    {groupedActivities[time].map((activity, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-start bg-white p-3 rounded-md border ${activity.isPlaceholder ? 'border-gray-100 border-dashed' : 'border-gray-200'} shadow-sm`}
                      >
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full ${colors.light} flex items-center justify-center mr-3`}>
                          <i className={`fas ${getActivityIcon(activity.type)} ${colors.text} text-sm`}></i>
                        </div>
                        <div className="flex-grow">
                          <p className={`font-medium ${activity.isPlaceholder ? 'text-gray-500 italic' : ''}`}>
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          {activity.location && (
                            <p className="text-xs text-gray-500 mt-2 flex items-center">
                              <i className="fas fa-map-marker-alt mr-1"></i> {activity.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No activities scheduled</p>
                )}
              </div>
            ))}
            
            <button 
              className={`mt-2 ${colors.text} font-medium flex items-center hover:underline transition-all`}
              onClick={() => toggleDay(dayIndex)}
            >
              Hide day details
              <i className="fas fa-chevron-up ml-1"></i>
            </button>
          </>
        ) : (
          <>
            {/* Activity Preview in Collapsed State */}
            <div className="space-y-3 mb-2">
              {day.activities.slice(0, 2).map((activity, idx) => (
                <div key={idx} className="flex items-start bg-white p-2 rounded-md border border-gray-100">
                  <div className={`flex-shrink-0 h-7 w-7 rounded-full ${colors.light} flex items-center justify-center mr-2`}>
                    <i className={`fas ${getActivityIcon(activity.type)} ${colors.text} text-xs`}></i>
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-gray-600 line-clamp-1">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* See More Button */}
            <button 
              className={`${colors.text} font-medium flex items-center hover:underline transition-all`}
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
    <Card className="border overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow h-full flex flex-col">
      <CardHeader className={`p-6 text-white ${bgGradient} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-full h-full opacity-10">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 filter blur-xl"></div>
          <div className="absolute bottom-10 -left-20 w-60 h-60 rounded-full bg-white/10 filter blur-lg"></div>
        </div>
        
        <div className="flex justify-between items-center z-10 relative">
          <div>
            <div className="flex items-center mb-2">
              <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold mr-3 backdrop-blur-sm">
                {type === 'openai' ? 'A' : 'B'}
              </div>
              <motion.h3 
                className="font-heading font-bold text-2xl"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Itinerary {type === 'openai' ? 'A' : 'B'}
              </motion.h3>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm opacity-90 flex items-center">
                <i className={`fas ${type === 'openai' ? 'fa-robot' : 'fa-brain'} mr-2`}></i>
                AI Expert {type === 'openai' ? 'A' : 'B'}
                {revealed && (
                  <Badge variant="outline" className="ml-2 bg-white/20 font-semibold">
                    {itinerary.model}
                  </Badge>
                )}
              </p>
            </motion.div>
          </div>
          
          <motion.div 
            className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <i className={`fas ${type === 'openai' ? 'fa-microchip' : 'fa-brain'} text-xl`}></i>
          </motion.div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 flex-grow overflow-auto">
        {/* Summary */}
        <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <h4 className="text-lg font-semibold mb-2 flex items-center">
            <i className={`fas fa-clipboard-list ${colors.text} mr-2`}></i>
            Summary
          </h4>
          <p className="text-gray-600">{itinerary.summary}</p>
        </div>
        
        {/* Focus and Rating */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Badge variant="outline" className={`px-3 py-1 ${colors.light} ${colors.text} text-sm font-medium flex items-center`}>
            <i className="fas fa-bullseye mr-1.5"></i>
            {itinerary.focus}
          </Badge>
          
          <Badge variant="outline" className="px-3 py-1 bg-amber-50 text-amber-600 text-sm font-medium flex items-center">
            <i className="fas fa-star mr-1.5 text-yellow-400"></i>
            {itinerary.rating?.toFixed(1) || "4.0"} Rating
          </Badge>
        </div>
        
        {/* Highlights */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h4 className="text-lg font-semibold mb-3 flex items-center">
            <i className={`fas fa-award ${colors.text} mr-2`}></i>
            Highlights
          </h4>
          <div className="grid gap-2 grid-cols-1">
            {itinerary.highlights.map((highlight, idx) => (
              <motion.div 
                key={idx} 
                className="flex items-start p-3 rounded-lg bg-gray-50 border border-gray-100"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <div className={`flex-shrink-0 h-8 w-8 rounded-full ${colors.light} flex items-center justify-center mr-3`}>
                  <i className="fas fa-check text-green-500"></i>
                </div>
                <p className="text-gray-700">{highlight}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <Separator className="my-6" />
        
        {/* Days */}
        <h4 className="text-lg font-semibold mb-4 flex items-center">
          <i className={`fas fa-calendar-alt ${colors.text} mr-2`}></i>
          Daily Itinerary
        </h4>
        
        <div className="space-y-6">
          {itinerary.days.map((day, dayIndex) => (
            <motion.div 
              key={dayIndex} 
              className={`p-4 rounded-xl border ${colors.borderLight}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * dayIndex }}
            >
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-full ${colors.light} flex items-center justify-center ${colors.text} font-bold mr-3 shadow-sm`}>
                  {dayIndex + 1}
                </div>
                <h4 className="font-heading font-semibold text-lg">{day.title}</h4>
              </div>
              
              {renderDayActivities(day, dayIndex)}
            </motion.div>
          ))}
        </div>
        
        {/* Tips */}
        {itinerary.tips && itinerary.tips.length > 0 && (
          <div className="mt-8 p-5 rounded-xl bg-orange-50 border border-orange-100">
            <h4 className="font-semibold mb-3 flex items-center text-orange-700">
              <i className="fas fa-lightbulb text-orange-500 mr-2"></i>
              Travel Tips
            </h4>
            <ul className="space-y-3">
              {itinerary.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mr-3">
                    {idx + 1}
                  </div>
                  <span className="text-sm text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      
      <CardFooter className={`p-5 border-t ${type === 'openai' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100' : 'bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-100'}`}>
        <div className="w-full">
          <Button 
            className={`w-full ${
              type === 'openai' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' 
                : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700'
            } text-white py-5 rounded-xl text-lg font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5`}
            onClick={() => onSelectItinerary(type)}
          >
            <i className="fas fa-check-circle mr-2"></i>
            Choose This Itinerary
          </Button>
          
          {revealed && (
            <div className="text-center mt-4 flex flex-col items-center">
              <Badge className={`${
                type === 'openai'
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
              } px-3 py-1`}>
                <i className={`fas ${type === 'openai' ? 'fa-robot' : 'fa-brain'} mr-1.5`}></i>
                {itinerary.model || (type === 'openai' ? 'GPT-4o' : 'Claude 3.7 Sonnet')}
              </Badge>
              <p className="mt-2 text-sm text-gray-600">
                This itinerary was created by {type === 'openai' ? 'OpenAI' : 'Anthropic'}
              </p>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
