import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, BookOpen, GraduationCap, Share2, Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const categoryDescriptions = {
  "Logical Reasoning": "Your ability to think systematically and solve problems using logic and deduction.",
  "Analytical Skills": "Your capacity to analyze information, identify patterns, and draw conclusions.",
  "Creativity": "Your ability to think innovatively and generate original ideas.",
  "Technical Interest": "Your enthusiasm and aptitude for technology and technical concepts.",
  "Problem Solving": "Your approach to tackling challenges and finding effective solutions."
};

const careerRecommendations = [
  {
    title: "Software Engineer",
    match: 92,
    description: "Build applications and systems using programming languages and frameworks.",
    requirements: ["Bachelor's in CS", "Programming skills", "Problem-solving ability"],
    related: ["Computer Science", "Information Technology"]
  },
  {
    title: "Data Analyst",
    match: 88,
    description: "Analyze data to help organizations make informed business decisions.",
    requirements: ["Statistics knowledge", "Analytical thinking", "Data tools proficiency"],
    related: ["Data Science", "Business Analytics"]
  },
  {
    title: "UX Designer",
    match: 85,
    description: "Create user-friendly interfaces and experiences for digital products.",
    requirements: ["Design thinking", "Creativity", "User research skills"],
    related: ["Design", "Human-Computer Interaction"]
  },
  {
    title: "Product Manager",
    match: 82,
    description: "Lead product development and strategy from conception to launch.",
    requirements: ["Strategic thinking", "Communication", "Technical understanding"],
    related: ["Business Administration", "Engineering Management"]
  },
  {
    title: "System Architect",
    match: 79,
    description: "Design complex system architectures and technical solutions.",
    requirements: ["Technical expertise", "System design", "Strategic planning"],
    related: ["Computer Engineering", "Software Architecture"]
  }
];

const collegeRecommendations = [
  { name: "MIT", location: "Cambridge, MA", rating: 4.9, cutoff: "99.5%" },
  { name: "Stanford University", location: "Stanford, CA", rating: 4.9, cutoff: "99%" },
  { name: "Carnegie Mellon", location: "Pittsburgh, PA", rating: 4.8, cutoff: "98%" }
];

const scholarshipRecommendations = [
  { name: "National Merit Scholarship", amount: "$50,000", deadline: "Dec 2024" },
  { name: "Tech Excellence Grant", amount: "$25,000", deadline: "Jan 2025" },
  { name: "STEM Future Leaders", amount: "$30,000", deadline: "Feb 2025" }
];

