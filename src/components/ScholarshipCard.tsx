import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, DollarSign, Calendar, CheckCircle2, ExternalLink, Youtube, FileText, MapPin, Building2, Clock, Shield } from "lucide-react";

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: string;
  deadline: string | null;
  eligibility_summary: string;
  apply_url: string;
  source_url: string;
  source: string;
  official_domain: string;
  status: string;
  target_academic_level: string[] | null;
  target_locations: string[] | null;
  category_criteria: string[] | null;
  income_criteria: string | null;
  minimum_percentage: number | null;
  required_documents: string[];
  youtube_tutorial_url: string | null;
  youtube_tutorial_title: string | null;
  youtube_tutorial_channel: string | null;
  verified_at: string | null;
  created_at: string;
}

interface ScholarshipCardProps {
  scholarship: Scholarship;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isPersonalized?: boolean;
  matchReason?: string;
}

// Determine provider type from provider name or source
function getProviderType(scholarship: Scholarship): 'government' | 'private' | 'ngo' {
  const provider = scholarship.provider?.toLowerCase() || '';
  const source = scholarship.source?.toLowerCase() || '';
  const name = scholarship.name?.toLowerCase() || '';
  
  const govKeywords = ['government', 'ministry', 'national', 'central', 'state', 'pradhan mantri', 'pm ', 
                       'nsp', 'scholarship portal', 'department', 'welfare', 'sc/st', 'obc', 'minority'];
  const ngoKeywords = ['foundation', 'trust', 'ngo', 'society', 'charitable', 'welfare society'];
  
  if (govKeywords.some(k => provider.includes(k) || name.includes(k) || source.includes(k))) {
    return 'government';
  }
  if (ngoKeywords.some(k => provider.includes(k) || name.includes(k))) {
    return 'ngo';
  }
  return 'private';
}

