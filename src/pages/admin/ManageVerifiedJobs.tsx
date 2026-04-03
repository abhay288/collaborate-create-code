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
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';

const ManageVerifiedJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    role: '',
    company: '',
    location: '',
    salary_range: '',
    apply_url: '',
    source_site: '',
    posting_date: new Date().toISOString().split('T')[0],
    required_skills: '',
    required_education: '',
    experience_required: '',
    job_type: '',
    is_active: true
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('verified_jobs')
        .select('*')
        .order('posting_date', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const jobData = {
        ...formData,
        required_skills: formData.required_skills.split(',').map(s => s.trim()),
        required_education: formData.required_education.split(',').map(e => e.trim()),
        posting_date: new Date(formData.posting_date).toISOString(),
        verified_by: 'Admin',
        verified_at: new Date().toISOString()
      };

      if (editingJob) {
        const { error } = await supabase
          .from('verified_jobs')
          .update(jobData)
          .eq('id', editingJob.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Job updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('verified_jobs')
          .insert([jobData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Job added successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchJobs();
    } catch (error) {
      console.error('Error saving job:', error);
      toast({
        title: "Error",
        description: "Failed to save job",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (job: any) => {
    setEditingJob(job);
    setFormData({
      role: job.role,
      company: job.company,
      location: job.location,
      salary_range: job.salary_range || '',
      apply_url: job.apply_url,
      source_site: job.source_site,
      posting_date: new Date(job.posting_date).toISOString().split('T')[0],
      required_skills: job.required_skills?.join(', ') || '',
      required_education: job.required_education?.join(', ') || '',
      experience_required: job.experience_required || '',
      job_type: job.job_type || '',
      is_active: job.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const { error } = await supabase
        .from('verified_jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job deleted successfully",
      });

      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingJob(null);
    setFormData({
      role: '',
      company: '',
      location: '',
      salary_range: '',
      apply_url: '',
      source_site: '',
      posting_date: new Date().toISOString().split('T')[0],
      required_skills: '',
      required_education: '',
      experience_required: '',
      job_type: '',
      is_active: true
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Manage Verified Jobs</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingJob ? 'Edit Job' : 'Add New Job'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Job Role *</Label>
                      <Input
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Noida, Uttar Pradesh"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary_range">Salary Range</Label>
                      <Input
                        id="salary_range"
                        value={formData.salary_range}
                        onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                        placeholder="e.g., ₹15,000 - ₹25,000 per month"
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
                      <Label htmlFor="source_site">Source Site *</Label>
                      <Select value={formData.source_site} onValueChange={(value) => setFormData({ ...formData, source_site: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Naukri.com">Naukri.com</SelectItem>
                          <SelectItem value="LinkedIn Jobs">LinkedIn Jobs</SelectItem>
                          <SelectItem value="Indeed">Indeed</SelectItem>
                          <SelectItem value="Company Website">Company Website</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="posting_date">Posting Date *</Label>
                      <Input
                        id="posting_date"
                        type="date"
                        value={formData.posting_date}
                        onChange={(e) => setFormData({ ...formData, posting_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="job_type">Job Type *</Label>
                      <Select value={formData.job_type} onValueChange={(value) => setFormData({ ...formData, job_type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience_required">Experience Required</Label>
                      <Input
                        id="experience_required"
                        value={formData.experience_required}
                        onChange={(e) => setFormData({ ...formData, experience_required: e.target.value })}
                        placeholder="e.g., 0-1 years"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="required_education">Required Education (comma-separated) *</Label>
                      <Input
                        id="required_education"
                        value={formData.required_education}
                        onChange={(e) => setFormData({ ...formData, required_education: e.target.value })}
                        placeholder="e.g., UG, PG"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="required_skills">Required Skills (comma-separated) *</Label>
                    <Textarea
                      id="required_skills"
                      value={formData.required_skills}
                      onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                      placeholder="e.g., Programming, Problem Solving, Java"
                      rows={2}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingJob ? 'Update' : 'Add'} Job
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No jobs found. Add your first verified job posting.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.role}</TableCell>
                    <TableCell>{job.company}</TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{job.source_site}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(job.posting_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {job.is_active ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(job.apply_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(job)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(job.id)}
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

export default ManageVerifiedJobs;
