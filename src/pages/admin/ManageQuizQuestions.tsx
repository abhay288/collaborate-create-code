import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import Navigation from "@/components/Navigation";

interface QuizQuestion {
  id: string;
  question_text: string;
  category: string;
  options: any;
  points: number;
  target_class_levels: string[];
  target_study_areas: string[];
}

const CLASS_LEVELS = ['10th', '12th', 'UG', 'PG', 'All'];
const STUDY_AREAS = ['Science', 'Commerce', 'Arts', 'Engineering', 'Medical', 'Other', 'All'];
const CATEGORIES = ['logical_reasoning', 'analytical_skills', 'creativity', 'technical_interests', 'quantitative', 'verbal', 'interpersonal'];

export default function ManageQuizQuestions() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    question_text: string;
    category: 'logical_reasoning' | 'analytical_skills' | 'creativity' | 'technical_interests' | 'quantitative' | 'verbal' | 'interpersonal';
    points: number;
    target_class_levels: string[];
    target_study_areas: string[];
    options: { text: string; points: number }[];
    correctOptionIndex: number;
  }>({
    question_text: "",
    category: "logical_reasoning",
    points: 1,
    target_class_levels: ['All'],
    target_study_areas: ['All'],
    options: [
      { text: "", points: 1 },
      { text: "", points: 2 },
      { text: "", points: 3 },
      { text: "", points: 4 }
    ],
    correctOptionIndex: 3 // Default to highest point option
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.question_text || formData.options.some(opt => !opt.text)) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Mark correct answer with highest points
      const optionsWithCorrect = formData.options.map((opt, idx) => ({
        ...opt,
        isCorrect: idx === formData.correctOptionIndex,
        points: idx === formData.correctOptionIndex ? 5 : opt.points
      }));

      const questionData = {
        question_text: formData.question_text,
        category: formData.category,
        points: formData.points,
        target_class_levels: formData.target_class_levels,
        target_study_areas: formData.target_study_areas,
        options: optionsWithCorrect
      };

      if (editingId) {
        const { error } = await supabase
          .from('quiz_questions')
          .update(questionData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Question updated successfully');
      } else {
        const { error } = await supabase
          .from('quiz_questions')
          .insert(questionData);

        if (error) throw error;
        toast.success('Question added successfully');
      }

      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Failed to save question');
    }
  };

  const handleEdit = (question: QuizQuestion) => {
    setEditingId(question.id);
    const options = Array.isArray(question.options) ? question.options : [];
    const correctIndex = options.findIndex((opt: any) => opt.isCorrect === true);
    
    setFormData({
      question_text: question.question_text,
      category: question.category as any,
      points: question.points || 1,
      target_class_levels: question.target_class_levels || ['All'],
      target_study_areas: question.target_study_areas || ['All'],
      options: options.length > 0 ? options : [
        { text: "", points: 1 },
        { text: "", points: 2 },
        { text: "", points: 3 },
        { text: "", points: 4 }
      ],
      correctOptionIndex: correctIndex >= 0 ? correctIndex : 3
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Question deleted successfully');
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      question_text: "",
      category: "logical_reasoning",
      points: 1,
      target_class_levels: ['All'],
      target_study_areas: ['All'],
      options: [
        { text: "", points: 1 },
        { text: "", points: 2 },
        { text: "", points: 3 },
        { text: "", points: 4 }
      ],
      correctOptionIndex: 3
    });
  };

  const toggleClassLevel = (level: string) => {
    setFormData(prev => ({
      ...prev,
      target_class_levels: prev.target_class_levels.includes(level)
        ? prev.target_class_levels.filter(l => l !== level)
        : [...prev.target_class_levels, level]
    }));
  };

  const toggleStudyArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      target_study_areas: prev.target_study_areas.includes(area)
        ? prev.target_study_areas.filter(a => a !== area)
        : [...prev.target_study_areas, area]
    }));
  };

  const updateOption = (index: number, field: 'text' | 'points', value: string | number) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Manage Quiz Questions</h1>

        {/* Form Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Question' : 'Add New Question'}</CardTitle>
            <CardDescription>Create adaptive quiz questions for different class levels and study areas</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="question_text">Question Text</Label>
                <Textarea
                  id="question_text"
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  required
                  rows={3}
                  placeholder="Enter the question..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="points">Default Points</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Target Class Levels</Label>
                <div className="flex flex-wrap gap-2">
                  {CLASS_LEVELS.map(level => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={`class-${level}`}
                        checked={formData.target_class_levels.includes(level)}
                        onCheckedChange={() => toggleClassLevel(level)}
                      />
                      <label htmlFor={`class-${level}`} className="text-sm cursor-pointer">
                        {level}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Target Study Areas</Label>
                <div className="flex flex-wrap gap-2">
                  {STUDY_AREAS.map(area => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={`area-${area}`}
                        checked={formData.target_study_areas.includes(area)}
                        onCheckedChange={() => toggleStudyArea(area)}
                      />
                      <label htmlFor={`area-${area}`} className="text-sm cursor-pointer">
                        {area}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Answer Options (select the correct answer)</Label>
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div 
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                        formData.correctOptionIndex === index 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-muted-foreground/30 hover:border-primary'
                      }`}
                      onClick={() => setFormData({ ...formData, correctOptionIndex: index })}
                      title={formData.correctOptionIndex === index ? 'Correct answer' : 'Click to mark as correct'}
                    >
                      {formData.correctOptionIndex === index ? '✓' : index + 1}
                    </div>
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option.text}
                      onChange={(e) => updateOption(index, 'text', e.target.value)}
                      required
                      className={`flex-1 ${formData.correctOptionIndex === index ? 'border-green-500 bg-green-500/5' : ''}`}
                    />
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={option.points}
                      onChange={(e) => updateOption(index, 'points', parseInt(e.target.value))}
                      required
                      className="w-20"
                      placeholder="Pts"
                    />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Click the circle to mark the correct answer. Correct answers automatically get 5 points.
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {editingId ? 'Update Question' : 'Add Question'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Questions List */}
        <Card>
          <CardHeader>
            <CardTitle>All Questions</CardTitle>
            <CardDescription>{questions.length} questions in total</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading questions...</p>
            ) : questions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No questions yet. Add your first question above.</p>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <div key={question.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{question.question_text}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{question.category}</Badge>
                          <Badge variant="secondary">{question.points || 1} pts</Badge>
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {question.target_class_levels?.map(level => (
                            <Badge key={level} variant="outline" className="text-xs">
                              {level}
                            </Badge>
                          ))}
                          {question.target_study_areas?.map(area => (
                            <Badge key={area} className="text-xs bg-primary/10">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(question)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(question.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}