function getProviderBadge(type: 'government' | 'private' | 'ngo') {
  switch (type) {
    case 'government':
      return { label: 'Government', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' };
    case 'ngo':
      return { label: 'NGO', className: 'bg-purple-500/10 text-purple-600 border-purple-500/30' };
    case 'private':
      return { label: 'Private', className: 'bg-blue-500/10 text-blue-600 border-blue-500/30' };
  }
}

function getDaysUntilDeadline(deadline: string): number {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default function ScholarshipCard({ 
  scholarship, 
  isFavorite, 
  onToggleFavorite,
  isPersonalized,
  matchReason 
}: ScholarshipCardProps) {
  const daysLeft = scholarship.deadline ? getDaysUntilDeadline(scholarship.deadline) : null;
  const isUrgent = daysLeft !== null && daysLeft <= 30 && daysLeft > 0;
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const providerType = getProviderType(scholarship);
  const providerBadge = getProviderBadge(providerType);

  return (
    <Card 
      className={`hover:shadow-xl hover:border-primary/40 transition-all duration-300 group relative ${
        isUrgent ? 'border-orange-500' : ''
      } ${isExpired ? 'opacity-60' : ''}`}
    >
      {isPersonalized && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-gradient-to-r from-primary to-accent text-white shadow-lg text-xs">
            <Shield className="h-3 w-3 mr-1" />
            For You
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline" className={providerBadge.className}>
                <Building2 className="h-3 w-3 mr-1" />
                {providerBadge.label}
              </Badge>
              {isUrgent && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  Urgent
                </Badge>
              )}
              {isExpired && (
                <Badge variant="secondary" className="text-xs">
                  Closed
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
              {scholarship.name}
            </CardTitle>
            <CardDescription className="text-sm mt-1 flex items-center gap-1">
              <DollarSign className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{scholarship.provider}</span>
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
            onClick={onToggleFavorite}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
            />
          </Button>
        </div>
        
        {/* Amount Badge */}
        <Badge className="w-fit bg-gradient-to-r from-accent to-accent/80 text-white font-bold mt-2">
          {scholarship.amount}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Location & State */}
        {scholarship.target_locations && scholarship.target_locations.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {scholarship.target_locations.slice(0, 3).map((loc, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {loc}
                </Badge>
              ))}
              {scholarship.target_locations.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{scholarship.target_locations.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Eligibility Summary */}
        <div>
          <h4 className="text-sm font-semibold mb-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Eligibility
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {scholarship.eligibility_summary}
          </p>
        </div>

        {/* Deadline */}
        {scholarship.deadline && (
          <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={isUrgent ? 'text-orange-600 font-medium' : ''}>
                {isExpired ? 'Deadline passed' : daysLeft !== null ? `${daysLeft} days left` : ''}
              </span>
            </div>
            <span className="text-muted-foreground text-xs">
              {formatDate(scholarship.deadline)}
            </span>
          </div>
        )}

        {/* Documents Required */}
        {scholarship.required_documents && scholarship.required_documents.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
              <FileText className="h-3 w-3" />
              Documents ({scholarship.required_documents.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {scholarship.required_documents.slice(0, 2).map((doc, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">{doc}</Badge>
              ))}
              {scholarship.required_documents.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{scholarship.required_documents.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Last Updated */}
        {scholarship.verified_at && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last updated: {formatDate(scholarship.verified_at)}
          </div>
        )}

        {/* View Details Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full hover:scale-[1.02] transition-transform"
              disabled={isExpired}
            >
              {isExpired ? 'Application Closed' : 'View Details'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={providerBadge.className}>
                  {providerBadge.label}
                </Badge>
                <Badge className="bg-gradient-to-r from-accent to-accent/80 text-white">
                  {scholarship.amount}
                </Badge>
              </div>
              <DialogTitle className="text-xl">{scholarship.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {scholarship.provider}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              {/* State / Location */}
              {scholarship.target_locations && scholarship.target_locations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Available In
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {scholarship.target_locations.map((loc, idx) => (
                      <Badge key={idx} variant="secondary">{loc}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Eligibility */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Eligibility Criteria
                </h4>
                <p className="text-sm text-muted-foreground">{scholarship.eligibility_summary}</p>
              </div>

              {/* Academic Levels */}
              {scholarship.target_academic_level && scholarship.target_academic_level.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Target Academic Level</h4>
                  <div className="flex flex-wrap gap-2">
                    {scholarship.target_academic_level.map((level, idx) => (
                      <Badge key={idx} variant="secondary">{level}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Criteria */}
              {scholarship.category_criteria && scholarship.category_criteria.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Category</h4>
                  <div className="flex flex-wrap gap-2">
                    {scholarship.category_criteria.map((cat, idx) => (
                      <Badge key={idx} variant="outline">{cat}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Minimum Percentage */}
              {scholarship.minimum_percentage && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <span className="font-medium">Minimum Percentage:</span>
                  <span>{scholarship.minimum_percentage}%</span>
                </div>
              )}

              {/* Income Criteria */}
              {scholarship.income_criteria && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <span className="font-medium">Income Criteria:</span>
                  <span>{scholarship.income_criteria}</span>
                </div>
              )}

              {/* Required Documents */}
              {scholarship.required_documents && scholarship.required_documents.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Required Documents
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {scholarship.required_documents.map((doc, idx) => (
                      <Badge key={idx} variant="outline">{doc}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Deadline */}
              {scholarship.deadline && (
                <div className="flex items-center gap-2 text-sm p-3 bg-muted rounded-lg">
                  <Calendar className="h-4 w-4" />
                  <span>Application Deadline: <strong>{formatDate(scholarship.deadline)}</strong></span>
                  {daysLeft !== null && daysLeft > 0 && (
                    <Badge variant={isUrgent ? "destructive" : "secondary"}>
                      {daysLeft} days left
                    </Badge>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button 
                  className="flex-1 hover:scale-[1.02] transition-transform bg-gradient-to-r from-primary to-accent hover:shadow-lg" 
                  asChild
                  disabled={isExpired}
                >
                  <a href={scholarship.apply_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Apply Now
                  </a>
                </Button>
                {scholarship.youtube_tutorial_url && (
                  <Button variant="outline" className="flex-1 hover:scale-[1.02] transition-transform" asChild>
                    <a href={scholarship.youtube_tutorial_url} target="_blank" rel="noopener noreferrer">
                      <Youtube className="h-4 w-4 mr-2 text-red-500" />
                      How to Apply
                    </a>
                  </Button>
                )}
              </div>

              {/* Source Info */}
              <div className="text-xs text-muted-foreground pt-2 border-t flex flex-wrap gap-2">
                <span>Official: {scholarship.official_domain}</span>
                {scholarship.verified_at && (
                  <span>• Last verified: {formatDate(scholarship.verified_at)}</span>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
