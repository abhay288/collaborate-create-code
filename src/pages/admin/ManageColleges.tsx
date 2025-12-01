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
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
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

interface College {
  id: string;
  college_name: string | null;
  s_no: number | null;
  state: string | null;
  district: string | null;
  college_type: string | null;
  website: string | null;
  affiliation: string | null;
  eligibility_criteria: string | null;
  naac_grade: string | null;
  fees: number | null;
  rating: number | null;
  courses_offered: string[] | null;
  contact_info: string | null;
  admission_link: string | null;
  location: string | null;
  cutoff_scores: any | null;
  established_year: string | null;
  is_active: boolean | null;
}

const UP_DISTRICTS = [
  'Agra', 'Aligarh', 'Allahabad', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Azamgarh',
  'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly', 'Basti',
  'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah',
  'Etawah', 'Faizabad', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar',
  'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur', 'Hardoi', 'Hathras',
  'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj',
  'Kaushambi', 'Kushinagar', 'Lakhimpur Kheri', 'Lalitpur', 'Lucknow', 'Maharajganj',
  'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar',
  'Pilibhit', 'Pratapgarh', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal', 'Sant Kabir Nagar',
  'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar', 'Sitapur', 'Sonbhadra', 'Sultanpur',
  'Unnao', 'Varanasi'
];

const ManageColleges = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    college_name: '',
    location: '',
    district: '',
    state: 'Uttar Pradesh',
    college_type: '',
    website: '',
    affiliation: '',
    eligibility_criteria: '',
    naac_grade: '',
    fees: '',
    rating: '',
    courses_offered: '',
    contact_info: '',
    admission_link: ''
  });

  useEffect(() => {
    loadColleges();
  }, []);

  const loadColleges = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .order('college_name');

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load colleges',
        variant: 'destructive',
      });
    } else {
      setColleges((data || []) as College[]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate college name is not empty
    const trimmedName = formData.college_name.trim();
    if (!trimmedName || trimmedName.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'College name is required and cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    const collegeData = {
      college_name: trimmedName,
      location: formData.location.trim() || '',
      district: formData.district || null,
      state: formData.state.trim() || 'Unknown',
      college_type: formData.college_type.trim() || null,
      website: formData.website.trim() || null,
      affiliation: formData.affiliation.trim() || null,
      eligibility_criteria: formData.eligibility_criteria.trim() || null,
      naac_grade: formData.naac_grade.trim() || null,
      fees: formData.fees ? parseFloat(formData.fees) : null,
      rating: formData.rating ? parseFloat(formData.rating) : null,
      courses_offered: formData.courses_offered ? formData.courses_offered.split(',').map(c => c.trim()).filter(c => c.length > 0) : [],
      contact_info: formData.contact_info.trim() || null,
      admission_link: formData.admission_link.trim() || null
    };

    if (editingCollege) {
      const { error } = await supabase
        .from('colleges')
        .update(collegeData)
        .eq('id', editingCollege.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update college',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Success', description: 'College updated successfully' });
        resetForm();
        loadColleges();
      }
    } else {
      const { error } = await supabase
        .from('colleges')
        .insert(collegeData);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to add college',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Success', description: 'College added successfully' });
        resetForm();
        loadColleges();
      }
    }
  };

  const handleEdit = (college: College) => {
    setEditingCollege(college);
    setFormData({
      college_name: college.college_name || '',
      location: college.location || '',
      district: college.district || '',
      state: college.state || 'Uttar Pradesh',
      college_type: college.college_type || '',
      website: college.website || '',
      affiliation: college.affiliation || '',
      eligibility_criteria: college.eligibility_criteria || '',
      naac_grade: college.naac_grade || '',
      fees: college.fees?.toString() || '',
      rating: college.rating?.toString() || '',
      courses_offered: college.courses_offered?.join(', ') || '',
      contact_info: college.contact_info || '',
      admission_link: college.admission_link || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this college?')) return;

    const { error } = await supabase
      .from('colleges')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete college',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Success', description: 'College deleted successfully' });
      loadColleges();
    }
  };

  const resetForm = () => {
    setFormData({
      college_name: '',
      location: '',
      district: '',
      state: 'Uttar Pradesh',
      college_type: '',
      website: '',
      affiliation: '',
      eligibility_criteria: '',
      naac_grade: '',
      fees: '',
      rating: '',
      courses_offered: '',
      contact_info: '',
      admission_link: ''
    });
    setEditingCollege(null);
    setDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              Manage Colleges
            </h1>
            <p className="text-muted-foreground mt-1">
              District-wise organization for Uttar Pradesh
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add College
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCollege ? 'Edit College' : 'Add New College'}</DialogTitle>
                <DialogDescription>
                  {editingCollege ? 'Update college information' : 'Add a new college to the platform'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="college_name">College Name *</Label>
                    <Input
                      id="college_name"
                      value={formData.college_name}
                      onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="district">District *</Label>
                    <Select
                      value={formData.district}
                      onValueChange={(value) => setFormData({ ...formData, district: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {UP_DISTRICTS.map(district => (
                          <SelectItem key={district} value={district}>{district}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">City/Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="admission_link">Admission Link</Label>
                    <Input
                      id="admission_link"
                      type="url"
                      value={formData.admission_link}
                      onChange={(e) => setFormData({ ...formData, admission_link: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fees">Annual Fees (₹)</Label>
                    <Input
                      id="fees"
                      type="number"
                      value={formData.fees}
                      onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_info">Contact Info</Label>
                    <Input
                      id="contact_info"
                      value={formData.contact_info}
                      onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                      placeholder="Phone, Email, Address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rating">Rating (0-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="courses">Courses Offered (comma-separated)</Label>
                    <Input
                      id="courses"
                      value={formData.courses_offered}
                      onChange={(e) => setFormData({ ...formData, courses_offered: e.target.value })}
                      placeholder="B.Tech, MBA, BBA"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCollege ? 'Update' : 'Add'} College
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Colleges ({colleges.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Fees</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colleges.map((college) => (
                    <TableRow key={college.id}>
                      <TableCell className="font-medium">{college.college_name}</TableCell>
                      <TableCell>{college.district || 'N/A'}</TableCell>
                      <TableCell>{college.location}</TableCell>
                      <TableCell>{college.fees ? `₹${college.fees.toLocaleString()}` : 'N/A'}</TableCell>
                      <TableCell>{college.rating || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(college)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(college.id)}
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

export default ManageColleges;