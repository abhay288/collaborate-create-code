import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Brain,
  TrendingUp,
  Users,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  XCircle,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react';

interface PerformanceData {
  recommendation_type: string;
  recommendation_id: string;
  total_interactions: number;
  unique_users: number;
  likes: number;
  dislikes: number;
  applications: number;
  rejections: number;
  engagement_score: number;
  conversion_rate: number;
}

const FeedbackAnalytics = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // Query feedback data directly and aggregate
      const { data: viewData, error: viewError } = await supabase
        .from('recommendation_feedback')
        .select('*');
      
      if (viewError) throw viewError;
      
      // Manually aggregate the data
      const aggregated = aggregatePerformanceData(viewData || []);
      setPerformanceData(aggregated);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load feedback analytics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const aggregatePerformanceData = (feedbackData: any[]): PerformanceData[] => {
    const grouped = feedbackData.reduce((acc, fb) => {
      const key = `${fb.recommendation_type}-${fb.recommendation_id}`;
      if (!acc[key]) {
        acc[key] = {
          recommendation_type: fb.recommendation_type,
          recommendation_id: fb.recommendation_id,
          total_interactions: 0,
          unique_users: new Set(),
          likes: 0,
          dislikes: 0,
          applications: 0,
          rejections: 0,
          scores: []
        };
      }
      
      acc[key].total_interactions++;
      acc[key].unique_users.add(fb.user_id);
      
      if (fb.feedback_type === 'like') acc[key].likes++;
      if (fb.feedback_type === 'dislike') acc[key].dislikes++;
      if (fb.feedback_type === 'applied') acc[key].applications++;
      if (fb.feedback_type === 'not_interested') acc[key].rejections++;
      
      const score = fb.feedback_type === 'applied' ? 10 :
                    fb.feedback_type === 'like' ? 5 :
                    fb.feedback_type === 'dislike' ? -3 :
                    fb.feedback_type === 'not_interested' ? -1 : 0;
      acc[key].scores.push(score);
      
      return acc;
    }, {} as any);
    
    return Object.values(grouped).map((item: any) => ({
      recommendation_type: item.recommendation_type,
      recommendation_id: item.recommendation_id,
      total_interactions: item.total_interactions,
      unique_users: item.unique_users.size,
      likes: item.likes,
      dislikes: item.dislikes,
      applications: item.applications,
      rejections: item.rejections,
      engagement_score: item.scores.length > 0 
        ? item.scores.reduce((a: number, b: number) => a + b, 0) / item.scores.length 
        : 0,
      conversion_rate: item.total_interactions > 0 
        ? (item.applications / item.total_interactions) * 100 
        : 0
    }));
  };

  const trainModel = async () => {
    try {
      setTraining(true);
      toast({
        title: 'Training Started',
        description: 'ML model training in progress...'
      });

      const { data, error } = await supabase.functions.invoke('train-recommendation-model');

      if (error) throw error;

      toast({
        title: 'Training Complete',
        description: `Model trained successfully. ${data.stats.updates_applied} confidence scores updated.`
      });

      await loadAnalytics();
    } catch (error) {
      console.error('Training error:', error);
      toast({
        title: 'Training Failed',
        description: error instanceof Error ? error.message : 'Failed to train model',
        variant: 'destructive'
      });
    } finally {
      setTraining(false);
    }
  };

  const jobData = performanceData.filter(d => d.recommendation_type === 'job');
  const collegeData = performanceData.filter(d => d.recommendation_type === 'college');
  const scholarshipData = performanceData.filter(d => d.recommendation_type === 'scholarship');

  const calculateTotals = (data: PerformanceData[]) => ({
    totalInteractions: data.reduce((sum, d) => sum + d.total_interactions, 0),
    totalUsers: new Set(data.flatMap(() => [])).size,
    totalLikes: data.reduce((sum, d) => sum + d.likes, 0),
    totalApplications: data.reduce((sum, d) => sum + d.applications, 0),
    avgEngagement: data.length > 0 
      ? (data.reduce((sum, d) => sum + (d.engagement_score || 0), 0) / data.length).toFixed(2)
      : '0',
    avgConversion: data.length > 0
      ? (data.reduce((sum, d) => sum + (d.conversion_rate || 0), 0) / data.length).toFixed(2)
      : '0'
  });

  const allTotals = calculateTotals(performanceData);

  const renderDataTable = (data: PerformanceData[], type: string) => (
    <div className="space-y-4">
      {data.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">No feedback data yet for {type}</p>
      ) : (
        <div className="grid gap-4">
          {data.slice(0, 10).map((item, index) => (
            <Card key={`${item.recommendation_id}-${index}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">
                      {type.charAt(0).toUpperCase() + type.slice(1)} ID: {item.recommendation_id.slice(0, 8)}...
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {item.unique_users} users
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Activity className="h-3 w-3 mr-1" />
                        {item.total_interactions} interactions
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {item.engagement_score?.toFixed(1) || '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="flex items-center gap-1 text-sm">
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                    <span>{item.likes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span>{item.applications}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <ThumbsDown className="h-4 w-4 text-orange-500" />
                    <span>{item.dislikes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>{item.rejections}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Conversion Rate</span>
                    <span className="font-medium">{item.conversion_rate?.toFixed(2) || '0'}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">ML Feedback Analytics</h1>
            <p className="text-muted-foreground">
              Real-time user feedback analysis and ML model training dashboard
            </p>
          </div>
          <Button 
            onClick={trainModel} 
            disabled={training}
            className="gap-2"
          >
            <Brain className="h-4 w-4" />
            {training ? 'Training...' : 'Train ML Model'}
          </Button>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Interactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{allTotals.totalInteractions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-green-500" />
                Likes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{allTotals.totalLikes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                Applied
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{allTotals.totalApplications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Avg Engagement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{allTotals.avgEngagement}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                Conversion
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{allTotals.avgConversion}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Items Tracked
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{performanceData.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendation Performance by Type</CardTitle>
            <CardDescription>
              Analyze user feedback patterns for jobs, colleges, and scholarships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="jobs">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="jobs">
                  Jobs ({jobData.length})
                </TabsTrigger>
                <TabsTrigger value="colleges">
                  Colleges ({collegeData.length})
                </TabsTrigger>
                <TabsTrigger value="scholarships">
                  Scholarships ({scholarshipData.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="jobs" className="mt-6">
                {renderDataTable(jobData, 'job')}
              </TabsContent>

              <TabsContent value="colleges" className="mt-6">
                {renderDataTable(collegeData, 'college')}
              </TabsContent>

              <TabsContent value="scholarships" className="mt-6">
                {renderDataTable(scholarshipData, 'scholarship')}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default FeedbackAnalytics;
