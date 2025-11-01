import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Plus, Edit, Trash2, Briefcase } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Career {
  id: string;
  title: string;
  description: string;
  category: string | null;
  requirements: string | null;
  skills_required: string[] | null;
  salary_range: string | null;
  industry: string | null;
  job_type: string | null;
}

const ManageCareers = () => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    requirements: '',
    skills_required: '',
    salary_range: '',
    industry: '',
    job_type: ''
  });

  useEffect(() => {
    loadCareers();
  }, []);

  const loadCareers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('careers')
      .select('*')
      .order('title');

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load careers',
        variant: 'destructive',
      });
    } else {
      setCareers(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const careerData = {
      title: formData.title,
      description: formData.description,
      category: formData.category || null,
      requirements: formData.requirements || null,
      skills_required: formData.skills_required ? formData.skills_required.split(',').map(s => s.trim()) : null,
      salary_range: formData.salary_range || null,
      industry: formData.industry || null,
      job_type: formData.job_type || null
    };

    if (editingCareer) {
      const { error } = await supabase
        .from('careers')
        .update(careerData)
        .eq('id', editingCareer.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update career',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Success', description: 'Career updated successfully' });
        resetForm();
        loadCareers();
      }
    } else {
      const { error } = await supabase
        .from('careers')
        .insert(careerData);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to add career',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Success', description: 'Career added successfully' });
        resetForm();
        loadCareers();
      }
    }
  };

  const handleEdit = (career: Career) => {
    setEditingCareer(career);
    setFormData({
      title: career.title,
      description: career.description,
      category: career.category || '',
      requirements: career.requirements || '',
      skills_required: career.skills_required?.join(', ') || '',
      salary_range: career.salary_range || '',
      industry: career.industry || '',
      job_type: career.job_type || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this career?')) return;

    const { error } = await supabase
      .from('careers')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete career',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Success', description: 'Career deleted successfully' });
      loadCareers();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      requirements: '',
      skills_required: '',
      salary_range: '',
      industry: '',
      job_type: ''
    });
    setEditingCareer(null);
    setDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Briefcase className="h-8 w-8" />
              Manage Careers
            </h1>
            <p className="text-muted-foreground mt-1">
              Career opportunities and guidance
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Career
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCareer ? 'Edit Career' : 'Add New Career'}</DialogTitle>
                <DialogDescription>
                  {editingCareer ? 'Update career information' : 'Add a new career opportunity'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Career Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Engineering, Medical, Business, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      placeholder="IT, Healthcare, Finance, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="job_type">Job Type</Label>
                    <Select
                      value={formData.job_type}
                      onValueChange={(value) => setFormData({ ...formData, job_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Non-Technical">Non-Technical</SelectItem>
                        <SelectItem value="Both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="salary_range">Salary Range</Label>
                    <Input
                      id="salary_range"
                      value={formData.salary_range}
                      onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                      placeholder="₹3-6 LPA, ₹10-15 LPA, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="skills_required">Skills Required (comma-separated)</Label>
                    <Input
                      id="skills_required"
                      value={formData.skills_required}
                      onChange={(e) => setFormData({ ...formData, skills_required: e.target.value })}
                      placeholder="Python, Communication, Problem Solving"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      rows={4}
                      placeholder="Educational qualifications, skills, experience..."
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCareer ? 'Update' : 'Add'} Career
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Careers ({careers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {careers.map((career) => (
                    <TableRow key={career.id}>
                      <TableCell className="font-medium">{career.title}</TableCell>
                      <TableCell>{career.category || 'N/A'}</TableCell>
                      <TableCell className="max-w-md truncate">{career.description}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(career)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(career.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ManageCareers;