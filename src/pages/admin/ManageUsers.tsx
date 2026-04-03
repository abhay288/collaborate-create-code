import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Users, MapPin, GraduationCap, Calendar, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  full_name: string | null;
  age: number | null;
  education_level: string | null;
  class_level: string | null;
  current_study_level: string | null;
  preferred_state: string | null;
  preferred_district: string | null;
  is_onboarding_complete: boolean | null;
  created_at: string;
}

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, age, education_level, class_level, current_study_level, preferred_state, preferred_district, is_onboarding_complete, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(query) ||
      user.preferred_state?.toLowerCase().includes(query) ||
      user.preferred_district?.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Manage Users
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage platform users
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-primary">{users.length}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-green-600">
              {users.filter(u => u.is_onboarding_complete).length}
            </div>
            <div className="text-sm text-muted-foreground">Onboarded</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-blue-600">
              {users.filter(u => u.preferred_state).length}
            </div>
            <div className="text-sm text-muted-foreground">With Location</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-purple-600">
              {users.filter(u => {
                const created = new Date(u.created_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return created > weekAgo;
              }).length}
            </div>
            <div className="text-sm text-muted-foreground">New This Week</div>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Users ({filteredUsers.length})</CardTitle>
                <CardDescription>Complete user directory with profile details</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No users match your search' : 'No users found'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Education</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div>
                            {user.full_name || 'Unnamed User'}
                            <div className="text-xs text-muted-foreground font-mono">
                              {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {user.current_study_level && (
                              <Badge variant="outline" className="w-fit text-xs">
                                <GraduationCap className="h-3 w-3 mr-1" />
                                {user.current_study_level.replace(/_/g, ' ')}
                              </Badge>
                            )}
                            {!user.current_study_level && user.class_level && (
                              <Badge variant="outline" className="w-fit text-xs">
                                {user.class_level}
                              </Badge>
                            )}
                            {!user.current_study_level && !user.class_level && (
                              <span className="text-muted-foreground text-xs">Not set</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.preferred_state ? (
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {user.preferred_district && `${user.preferred_district}, `}
                              {user.preferred_state}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">Not set</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.is_onboarding_complete ? (
                            <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                              Onboarded
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ManageUsers;
