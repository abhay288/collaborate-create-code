import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Briefcase, 
  GraduationCap, 
  FileText, 
  ExternalLink, 
  Calendar, 
  Building2, 
  RefreshCw,
  Youtube,
  Users,
  Clock,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Bookmark
} from 'lucide-react';
import { useGovernmentOpportunities, GovJob, GovAdmission, GovAdmitCard } from '@/hooks/useGovernmentOpportunities';

export default function GovernmentOpportunities() {
  const { jobs, admissions, admitCards, loading, lastUpdated, refreshData } = useGovernmentOpportunities();
  const [selectedItem, setSelectedItem] = useState<GovJob | GovAdmission | GovAdmitCard | null>(null);
  const [itemType, setItemType] = useState<'job' | 'admission' | 'admitCard'>('job');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const openDetail = (item: GovJob | GovAdmission | GovAdmitCard, type: 'job' | 'admission' | 'admitCard') => {
    setSelectedItem(item);
    setItemType(type);
    setDialogOpen(true);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not specified';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const isUrgent = (dateStr: string | null) => {
    if (!dateStr) return false;
    try {
      const deadline = new Date(dateStr);
      const today = new Date();
      const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays > 0;
    } catch {
      return false;
    }
  };

  const totalCount = jobs.length + admissions.length + admitCards.length;

  // SarkariResult-style Job Row
  const JobRow = ({ job, index }: { job: GovJob; index: number }) => (
    <div 
      className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-all group border-b last:border-0"
      onClick={() => openDetail(job, 'job')}
    >
      <span className="text-sm font-medium text-muted-foreground w-8">{index + 1}.</span>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {job.title}
        </h4>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Building2 className="h-3 w-3" />
          {job.department || 'Government of India'}
          {job.total_posts && (
            <span className="text-accent font-medium">• {job.total_posts} Posts</span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isUrgent(job.last_date) && (
          <Badge variant="destructive" className="text-xs animate-pulse">
            Urgent
          </Badge>
        )}
        <Badge variant="outline" className="text-xs whitespace-nowrap">
          {formatDate(job.last_date)}
        </Badge>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </div>
  );

  // SarkariResult-style Admission Row
  const AdmissionRow = ({ admission, index }: { admission: GovAdmission; index: number }) => (
    <div 
      className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-all group border-b last:border-0"
      onClick={() => openDetail(admission, 'admission')}
    >
      <span className="text-sm font-medium text-muted-foreground w-8">{index + 1}.</span>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1">
          {admission.title}
        </h4>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <GraduationCap className="h-3 w-3" />
          {admission.authority || 'Education Authority'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isUrgent(admission.last_date) && (
          <Badge variant="destructive" className="text-xs animate-pulse">
            Urgent
          </Badge>
        )}
        <Badge variant="outline" className="text-xs whitespace-nowrap">
          {formatDate(admission.last_date)}
        </Badge>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
      </div>
    </div>
  );

  // SarkariResult-style Admit Card Row
  const AdmitCardRow = ({ admitCard, index }: { admitCard: GovAdmitCard; index: number }) => (
    <div 
      className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-all group border-b last:border-0"
      onClick={() => openDetail(admitCard, 'admitCard')}
    >
      <span className="text-sm font-medium text-muted-foreground w-8">{index + 1}.</span>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground group-hover:text-green-600 transition-colors line-clamp-1">
          {admitCard.title}
        </h4>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Building2 className="h-3 w-3" />
          {admitCard.department || 'Examination Authority'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {admitCard.status || 'Available'}
        </Badge>
        {admitCard.download_link && (
          <Button size="sm" variant="outline" className="text-xs h-7 px-2" asChild onClick={(e) => e.stopPropagation()}>
            <a href={admitCard.download_link} target="_blank" rel="noopener noreferrer">
              Download
            </a>
          </Button>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-green-600 transition-colors" />
      </div>
    </div>
  );

  // Detail Dialog
  const DetailDialog = () => {
    if (!selectedItem) return null;

    const isJob = itemType === 'job';
    const isAdmission = itemType === 'admission';
    const item = selectedItem as any;

    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              {isJob && <Briefcase className="h-5 w-5 text-primary" />}
              {isAdmission && <GraduationCap className="h-5 w-5 text-accent" />}
              {!isJob && !isAdmission && <FileText className="h-5 w-5 text-green-600" />}
              {item.title}
            </DialogTitle>
            <DialogDescription>
              {item.department || item.authority || 'Government of India'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Important Dates */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Important Dates
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Notification:</span>
                  <p className="font-medium">{formatDate(item.notification_date)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Date:</span>
                  <p className={`font-medium ${isUrgent(item.last_date) ? 'text-destructive' : ''}`}>
                    {formatDate(item.last_date)}
                    {isUrgent(item.last_date) && ' ⚠️'}
                  </p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid gap-4">
              {(isJob || isAdmission) && item.application_fee && (
                <div>
                  <h4 className="font-semibold mb-1 flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" />
                    Application Fee
                  </h4>
                  <p className="text-muted-foreground">{item.application_fee}</p>
                </div>
              )}

              {isJob && item.age_limit && (
                <div>
                  <h4 className="font-semibold mb-1">Age Limit</h4>
                  <p className="text-muted-foreground">{item.age_limit}</p>
                </div>
              )}

              {isJob && item.total_posts && (
                <div>
                  <h4 className="font-semibold mb-1 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Total Vacancies
                  </h4>
                  <p className="text-muted-foreground">{item.total_posts}</p>
                </div>
              )}

              {(isJob || isAdmission) && item.eligibility && (
                <div>
                  <h4 className="font-semibold mb-1">Eligibility Criteria</h4>
                  <p className="text-muted-foreground">{item.eligibility}</p>
                </div>
              )}

              {(isJob || isAdmission) && item.selection_process && (
                <div>
                  <h4 className="font-semibold mb-1">Selection Process</h4>
                  <p className="text-muted-foreground">{item.selection_process}</p>
                </div>
              )}
            </div>

            {/* YouTube Guide */}
            {item.youtube_guide && (
              <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-600">
                  <Youtube className="h-4 w-4" />
                  How to Apply (Video Guide)
                </h4>
                <Button variant="outline" className="border-red-200" asChild>
                  <a href={item.youtube_guide} target="_blank" rel="noopener noreferrer">
                    Watch Tutorial
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              {item.apply_link && (
                <Button className="flex-1 bg-gradient-to-r from-primary to-accent" asChild>
                  <a href={item.apply_link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Apply Online
                  </a>
                </Button>
              )}
              {item.notification_link && (
                <Button variant="outline" className="flex-1" asChild>
                  <a href={item.notification_link} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4 mr-2" />
                    Official Notification
                  </a>
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Source: Government Verified Sources (Sarkari Result)
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - SarkariResult Style */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-2 h-8 bg-primary rounded-full" />
            Live Government Opportunities
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {totalCount} Active Opportunities
            </Badge>
            {lastUpdated && (
              <span className="text-sm text-muted-foreground">
                Updated {new Date(lastUpdated).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>


      {/* Fallback message when no data */}
      {totalCount === 0 && !loading && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No opportunities loaded yet. <Button variant="link" className="p-0 h-auto" onClick={handleRefresh}>Click to fetch latest data</Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs - SarkariResult Style */}
      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid bg-muted/50">
          <TabsTrigger value="jobs" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Latest Jobs</span>
            <Badge variant="outline" className="ml-1 bg-background">{jobs.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="admissions" className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Admissions</span>
            <Badge variant="outline" className="ml-1 bg-background">{admissions.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="admitcards" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Admit Card</span>
            <Badge variant="outline" className="ml-1 bg-background">{admitCards.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Latest Jobs Tab */}
        <TabsContent value="jobs" className="mt-4">
          <Card className="border-primary/20">
            <CardHeader className="bg-primary/5 border-b border-primary/10 py-3">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <Briefcase className="h-5 w-5" />
                Latest Government Jobs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {jobs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No government jobs available at the moment</p>
                  <Button variant="link" onClick={handleRefresh}>Refresh to check for updates</Button>
                </div>
              ) : (
                <div className="divide-y">
                  {jobs.map((job, index) => (
                    <JobRow key={job.id} job={job} index={index} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admissions Tab */}
        <TabsContent value="admissions" className="mt-4">
          <Card className="border-accent/20">
            <CardHeader className="bg-accent/5 border-b border-accent/10 py-3">
              <CardTitle className="text-lg flex items-center gap-2 text-accent">
                <GraduationCap className="h-5 w-5" />
                Admission Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {admissions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No admissions available at the moment</p>
                  <Button variant="link" onClick={handleRefresh}>Refresh to check for updates</Button>
                </div>
              ) : (
                <div className="divide-y">
                  {admissions.map((admission, index) => (
                    <AdmissionRow key={admission.id} admission={admission} index={index} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admit Cards Tab */}
        <TabsContent value="admitcards" className="mt-4">
          <Card className="border-green-500/20">
            <CardHeader className="bg-green-500/5 border-b border-green-500/10 py-3">
              <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                <FileText className="h-5 w-5" />
                Admit Cards / Hall Tickets
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {admitCards.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No admit cards available at the moment</p>
                  <Button variant="link" onClick={handleRefresh}>Refresh to check for updates</Button>
                </div>
              ) : (
                <div className="divide-y">
                  {admitCards.map((card, index) => (
                    <AdmitCardRow key={card.id} admitCard={card} index={index} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DetailDialog />
    </div>
  );
}
