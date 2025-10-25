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
import { Plus, Edit, Trash2, GraduationCap, CheckCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
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
import { Badge } from '@/components/ui/badge';

interface Scholarship {
  id: string;
  title: string;
  description: string;
  eligibility_criteria: string;
  type: 'government' | 'private' | 'ngo';
  amount: number | null;
  deadline: string | null;
  application_link: string | null;
  verified: boolean;
}

const ManageScholarships = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eligibility_criteria: '',
    type: 'government' as 'government' | 'private' | 'ngo',
    amount: '',
    deadline: '',
    application_link: '',
    verified: false
  });

  useEffect(() => {
    loadScholarships();
  }, []);

  const loadScholarships = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .order('verified', { ascending: false })
      .order('deadline', { ascending: true });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load scholarships',
        variant: 'destructive',
      });
    } else {
      setScholarships(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const scholarshipData = {
      title: formData.title,
      description: formData.description,
      eligibility_criteria: formData.eligibility_criteria,
      type: formData.type,
      amount: formData.amount ? parseFloat(formData.amount) : null,
      deadline: formData.deadline || null,
      application_link: formData.application_link || null,
      verified: formData.verified
    };

    if (editingScholarship) {
      const { error } = await supabase
        .from('scholarships')
        .update(scholarshipData)
        .eq('id', editingScholarship.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update scholarship',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Success', description: 'Scholarship updated successfully' });
        resetForm();
        loadScholarships();
      }
    } else {
      const { error } = await supabase
        .from('scholarships')
        .insert(scholarshipData);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to add scholarship',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Success', description: 'Scholarship added successfully' });
        resetForm();
        loadScholarships();
      }
    }
  };

  const handleEdit = (scholarship: Scholarship) => {
    setEditingScholarship(scholarship);
    setFormData({
      title: scholarship.title,
      description: scholarship.description,
      eligibility_criteria: scholarship.eligibility_criteria,
      type: scholarship.type,
      amount: scholarship.amount?.toString() || '',
      deadline: scholarship.deadline || '',
      application_link: scholarship.application_link || '',
      verified: scholarship.verified
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scholarship?')) return;

    const { error } = await supabase
      .from('scholarships')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete scholarship',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Success', description: 'Scholarship deleted successfully' });
      loadScholarships();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      eligibility_criteria: '',
      type: 'government',
      amount: '',
      deadline: '',
      application_link: '',
      verified: false
    });
    setEditingScholarship(null);
    setDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GraduationCap className="h-8 w-8" />
              Manage Scholarships
            </h1>
            <p className="text-muted-foreground mt-1">
              Verified scholarships from trusted sources
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Scholarship
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingScholarship ? 'Edit Scholarship' : 'Add New Scholarship'}</DialogTitle>
                <DialogDescription>
                  {editingScholarship ? 'Update scholarship information' : 'Add a verified scholarship from a trusted source'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Scholarship Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: 'government' | 'private' | 'ngo') => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="government">Government</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="ngo">NGO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deadline">Deadline</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                      <Switch
                        id="verified"
                        checked={formData.verified}
                        onCheckedChange={(checked) => setFormData({ ...formData, verified: checked })}
                      />
                      <Label htmlFor="verified" className="cursor-pointer">
                        Verified from trusted source
                      </Label>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="application_link">Application Link</Label>
                    <Input
                      id="application_link"
                      type="url"
                      value={formData.application_link}
                      onChange={(e) => setFormData({ ...formData, application_link: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="eligibility">Eligibility Criteria *</Label>
                    <Textarea
                      id="eligibility"
                      value={formData.eligibility_criteria}
                      onChange={(e) => setFormData({ ...formData, eligibility_criteria: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>
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

        <Card>
          <CardHeader>
            <CardTitle>All Scholarships ({scholarships.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scholarships.map((scholarship) => (
                    <TableRow key={scholarship.id}>
                      <TableCell className="font-medium">{scholarship.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{scholarship.type}</Badge>
                      </TableCell>
                      <TableCell>{scholarship.amount ? `₹${scholarship.amount.toLocaleString()}` : 'Variable'}</TableCell>
                      <TableCell>
                        {scholarship.deadline 
                          ? new Date(scholarship.deadline).toLocaleDateString()
                          : 'No deadline'}
                      </TableCell>
                      <TableCell>
                        {scholarship.verified && (
                          <Badge variant="default" className="flex items-center gap-1 w-fit">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
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

export default ManageScholarships;