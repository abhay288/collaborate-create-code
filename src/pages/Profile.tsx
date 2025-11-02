import { useState } from "react";
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
import { Upload, Save, Trash2, History, Bookmark, Award } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "Student Name",
    email: "student@example.com",
    age: "18",
    educationLevel: "high-school",
    classLevel: "12th",
    studyArea: "Science",
    bio: "",
    profilePicture: ""
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    recommendationUpdates: true,
    scholarshipAlerts: true
  });

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleDeleteAccount = () => {
    toast.success("Account deletion requested. You will receive a confirmation email.");
  };

  const quizHistory = [
    { date: "2024-01-15", score: "85%", title: "Career Aptitude Assessment" }
  ];

  const savedColleges = [
    { name: "MIT", location: "Massachusetts", type: "saved" }
  ];

  const savedScholarships = [
    { name: "Merit Scholarship", deadline: "2024-06-30", amount: "$5,000" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Profile & Settings</h1>

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
                        <Button onClick={handleSave}>
                          <Save className="mr-2 h-4 w-4" />
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
                      <AvatarImage src={profile.profilePicture} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {profile.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Change Picture
                      </Button>
                    )}
                  </div>

                  <Separator />

                  {/* Profile Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={profile.age}
                        onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="educationLevel">Education Level</Label>
                      <Select
                        value={profile.educationLevel}
                        onValueChange={(value) => setProfile({ ...profile, educationLevel: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                        value={profile.classLevel}
                        onValueChange={(value) => setProfile({ ...profile, classLevel: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10th">10th Standard</SelectItem>
                          <SelectItem value="12th">12th Standard</SelectItem>
                          <SelectItem value="UG">Undergraduate (UG)</SelectItem>
                          <SelectItem value="PG">Postgraduate (PG)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="studyArea">Area of Study</Label>
                      <Select
                        value={profile.studyArea}
                        onValueChange={(value) => setProfile({ ...profile, studyArea: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
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
                      <p className="text-center text-muted-foreground py-8">
                        No quiz history yet. Take your first aptitude test!
                      </p>
                    ) : (
                      quizHistory.map((quiz, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <History className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">{quiz.title}</p>
                              <p className="text-sm text-muted-foreground">{quiz.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge>{quiz.score}</Badge>
                            <Button variant="outline" size="sm">View Results</Button>
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
                      <p className="text-center text-muted-foreground py-8">
                        No saved colleges yet
                      </p>
                    ) : (
                      savedColleges.map((college, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Bookmark className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">{college.name}</p>
                              <p className="text-sm text-muted-foreground">{college.location}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">View Details</Button>
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
                      <p className="text-center text-muted-foreground py-8">
                        No saved scholarships yet
                      </p>
                    ) : (
                      savedScholarships.map((scholarship, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Award className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">{scholarship.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Deadline: {scholarship.deadline} • {scholarship.amount}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">View Details</Button>
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