export default function QuizResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);
  const [categoryScores, setCategoryScores] = useState<any[]>([]);

  useEffect(() => {
    const savedResults = localStorage.getItem('quiz-results');
    if (!savedResults) {
      navigate('/quiz');
      return;
    }

    const parsed = JSON.parse(savedResults);
    setResults(parsed);

    // Calculate category scores
    const categories = ["Logical Reasoning", "Analytical Skills", "Creativity", "Technical Interest", "Problem Solving"];
    const scores = categories.map(category => {
      // Simulate scoring - in real app, this would analyze actual answers
      const score = 60 + Math.random() * 35;
      return {
        category,
        score: Math.round(score),
        maxScore: 100
      };
    });
    setCategoryScores(scores);
  }, [navigate]);

  if (!results) {
    return <div>Loading...</div>;
  }

  const overallScore = Math.round(categoryScores.reduce((sum, cat) => sum + cat.score, 0) / categoryScores.length);

  const chartData = categoryScores.map(cat => ({
    category: cat.category,
    score: cat.score
  }));

  const radarData = categoryScores.map(cat => ({
    subject: cat.category.split(' ')[0],
    A: cat.score,
    fullMark: 100
  }));

  const handleShare = () => {
    toast.success("Results link copied to clipboard!");
  };

  const handleDownload = () => {
    toast.success("Results downloaded as PDF!");
  };

  const handleRetake = () => {
    localStorage.removeItem('quiz-results');
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-8 px-4">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Assessment Complete!</h1>
          <p className="text-muted-foreground">Here's your personalized career guidance based on your aptitude</p>
        </div>

        {/* Overall Score */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-6xl font-bold text-primary mb-2">{overallScore}%</CardTitle>
            <CardDescription className="text-lg">Overall Aptitude Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-4 mb-6">
              <Button onClick={handleShare} variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share Results
              </Button>
              <Button onClick={handleDownload} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={handleRetake} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>
            </div>
            <Progress value={overallScore} className="h-3" />
          </CardContent>
        </Card>

        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="careers">Careers</TabsTrigger>
            <TabsTrigger value="colleges">Colleges</TabsTrigger>
            <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
          </TabsList>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                  <CardDescription>Your scores across different categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      score: {
                        label: "Score",
                        color: "hsl(var(--primary))"
                      }
                    }}
                    className="h-[300px]"
                  >
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} fontSize={12} />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="score" fill="var(--color-score)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Skill Profile</CardTitle>
                  <CardDescription>Your aptitude across key areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      A: {
                        label: "Your Score",
                        color: "hsl(var(--primary))"
                      }
                    }}
                    className="h-[300px]"
                  >
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar name="Your Score" dataKey="A" stroke="var(--color-A)" fill="var(--color-A)" fillOpacity={0.6} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RadarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Category Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {categoryScores.map((cat, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{cat.category}</h4>
                        <p className="text-sm text-muted-foreground">
                          {categoryDescriptions[cat.category as keyof typeof categoryDescriptions]}
                        </p>
                      </div>
                      <Badge variant={cat.score >= 80 ? "default" : cat.score >= 60 ? "secondary" : "outline"}>
                        {cat.score}%
                      </Badge>
                    </div>
                    <Progress value={cat.score} className="h-2" />
                    {index < categoryScores.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Careers Tab */}
          <TabsContent value="careers" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle>Recommended Career Paths</CardTitle>
                </div>
                <CardDescription>
                  Based on your aptitude assessment, these careers align well with your strengths
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {careerRecommendations.map((career, index) => (
                  <Card key={index} className="border-2">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{career.title}</CardTitle>
                          <CardDescription className="mt-2">{career.description}</CardDescription>
                        </div>
                        <Badge className="text-lg px-3 py-1">{career.match}% Match</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-semibold text-sm mb-2">Key Requirements:</h5>
                          <div className="flex flex-wrap gap-2">
                            {career.requirements.map((req, i) => (
                              <Badge key={i} variant="secondary">{req}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-semibold text-sm mb-2">Related Fields of Study:</h5>
                          <div className="flex flex-wrap gap-2">
                            {career.related.map((field, i) => (
                              <Badge key={i} variant="outline">{field}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Colleges Tab */}
          <TabsContent value="colleges" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <CardTitle>Recommended Colleges</CardTitle>
                </div>
                <CardDescription>
                  Top institutions that offer programs aligned with your career recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {collegeRecommendations.map((college, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{college.name}</CardTitle>
                          <CardDescription>{college.location}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-yellow-500 mb-1">
                            <span className="text-lg font-bold">{college.rating}</span>
                            <span className="text-sm">★</span>
                          </div>
                          <Badge variant="secondary">Cutoff: {college.cutoff}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button className="flex-1">View Details</Button>
                        <Button variant="outline" className="flex-1">Save</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scholarships Tab */}
          <TabsContent value="scholarships" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle>Available Scholarships</CardTitle>
                </div>
                <CardDescription>
                  Scholarship opportunities that match your profile and career interests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {scholarshipRecommendations.map((scholarship, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{scholarship.name}</CardTitle>
                        <Badge className="text-base">{scholarship.amount}</Badge>
                      </div>
                      <CardDescription>Deadline: {scholarship.deadline}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button className="flex-1">Apply Now</Button>
                        <Button variant="outline" className="flex-1">Learn More</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
