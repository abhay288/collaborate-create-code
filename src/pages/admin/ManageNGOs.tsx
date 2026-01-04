import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Building2, 
  ExternalLink,
  CheckCircle2,
  XCircle
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { useNGOs, NGO } from "@/hooks/useNGOs";

const ManageNGOs = () => {
  const { ngos, loading, createNGO, updateNGO, deleteNGO } = useNGOs();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNGO, setEditingNGO] = useState<NGO | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    mission_summary: '',
    primary_focus: '',
    states_present: '',
    hq_address: '',
    phone: '',
    email: '',
    website: '',
    apply_or_donate_link: '',
    notes: '',
    verified: false,
    is_active: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      mission_summary: '',
      primary_focus: '',
      states_present: '',
      hq_address: '',
      phone: '',
      email: '',
      website: '',
      apply_or_donate_link: '',
      notes: '',
      verified: false,
      is_active: true
    });
    setEditingNGO(null);
  };

  const openEditDialog = (ngo: NGO) => {
    setEditingNGO(ngo);
    setFormData({
      name: ngo.name,
      mission_summary: ngo.mission_summary,
      primary_focus: ngo.primary_focus,
      states_present: ngo.states_present?.join(', ') || '',
      hq_address: ngo.hq_address || '',
      phone: ngo.phone || '',
      email: ngo.email || '',
      website: ngo.website,
      apply_or_donate_link: ngo.apply_or_donate_link || '',
      notes: ngo.notes || '',
      verified: ngo.verified,
      is_active: ngo.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const ngoData = {
      name: formData.name,
      mission_summary: formData.mission_summary,
      primary_focus: formData.primary_focus,
      states_present: formData.states_present.split(',').map(s => s.trim()).filter(Boolean),
      hq_address: formData.hq_address || null,
      phone: formData.phone || null,
      email: formData.email || null,
      website: formData.website,
      apply_or_donate_link: formData.apply_or_donate_link || null,
      notes: formData.notes || null,
      verified: formData.verified,
      is_active: formData.is_active
    };

    if (editingNGO) {
      await updateNGO(editingNGO.id, ngoData);
    } else {
      await createNGO(ngoData);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteNGO(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              Manage NGOs
            </h1>
            <p className="text-muted-foreground mt-1">
              Add, edit, and manage educational NGO listings
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add NGO
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingNGO ? 'Edit NGO' : 'Add New NGO'}</DialogTitle>
                <DialogDescription>
                  {editingNGO ? 'Update NGO information' : 'Add a new educational NGO to the directory'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Organization Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="mission_summary">Mission Summary *</Label>
                    <Textarea
                      id="mission_summary"
                      value={formData.mission_summary}
                      onChange={(e) => setFormData({ ...formData, mission_summary: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="primary_focus">Primary Focus *</Label>
                    <Input
                      id="primary_focus"
                      value={formData.primary_focus}
                      onChange={(e) => setFormData({ ...formData, primary_focus: e.target.value })}
                      placeholder="e.g., Girls Education"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="states_present">States Present (comma-separated)</Label>
                    <Input
                      id="states_present"
                      value={formData.states_present}
                      onChange={(e) => setFormData({ ...formData, states_present: e.target.value })}
                      placeholder="Maharashtra, Delhi, Karnataka"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="website">Website URL *</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="apply_or_donate_link">Donate/Apply Link</Label>
                    <Input
                      id="apply_or_donate_link"
                      type="url"
                      value={formData.apply_or_donate_link}
                      onChange={(e) => setFormData({ ...formData, apply_or_donate_link: e.target.value })}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="hq_address">HQ Address</Label>
                    <Textarea
                      id="hq_address"
                      value={formData.hq_address}
                      onChange={(e) => setFormData({ ...formData, hq_address: e.target.value })}
                      rows={2}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="notes">Admin Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="verified"
                        checked={formData.verified}
                        onCheckedChange={(checked) => setFormData({ ...formData, verified: checked })}
                      />
                      <Label htmlFor="verified">Verified</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingNGO ? 'Update NGO' : 'Add NGO'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>NGO Directory ({ngos.length})</CardTitle>
            <CardDescription>All educational NGOs in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : ngos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No NGOs found. Add your first NGO using the button above.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Focus Area</TableHead>
                    <TableHead>States</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ngos.map((ngo) => (
                    <TableRow key={ngo.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{ngo.name}</span>
                          {ngo.verified && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ngo.primary_focus}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {ngo.states_present?.length || 0} states
                        </span>
                      </TableCell>
                      <TableCell>
                        {ngo.is_active ? (
                          <Badge className="bg-green-500/20 text-green-700">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                          >
                            <a href={ngo.website} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(ngo)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(ngo.id)}
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

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete NGO</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this NGO? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default ManageNGOs;
