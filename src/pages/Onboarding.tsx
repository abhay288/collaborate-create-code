import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft, School, Building2, GraduationCap, Target, BookOpen, Calendar, Settings } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// Study level options organized by category
const STUDY_LEVEL_OPTIONS = {
  "School Students": [
    { value: "class_10th", label: "Class 10th" },
    { value: "class_11th", label: "Class 11th" },
    { value: "class_12th", label: "Class 12th" },
    { value: "class_12th_passed", label: "Class 12th Passed" },
  ],
  "After 10th / Diploma": [
    { value: "diploma_1st", label: "Diploma 1st year" },
    { value: "diploma_2nd", label: "Diploma 2nd year" },
    { value: "diploma_3rd_above", label: "Diploma 3rd year & above" },
  ],
  "UG / Graduation": [
    { value: "ug_1st", label: "UG 1st year" },
    { value: "ug_2nd", label: "UG 2nd year" },
    { value: "ug_3rd", label: "UG 3rd year" },
    { value: "ug_4th", label: "UG 4th year" },
    { value: "ug_5th_above", label: "UG 5th year & above" },
    { value: "graduation_complete", label: "Graduation Complete" },
    { value: "graduate", label: "Graduate" },
  ],
  "Other": [
    { value: "others", label: "Others (Sports, Arts, Skill-based, Vocational etc.)" },
  ],
};

// Course options based on study level
const COURSE_OPTIONS: Record<string, string[]> = {
  // School students
  class_10th: ["General", "Science Focus", "Commerce Focus", "Arts Focus"],
  class_11th: ["PCM (Physics, Chemistry, Maths)", "PCB (Physics, Chemistry, Biology)", "PCMB", "Commerce with Maths", "Commerce without Maths", "Arts/Humanities", "Vocational"],
  class_12th: ["PCM (Physics, Chemistry, Maths)", "PCB (Physics, Chemistry, Biology)", "PCMB", "Commerce with Maths", "Commerce without Maths", "Arts/Humanities", "Vocational"],
  class_12th_passed: ["Science - PCM", "Science - PCB", "Science - PCMB", "Commerce", "Arts/Humanities", "Vocational"],
  
  // Diploma
  diploma_1st: ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Electronics", "Automobile", "ITI Courses", "Polytechnic"],
  diploma_2nd: ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Electronics", "Automobile", "ITI Courses", "Polytechnic"],
  diploma_3rd_above: ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Electronics", "Automobile", "ITI Courses", "Polytechnic"],
  
  // UG
  ug_1st: ["B.Tech CSE", "B.Tech ECE", "B.Tech Mechanical", "B.Tech Civil", "B.Tech IT", "B.Tech AI/ML", "B.Sc Physics", "B.Sc Chemistry", "B.Sc Mathematics", "B.Sc Biology", "B.Sc Computer Science", "B.Com", "BBA", "BA Economics", "BA English", "BA Psychology", "BA Political Science", "B.Des", "BCA", "B.Arch", "MBBS", "BDS", "B.Pharm", "LLB", "BHM", "Mass Communication"],
  ug_2nd: ["B.Tech CSE", "B.Tech ECE", "B.Tech Mechanical", "B.Tech Civil", "B.Tech IT", "B.Tech AI/ML", "B.Sc Physics", "B.Sc Chemistry", "B.Sc Mathematics", "B.Sc Biology", "B.Sc Computer Science", "B.Com", "BBA", "BA Economics", "BA English", "BA Psychology", "BA Political Science", "B.Des", "BCA", "B.Arch", "MBBS", "BDS", "B.Pharm", "LLB", "BHM", "Mass Communication"],
  ug_3rd: ["B.Tech CSE", "B.Tech ECE", "B.Tech Mechanical", "B.Tech Civil", "B.Tech IT", "B.Tech AI/ML", "B.Sc Physics", "B.Sc Chemistry", "B.Sc Mathematics", "B.Sc Biology", "B.Sc Computer Science", "B.Com", "BBA", "BA Economics", "BA English", "BA Psychology", "BA Political Science", "B.Des", "BCA", "B.Arch", "MBBS", "BDS", "B.Pharm", "LLB", "BHM", "Mass Communication"],
  ug_4th: ["B.Tech CSE", "B.Tech ECE", "B.Tech Mechanical", "B.Tech Civil", "B.Tech IT", "B.Tech AI/ML", "MBBS", "BDS", "B.Arch", "LLB (5 year)"],
  ug_5th_above: ["MBBS", "B.Arch", "LLB Integrated"],
  graduation_complete: ["Engineering Graduate", "Science Graduate", "Commerce Graduate", "Arts Graduate", "Medical Graduate", "Law Graduate", "Design Graduate", "Other"],
  graduate: ["Engineering Graduate", "Science Graduate", "Commerce Graduate", "Arts Graduate", "Medical Graduate", "Law Graduate", "Design Graduate", "Other"],
  
  // Others
  others: ["Sports & Physical Education", "Fine Arts", "Performing Arts", "Skill Development", "Vocational Training", "Competitive Exam Preparation", "Other"],
};

