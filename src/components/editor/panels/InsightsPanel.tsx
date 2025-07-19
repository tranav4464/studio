import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gauge, Sparkles, MessageSquare, Activity, BarChart2, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Suggestion {
  id: string;
  type: 'tone' | 'readability' | 'seo' | 'engagement';
  message: string;
  severity: 'low' | 'medium' | 'high';
  action?: () => void;
}

interface Stats {
  wordCount: number;
  characterCount: number;
  readingTime: number;
  readabilityScore: number;
  keywordDensity: number;
}

interface InsightsPanelProps {
  stats: Stats;
  suggestions: Suggestion[];
  onApplySuggestion?: (id: string) => void;
  className?: string;
  hideComments?: boolean;
}

export function InsightsPanel({
  stats,
  suggestions,
  onApplySuggestion,
  className,
}: InsightsPanelProps) {
  const [activeTab, setActiveTab] = useState('stats');
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);

  const displayedSuggestions = showAllSuggestions ? suggestions : suggestions.slice(0, 3);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <Tabs 
        defaultValue="stats" 
        className="flex-1 flex flex-col"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-transparent p-0">
          <TabsTrigger 
            value="stats" 
            className="py-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            <span>Stats</span>
          </TabsTrigger>
          <TabsTrigger 
            value="suggestions" 
            className="py-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            <span>Suggestions</span>
            {suggestions.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {suggestions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="comments" 
            className="py-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            <span>Comments</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="stats" className="m-0 p-4">
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <Gauge className="h-4 w-4 mr-2" />
                  Document Stats
                </h4>
                <div className="space-y-3">
                  <StatItem label="Words" value={stats.wordCount} />
                  <StatItem label="Characters" value={stats.characterCount} />
                  <StatItem label="Reading Time" value={`${stats.readingTime} min`} />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Content Analysis
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Readability</span>
                      <span className="font-medium">{stats.readabilityScore}/100</span>
                    </div>
                    <Progress value={stats.readabilityScore} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.readabilityScore > 70 ? 'Good' : 'Could be improved'}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Keyword Density</span>
                      <span className="font-medium">{stats.keywordDensity}%</span>
                    </div>
                    <Progress 
                      value={stats.keywordDensity} 
                      className={cn(
                        "h-2",
                        stats.keywordDensity > 3 ? 'bg-yellow-500' : ''
                      )} 
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.keywordDensity > 3 
                        ? 'High - consider reducing' 
                        : stats.keywordDensity < 1 
                          ? 'Low - consider adding more' 
                          : 'Optimal'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="m-0 p-4">
            <div className="space-y-4">
              {suggestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto mb-2" />
                  <p>No suggestions yet. Keep writing!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {displayedSuggestions.map((suggestion) => (
                      <div 
                        key={suggestion.id}
                        className={cn(
                          "p-3 rounded-lg border",
                          suggestion.severity === 'high' ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20' :
                          suggestion.severity === 'medium' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20' :
                          'border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/20'
                        )}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 pt-0.5">
                            <AlertCircle className={cn(
                              "h-4 w-4",
                              suggestion.severity === 'high' ? 'text-red-500' :
                              suggestion.severity === 'medium' ? 'text-yellow-500' :
                              'text-blue-500'
                            )} />
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm">{suggestion.message}</p>
                            {suggestion.action && (
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="h-auto p-0 mt-1 text-xs"
                                onClick={() => onApplySuggestion?.(suggestion.id)}
                              >
                                Apply fix
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {suggestions.length > 3 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                    >
                      {showAllSuggestions ? 'Show less' : `Show all (${suggestions.length})`}
                    </Button>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="m-0 p-4">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
              <h4 className="font-medium mb-1">No comments yet</h4>
              <p className="text-sm text-muted-foreground max-w-xs">
                Add comments to collaborate with your team or leave notes for yourself.
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                Add Comment
              </Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
