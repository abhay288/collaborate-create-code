import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Save, Trash2, History, Bookmark, Award, Loader2, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ProfileData {
  full_name: string;
  age: number | null;
  education_level: string;
  class_level: string;
  study_area: string;
  goals: string;
  profile_picture_url: string;
  preferred_state: string;
  preferred_district: string;
  current_study_level: string;
  current_course: string;
  interests: string[];
  target_course_interest: string[];
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    age: null,
    education_level: "",
    class_level: "",
    study_area: "",
    goals: "",
    profile_picture_url: "",
    preferred_state: "",
    preferred_district: "",
    current_study_level: "",
    current_course: "",
    interests: [],
    target_course_interest: []
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    recommendationUpdates: true,
    scholarshipAlerts: true
  });

  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [savedColleges, setSavedColleges] = useState<any[]>([]);
  const [savedScholarships, setSavedScholarships] = useState<any[]>([]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData) {
          setProfile({
            full_name: profileData.full_name || "",
            age: profileData.age,
            education_level: profileData.education_level || "",
            class_level: profileData.class_level || "",
            study_area: profileData.study_area || "",
            goals: profileData.goals || "",
            profile_picture_url: profileData.profile_picture_url || "",
            preferred_state: profileData.preferred_state || "",
            preferred_district: profileData.preferred_district || "",
            current_study_level: profileData.current_study_level || "",
            current_course: profileData.current_course || "",
            interests: profileData.interests || [],
            target_course_interest: profileData.target_course_interest || []
          });
        }

        // Fetch quiz history
        const { data: quizData } = await supabase
          .from('quiz_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (quizData) {
          setQuizHistory(quizData.map(q => ({
            id: q.id,
            date: new Date(q.created_at).toLocaleDateString(),
            score: q.score ? `${q.score}%` : 'N/A',
            title: 'Career Aptitude Assessment',
            completed: q.completed
          })));
        }

        // Fetch saved colleges
        const { data: favColleges } = await supabase
          .from('user_favorites')
          .select('item_id, created_at')
          .eq('user_id', user.id)
          .eq('item_type', 'college');

        if (favColleges && favColleges.length > 0) {
          const collegeIds = favColleges.map(f => f.item_id);
          const { data: colleges } = await supabase
            .from('colleges')
            .select('id, college_name, state, district')
            .in('id', collegeIds);

          if (colleges) {
            setSavedColleges(colleges.map(c => ({
              id: c.id,
              name: c.college_name || 'Unknown College',
              location: [c.district, c.state].filter(Boolean).join(', ') || 'Location N/A'
            })));
          }
        }

        // Fetch saved scholarships
        const { data: favScholarships } = await supabase
          .from('user_favorites')
          .select('item_id, created_at')
          .eq('user_id', user.id)
          .eq('item_type', 'scholarship');

        if (favScholarships && favScholarships.length > 0) {
          const scholarshipIds = favScholarships.map(f => f.item_id);
          const { data: scholarships } = await supabase
            .from('scholarships')
            .select('id, title, deadline, amount');

          if (scholarships) {
            const filteredScholarships = scholarships.filter(s => scholarshipIds.includes(s.id));
            setSavedScholarships(filteredScholarships.map(s => ({
              id: s.id,
              name: s.title,
              deadline: s.deadline ? new Date(s.deadline).toLocaleDateString() : 'No deadline',
              amount: s.amount ? `₹${s.amount.toLocaleString()}` : 'Variable'
            })));
          }
        }

      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  // Handle profile save
  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          age: profile.age,
          education_level: profile.education_level,
          class_level: profile.class_level,
          study_area: profile.study_area,
          goals: profile.goals,
          preferred_state: profile.preferred_state,
          preferred_district: profile.preferred_district,
          current_study_level: profile.current_study_level,
          current_course: profile.current_course,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG or PNG image');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update profile with new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          profile_picture_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, profile_picture_url: publicUrl }));
      toast.success('Profile picture updated!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    toast.success("Account deletion requested. You will receive a confirmation email.");
  };

  const removeFavorite = async (itemId: string, itemType: 'college' | 'scholarship') => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .eq('item_type', itemType);

      if (error) throw error;

      if (itemType === 'college') {
        setSavedColleges(prev => prev.filter(c => c.id !== itemId));
      } else {
        setSavedScholarships(prev => prev.filter(s => s.id !== itemId));
      }
      
      toast.success(`Removed from saved ${itemType}s`);
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove item');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Profile & Settings</h1>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="saved">Saved Items</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>Manage your personal information</CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    ) : (
                      <div className="space-x-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                          {isSaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          Save
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile.profile_picture_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {profile.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        {isUploading ? 'Uploading...' : 'Change Picture'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Profile Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={profile.age || ''}
                        onChange={(e) => setProfile({ ...profile, age: e.target.value ? parseInt(e.target.value) : null })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="educationLevel">Education Level</Label>
                      <Select
                        value={profile.education_level}
                        onValueChange={(value) => setProfile({ ...profile, education_level: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high-school">High School</SelectItem>
                          <SelectItem value="undergraduate">Undergraduate</SelectItem>
                          <SelectItem value="graduate">Graduate</SelectItem>
                          <SelectItem value="postgraduate">Postgraduate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="classLevel">Current Class/Level</Label>
                      <Select
                        value={profile.class_level}
                        onValueChange={(value) => setProfile({ ...profile, class_level: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10th">10th Standard</SelectItem>
                          <SelectItem value="11th">11th Standard</SelectItem>
                          <SelectItem value="12th">12th Standard</SelectItem>
                          <SelectItem value="Diploma">Diploma</SelectItem>
                          <SelectItem value="UG">Undergraduate (UG)</SelectItem>
                          <SelectItem value="PG">Postgraduate (PG)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="studyArea">Area of Study</Label>
                      <Select
                        value={profile.study_area}
                        onValueChange={(value) => setProfile({ ...profile, study_area: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select area" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Science">Science</SelectItem>
                          <SelectItem value="Commerce">Commerce</SelectItem>
                          <SelectItem value="Arts">Arts</SelectItem>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Medical">Medical</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="currentStudyLevel">Current Study Level</Label>
                      <Input
                        id="currentStudyLevel"
                        value={profile.current_study_level}
                        onChange={(e) => setProfile({ ...profile, current_study_level: e.target.value })}
                        disabled={!isEditing}
                        placeholder="e.g., 12th Science, B.Tech 2nd Year"
                      />
                    </div>

                    <div>
                      <Label htmlFor="currentCourse">Current Course</Label>
                      <Input
                        id="currentCourse"
                        value={profile.current_course}
                        onChange={(e) => setProfile({ ...profile, current_course: e.target.value })}
                        disabled={!isEditing}
                        placeholder="e.g., PCM, Computer Science"
                      />
                    </div>

                    <div>
                      <Label htmlFor="preferredState">Preferred State</Label>
                      <Input
                        id="preferredState"
                        value={profile.preferred_state}
                        onChange={(e) => setProfile({ ...profile, preferred_state: e.target.value })}
                        disabled={!isEditing}
                        placeholder="e.g., Maharashtra, Delhi"
                      />
                    </div>

                    <div>
                      <Label htmlFor="preferredDistrict">Preferred District</Label>
                      <Input
                        id="preferredDistrict"
                        value={profile.preferred_district}
                        onChange={(e) => setProfile({ ...profile, preferred_district: e.target.value })}
                        disabled={!isEditing}
                        placeholder="e.g., Mumbai, Pune"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="goals">Goals & Aspirations</Label>
                    <Textarea
                      id="goals"
                      value={profile.goals}
                      onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                      placeholder="Tell us about your career goals and aspirations..."
                    />
                  </div>

                  {/* Display interests */}
                  {profile.interests && profile.interests.length > 0 && (
                    <div>
                      <Label>Interests</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.interests.map((interest, idx) => (
                          <Badge key={idx} variant="secondary">{interest}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Display target courses */}
                  {profile.target_course_interest && profile.target_course_interest.length > 0 && (
                    <div>
                      <Label>Target Courses</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.target_course_interest.map((course, idx) => (
                          <Badge key={idx} variant="outline">{course}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Quiz History</CardTitle>
                  <CardDescription>View your past assessments and results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {quizHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                          No quiz history yet. Take your first aptitude test!
                        </p>
                        <Button onClick={() => navigate('/quiz')}>Take Quiz</Button>
                      </div>
                    ) : (
                      quizHistory.map((quiz) => (
                        <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <History className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">{quiz.title}</p>
                              <p className="text-sm text-muted-foreground">{quiz.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant={quiz.completed ? "default" : "secondary"}>
                              {quiz.completed ? quiz.score : 'Incomplete'}
                            </Badge>
                            {quiz.completed && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate('/my-result')}
                              >
                                View Results
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Saved Items Tab */}
            <TabsContent value="saved" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Colleges</CardTitle>
                  <CardDescription>Colleges you've bookmarked for future reference</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {savedColleges.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                          No saved colleges yet
                        </p>
                        <Button variant="outline" onClick={() => navigate('/colleges')}>
                          Browse Colleges
                        </Button>
                      </div>
                    ) : (
                      savedColleges.map((college) => (
                        <div key={college.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Bookmark className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">{college.name}</p>
                              <p className="text-sm text-muted-foreground">{college.location}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate('/colleges')}
                            >
                              View Details
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeFavorite(college.id, 'college')}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Saved Scholarships</CardTitle>
                  <CardDescription>Scholarships you're interested in</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {savedScholarships.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                          No saved scholarships yet
                        </p>
                        <Button variant="outline" onClick={() => navigate('/scholarships')}>
                          Browse Scholarships
                        </Button>
                      </div>
                    ) : (
                      savedScholarships.map((scholarship) => (
                        <div key={scholarship.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Award className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">{scholarship.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Deadline: {scholarship.deadline} • {scholarship.amount}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate('/scholarships')}
                            >
                              View Details
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeFavorite(scholarship.id, 'scholarship')}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how you receive updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, emailNotifications: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Career Recommendations</p>
                      <p className="text-sm text-muted-foreground">Get notified about new career matches</p>
                    </div>
                    <Switch
                      checked={settings.recommendationUpdates}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, recommendationUpdates: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Scholarship Alerts</p>
                      <p className="text-sm text-muted-foreground">Updates on new scholarship opportunities</p>
                    </div>
                    <Switch
                      checked={settings.scholarshipAlerts}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, scholarshipAlerts: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