// Target course interests
const COURSE_INTERESTS = [
  "Engineering & Technology",
  "Medical & Healthcare",
  "Management & Business",
  "Commerce & Finance",
  "Arts & Humanities",
  "Law & Legal Studies",
  "Design & Architecture",
  "Information Technology",
  "Pharmacy",
  "Agriculture & Veterinary",
  "Hotel Management",
  "Mass Communication & Journalism",
  "Education & Teaching",
  "Science & Research",
  "Government Jobs",
  "Defense & Armed Forces",
];

// Preferences options
const PREFERENCE_OPTIONS = [
  { id: "admission_counselling", label: "Admission Counselling" },
  { id: "online_degree", label: "Online Degree" },
  { id: "offline_course", label: "Offline Course" },
  { id: "distance_learning", label: "Distance Learning" },
  { id: "part_time", label: "Part-time Course" },
];

// Indian states list
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Chandigarh",
  "Any State"
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 9;
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");

  const [formData, setFormData] = useState({
    primaryTarget: "",
    currentStudyLevel: "",
    currentCourse: "",
    targetCourseInterest: [] as string[],
    targetAdmissionYear: "",
    preferences: [] as string[],
    preferredState: "",
  });

  useEffect(() => {
    loadUserName();
  }, [user]);

  const loadUserName = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    if (data?.full_name) {
      setUserName(data.full_name);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      targetCourseInterest: prev.targetCourseInterest.includes(interest)
        ? prev.targetCourseInterest.filter(i => i !== interest)
        : [...prev.targetCourseInterest, interest]
    }));
  };

  const togglePreference = (pref: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(pref)
        ? prev.preferences.filter(p => p !== pref)
        : [...prev.preferences, pref]
    }));
  };

  const handleNext = () => {
    // Validation for required steps
    if (step === 1 && !formData.primaryTarget) {
      toast.error("Please select your primary target");
      return;
    }
    if (step === 3 && !formData.currentStudyLevel) {
      toast.error("Please select your current study level");
      return;
    }
    if (step === 4 && !formData.currentCourse) {
      toast.error("Please select your current course");
      return;
    }
    if (step === 6 && formData.targetCourseInterest.length === 0) {
      toast.error("Please select at least one course interest");
      return;
    }
    if (step === 7 && !formData.targetAdmissionYear) {
      toast.error("Please select your target admission year");
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      if (!user) {
        toast.error("Please log in to complete onboarding");
        navigate("/login");
        return;
      }

      // Map study level to class_level for quiz compatibility
      const classLevelMapping: Record<string, string> = {
        class_10th: "10th",
        class_11th: "12th",
        class_12th: "12th",
        class_12th_passed: "12th",
        diploma_1st: "UG",
        diploma_2nd: "UG",
        diploma_3rd_above: "UG",
        ug_1st: "UG",
        ug_2nd: "UG",
        ug_3rd: "UG",
        ug_4th: "UG",
        ug_5th_above: "UG",
        graduation_complete: "PG",
        graduate: "PG",
        others: "UG",
      };

      // Map course to study_area for quiz compatibility
      const getStudyArea = (course: string): string => {
        const scienceCourses = ["PCM", "PCB", "PCMB", "B.Tech", "B.Sc", "MBBS", "BDS", "Engineering", "Science", "Medical", "Pharmacy"];
        const commerceCourses = ["Commerce", "B.Com", "BBA", "CA", "Finance", "Business", "Management"];
        const artsCourses = ["Arts", "Humanities", "BA", "Design", "Mass Communication", "Law", "LLB"];
        
        if (scienceCourses.some(sc => course.includes(sc))) return "Science";
        if (commerceCourses.some(cc => course.includes(cc))) return "Commerce";
        if (artsCourses.some(ac => course.includes(ac))) return "Arts";
        return "All";
      };

      const updateData = {
        primary_target: formData.primaryTarget,
        current_study_level: formData.currentStudyLevel,
        current_course: formData.currentCourse,
        target_course_interest: formData.targetCourseInterest,
        target_admission_year: parseInt(formData.targetAdmissionYear),
        preferences: formData.preferences,
        preferred_state: formData.preferredState,
        class_level: classLevelMapping[formData.currentStudyLevel] || "UG",
        study_area: getStudyArea(formData.currentCourse),
        interests: formData.targetCourseInterest,
      };

      console.log("Saving onboarding data:", updateData);

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Profile setup complete! Let's start your quiz.");
      navigate("/dashboard");
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / totalSteps) * 100;
  const currentYear = new Date().getFullYear();
  const admissionYears = Array.from({ length: 6 }, (_, i) => currentYear + i);

  const availableCourses = formData.currentStudyLevel 
    ? COURSE_OPTIONS[formData.currentStudyLevel] || []
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-primary/20 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Welcome to Avsar
              </CardTitle>
              <Badge variant="outline" className="px-3 py-1">
                Step {step} of {totalSteps}
              </Badge>
            </div>
            <Progress value={progress} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Step 1: Primary Target */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-up">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">What is your primary target?</h3>
                <p className="text-muted-foreground">Choose what you're aiming for</p>
              </div>

              <div className="grid gap-4">
                {[
                  { value: "school_education", label: "School Education", icon: School, desc: "I'm focusing on school studies" },
                  { value: "government_colleges", label: "Government Colleges", icon: Building2, desc: "I want to get into govt. colleges" },
                  { value: "private_colleges", label: "Private Colleges", icon: GraduationCap, desc: "I'm looking at private institutions" },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.value}
                      className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                        formData.primaryTarget === option.value
                          ? "border-primary bg-primary/10 shadow-lg"
                          : "border-muted hover:border-primary/50"
                      }`}
                      onClick={() => setFormData({ ...formData, primaryTarget: option.value })}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${formData.primaryTarget === option.value ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{option.label}</p>
                          <p className="text-sm text-muted-foreground">{option.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Educational Journey Intro */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-up text-center">
              <div className="py-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  Hi {userName || "there"}! 👋
                </h3>
                <p className="text-lg text-muted-foreground">
                  Let's understand your educational journey to provide personalized recommendations.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Current Study Level */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-up">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">What are you currently studying?</h3>
                <p className="text-muted-foreground">Select your current education level</p>
              </div>

              <Select
                value={formData.currentStudyLevel}
                onValueChange={(value) => setFormData({ ...formData, currentStudyLevel: value, currentCourse: "" })}
              >
                <SelectTrigger className="h-14 text-lg">
                  <SelectValue placeholder="Select your current level" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {Object.entries(STUDY_LEVEL_OPTIONS).map(([group, options]) => (
                    <SelectGroup key={group}>
                      <SelectLabel className="text-primary font-semibold">{group}</SelectLabel>
                      {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 4: Current Course */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-up">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">What's your current course/stream?</h3>
                <p className="text-muted-foreground">Based on your education level</p>
              </div>

              {availableCourses.length > 0 ? (
                <Select
                  value={formData.currentCourse}
                  onValueChange={(value) => setFormData({ ...formData, currentCourse: value })}
                >
                  <SelectTrigger className="h-14 text-lg">
                    <SelectValue placeholder="Select your course/stream" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {availableCourses.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-center text-muted-foreground">Please go back and select your study level first.</p>
              )}
            </div>
          )}

          {/* Step 5: Goal Intro */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-up text-center">
              <div className="py-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                  <Target className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  Now let's set your goal! 🎯
                </h3>
                <p className="text-lg text-muted-foreground">
                  Tell us what you want to pursue so we can guide you better.
                </p>
              </div>
            </div>
          )}

          {/* Step 6: Target Course Interest */}
          {step === 6 && (
            <div className="space-y-6 animate-fade-up">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">What courses interest you?</h3>
                <p className="text-muted-foreground">Select all that apply</p>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                {COURSE_INTERESTS.map((interest) => (
                  <Badge
                    key={interest}
                    variant={formData.targetCourseInterest.includes(interest) ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-3 text-sm justify-center transition-all ${
                      formData.targetCourseInterest.includes(interest) 
                        ? "bg-primary hover:bg-primary/90" 
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
              
              {formData.targetCourseInterest.length > 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Selected: {formData.targetCourseInterest.length} interest(s)
                </p>
              )}
            </div>
          )}

          {/* Step 7: Admission Year */}
          {step === 7 && (
            <div className="space-y-6 animate-fade-up">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">College admission target year</h3>
                <p className="text-muted-foreground">When do you plan to join college?</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {admissionYears.map((year) => (
                  <div
                    key={year}
                    className={`p-4 rounded-xl border-2 cursor-pointer text-center transition-all duration-300 hover:scale-105 ${
                      formData.targetAdmissionYear === year.toString()
                        ? "border-primary bg-primary text-primary-foreground shadow-lg"
                        : "border-muted hover:border-primary/50"
                    }`}
                    onClick={() => setFormData({ ...formData, targetAdmissionYear: year.toString() })}
                  >
                    <p className="font-bold text-xl">{year}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 8: Learning Preferences */}
          {step === 8 && (
            <div className="space-y-6 animate-fade-up">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <Settings className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Are you interested in?</h3>
                <p className="text-muted-foreground">Select your learning preferences</p>
              </div>

              <div className="space-y-3">
                {PREFERENCE_OPTIONS.map((option) => (
                  <div
                    key={option.id}
                    className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.preferences.includes(option.id)
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/50"
                    }`}
                    onClick={() => togglePreference(option.id)}
                  >
                    <Checkbox
                      checked={formData.preferences.includes(option.id)}
                      className="h-5 w-5"
                    />
                    <span className="font-medium">{option.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 9: Location Preference */}
          {step === 9 && (
            <div className="space-y-6 animate-fade-up">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Almost done! 🎉</h3>
                <p className="text-muted-foreground">Where would you prefer to study?</p>
              </div>

              <Select
                value={formData.preferredState}
                onValueChange={(value) => setFormData({ ...formData, preferredState: value })}
              >
                <SelectTrigger className="h-14 text-lg">
                  <SelectValue placeholder="Select preferred state" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-xl">
                <h4 className="font-semibold mb-2">Your Profile Summary:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>🎯 Target: {formData.primaryTarget?.replace(/_/g, ' ')}</li>
                  <li>📚 Level: {formData.currentStudyLevel?.replace(/_/g, ' ')}</li>
                  <li>📖 Course: {formData.currentCourse}</li>
                  <li>🎓 Interests: {formData.targetCourseInterest.slice(0, 3).join(', ')}{formData.targetCourseInterest.length > 3 && '...'}</li>
                  <li>📅 Admission Year: {formData.targetAdmissionYear}</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="px-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button 
              onClick={handleNext} 
              disabled={loading}
              className="px-6 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {loading ? "Saving..." : step === totalSteps ? "Complete Setup" : "Next"}
              {step < totalSteps && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
