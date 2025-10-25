import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { 
  GraduationCap, 
  Building2, 
  Briefcase, 
  Users, 
  Shield,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalColleges: 0,
    totalScholarships: 0,
    totalCareers: 0,
    verifiedScholarships: 0,
    upColleges: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [profiles, colleges, scholarships, careers] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('colleges').select('id, state, district', { count: 'exact' }),
      supabase.from('scholarships').select('id, verified', { count: 'exact' }),
      supabase.from('careers').select('id', { count: 'exact', head: true })
    ]);

    setStats({
      totalUsers: profiles.count || 0,
      totalColleges: colleges.count || 0,
      totalScholarships: scholarships.count || 0,
      totalCareers: careers.count || 0,
      verifiedScholarships: scholarships.data?.filter(s => s.verified).length || 0,
      upColleges: colleges.data?.filter(c => c.state === 'Uttar Pradesh').length || 0
    });
  };

  const managementCards = [
    {
      title: 'Manage Colleges',
      description: 'Add, update, or remove colleges across Uttar Pradesh',
      icon: Building2,
      link: '/admin/colleges',
      stat: `${stats.upColleges} UP Colleges`,
      color: 'text-blue-600'
    },
    {
      title: 'Manage Scholarships',
      description: 'Manage verified scholarships from trusted sources',
      icon: GraduationCap,
      link: '/admin/scholarships',
      stat: `${stats.verifiedScholarships} Verified`,
      color: 'text-green-600'
    },
    {
      title: 'Manage Careers',
      description: 'Update career opportunities and guidance',
      icon: Briefcase,
      link: '/admin/careers',
      stat: `${stats.totalCareers} Careers`,
      color: 'text-purple-600'
    },
    {
      title: 'Manage Users',
      description: 'View and manage platform users',
      icon: Users,
      link: '/admin/users',
      stat: `${stats.totalUsers} Users`,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Full control over the AVSAR platform
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered platform users
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Colleges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalColleges}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.upColleges} in Uttar Pradesh
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Scholarships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalScholarships}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.verifiedScholarships} verified sources
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Career Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCareers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Available career paths
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {managementCards.map((card) => (
            <Card key={card.link} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <card.icon className={`h-10 w-10 ${card.color}`} />
                  <span className="text-sm font-medium text-muted-foreground">
                    {card.stat}
                  </span>
                </div>
                <CardTitle className="mt-4">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={card.link}>
                  <Button className="w-full">
                    Manage
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;