import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, ExternalLink, CheckCircle, XCircle } from 'lucide-react';

const ManageVerifiedScholarships = () => {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    source: '',
    source_url: '',
    eligibility_summary: '',
    amount: '',
    deadline: '',
    apply_url: '',
    official_domain: '',
    required_documents: '',
    youtube_tutorial_title: '',
    youtube_tutorial_channel: '',
    youtube_tutorial_url: '',
    status: 'open',
    target_academic_level: '',
    target_locations: '',
    minimum_percentage: '',
    income_criteria: '',
    category_criteria: ''
  });

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      const { data, error } = await supabase
        .from('verified_scholarships')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScholarships(data || []);
    } catch (error) {
      console.error('Error fetching scholarships:', error);
      toast({
        title: "Error",
        description: "Failed to fetch scholarships",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const scholarshipData = {
        ...formData,
        required_documents: formData.required_documents.split(',').map(d => d.trim()),
        target_academic_level: formData.target_academic_level.split(',').map(l => l.trim()),
        target_locations: formData.target_locations.split(',').map(l => l.trim()),
        category_criteria: formData.category_criteria ? formData.category_criteria.split(',').map(c => c.trim()) : [],
        minimum_percentage: formData.minimum_percentage ? parseFloat(formData.minimum_percentage) : null,
        verified_by: 'Admin',
        verified_at: new Date().toISOString()
      };

      if (editingScholarship) {
        const { error } = await supabase
          .from('verified_scholarships')
          .update(scholarshipData)
          .eq('id', editingScholarship.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Scholarship updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('verified_scholarships')
          .insert([scholarshipData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Scholarship added successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchScholarships();
    } catch (error) {
      console.error('Error saving scholarship:', error);
      toast({
        title: "Error",
        description: "Failed to save scholarship",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (scholarship: any) => {
    setEditingScholarship(scholarship);
    setFormData({
      name: scholarship.name,
      provider: scholarship.provider,
      source: scholarship.source,
      source_url: scholarship.source_url,
      eligibility_summary: scholarship.eligibility_summary,
      amount: scholarship.amount,
      deadline: scholarship.deadline ? new Date(scholarship.deadline).toISOString().split('T')[0] : '',
      apply_url: scholarship.apply_url,
      official_domain: scholarship.official_domain,
      required_documents: scholarship.required_documents?.join(', ') || '',
      youtube_tutorial_title: scholarship.youtube_tutorial_title || '',
      youtube_tutorial_channel: scholarship.youtube_tutorial_channel || '',
      youtube_tutorial_url: scholarship.youtube_tutorial_url || '',
      status: scholarship.status,
      target_academic_level: scholarship.target_academic_level?.join(', ') || '',
      target_locations: scholarship.target_locations?.join(', ') || '',
      minimum_percentage: scholarship.minimum_percentage?.toString() || '',
      income_criteria: scholarship.income_criteria || '',
      category_criteria: scholarship.category_criteria?.join(', ') || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scholarship?')) return;

    try {
      const { error } = await supabase
        .from('verified_scholarships')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scholarship deleted successfully",
      });

      fetchScholarships();
    } catch (error) {
      console.error('Error deleting scholarship:', error);
      toast({
        title: "Error",
        description: "Failed to delete scholarship",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingScholarship(null);
    setFormData({
      name: '',
      provider: '',
      source: '',
      source_url: '',
      eligibility_summary: '',
      amount: '',
      deadline: '',
      apply_url: '',
      official_domain: '',
      required_documents: '',
      youtube_tutorial_title: '',
      youtube_tutorial_channel: '',
      youtube_tutorial_url: '',
      status: 'open',
      target_academic_level: '',
      target_locations: '',
      minimum_percentage: '',
      income_criteria: '',
      category_criteria: ''
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Manage Verified Scholarships</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Scholarship
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingScholarship ? 'Edit Scholarship' : 'Add New Scholarship'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Scholarship Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="provider">Provider *</Label>
                      <Input
                        id="provider"
                        value={formData.provider}
                        onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="source">Source *</Label>
                      <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NSP">National Scholarship Portal</SelectItem>
                          <SelectItem value="UP Portal">UP Scholarship Portal</SelectItem>
                          <SelectItem value="Buddy4Study">Buddy4Study</SelectItem>
                          <SelectItem value="Careers360">Careers360</SelectItem>
                          <SelectItem value="Shiksha">Shiksha</SelectItem>
                          <SelectItem value="Official Website">Official Website</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="source_url">Source URL *</Label>
                      <Input
                        id="source_url"
                        type="url"
                        value={formData.source_url}
                        onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="e.g., ₹10,000 per year"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Deadline</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apply_url">Apply URL *</Label>
                      <Input
                        id="apply_url"
                        type="url"
                        value={formData.apply_url}
                        onChange={(e) => setFormData({ ...formData, apply_url: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="official_domain">Official Domain *</Label>
                      <Input
                        id="official_domain"
                        value={formData.official_domain}
                        onChange={(e) => setFormData({ ...formData, official_domain: e.target.value })}
                        placeholder="e.g., scholarships.gov.in"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="coming_soon">Coming Soon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="target_academic_level">Academic Levels (comma-separated) *</Label>
                      <Input
                        id="target_academic_level"
                        value={formData.target_academic_level}
                        onChange={(e) => setFormData({ ...formData, target_academic_level: e.target.value })}
                        placeholder="e.g., UG, PG, Diploma"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="target_locations">Target Locations (comma-separated) *</Label>
                      <Input
                        id="target_locations"
                        value={formData.target_locations}
                        onChange={(e) => setFormData({ ...formData, target_locations: e.target.value })}
                        placeholder="e.g., Uttar Pradesh, National"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minimum_percentage">Minimum Percentage</Label>
                      <Input
                        id="minimum_percentage"
                        type="number"
                        step="0.01"
                        value={formData.minimum_percentage}
                        onChange={(e) => setFormData({ ...formData, minimum_percentage: e.target.value })}
                        placeholder="e.g., 55"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="eligibility_summary">Eligibility Summary *</Label>
                    <Textarea
                      id="eligibility_summary"
                      value={formData.eligibility_summary}
                      onChange={(e) => setFormData({ ...formData, eligibility_summary: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="required_documents">Required Documents (comma-separated) *</Label>
                    <Textarea
                      id="required_documents"
                      value={formData.required_documents}
                      onChange={(e) => setFormData({ ...formData, required_documents: e.target.value })}
                      placeholder="e.g., Aadhar Card, Income Certificate, Bank Details"
                      rows={2}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="income_criteria">Income Criteria</Label>
                    <Input
                      id="income_criteria"
                      value={formData.income_criteria}
                      onChange={(e) => setFormData({ ...formData, income_criteria: e.target.value })}
                      placeholder="e.g., Family income < ₹1.5 lakh/year"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category_criteria">Category Criteria (comma-separated)</Label>
                    <Input
                      id="category_criteria"
                      value={formData.category_criteria}
                      onChange={(e) => setFormData({ ...formData, category_criteria: e.target.value })}
                      placeholder="e.g., SC, ST, OBC, Minority"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="youtube_tutorial_title">YouTube Tutorial Title</Label>
                      <Input
                        id="youtube_tutorial_title"
                        value={formData.youtube_tutorial_title}
                        onChange={(e) => setFormData({ ...formData, youtube_tutorial_title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtube_tutorial_channel">YouTube Channel</Label>
                      <Input
                        id="youtube_tutorial_channel"
                        value={formData.youtube_tutorial_channel}
                        onChange={(e) => setFormData({ ...formData, youtube_tutorial_channel: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube_tutorial_url">YouTube Tutorial URL</Label>
                    <Input
                      id="youtube_tutorial_url"
                      type="url"
                      value={formData.youtube_tutorial_url}
                      onChange={(e) => setFormData({ ...formData, youtube_tutorial_url: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingScholarship ? 'Update' : 'Add'} Scholarship
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading scholarships...</div>
          ) : scholarships.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No scholarships found. Add your first verified scholarship.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scholarships.map((scholarship) => (
                  <TableRow key={scholarship.id}>
                    <TableCell className="font-medium">{scholarship.name}</TableCell>
                    <TableCell>{scholarship.provider}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{scholarship.source}</Badge>
                    </TableCell>
                    <TableCell>{scholarship.amount}</TableCell>
                    <TableCell>
                      {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {scholarship.status === 'open' ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Open
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          {scholarship.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(scholarship.apply_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(scholarship)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(scholarship.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageVerifiedScholarships;
