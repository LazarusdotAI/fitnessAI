import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { useForm } from "react-hook-form";
import { api } from "../lib/api-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "../../../shared/schema";
import { Redirect } from "wouter";
import { toast } from "../hooks/use-toast";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Loader2 } from "lucide-react";
import { FitnessAssessment, type FitnessAssessmentFormData } from "../components/FitnessAssessment";
import { PsychologicalAssessment, type PsychologicalAssessmentData } from "../components/PsychologicalAssessment";

// Type definitions
interface AnalysisResponse {
  motivationAnalysis: {
    underlyingMotivations: string[];
    readinessScore: number;
    analysisFactors: {
      motivation: number;
      commitment: number;
      fitnessLevel: number;
      lifestyle: number;
      narrativeFactor: number;
    };
  };
  milestones: {
    shortTerm: string[];
    midTerm: string[];
    longTerm: string[];
    explanation: string;
  };
  successPrediction: {
    successProbability: number;
    confidenceScore: number;
    keyFactors: string[];
    recommendations: string[];
  };
  timelinePrediction: {
    estimatedWeeks: number;
    confidenceScore: number;
    keyFactors: string[];
    recommendations: string[];
  };
}

interface WorkoutPlanResponse {
  message: string;
  biology?: string;
  psychology?: string;
  suggestions: string[];
}

// Create schemas for login and registration
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.pick({
  username: true,
  password: true,
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

type AssessmentStep = "fitness" | "psychological" | "analyzing" | "results";

interface ComprehensiveResults {
  motivationAnalysis: AnalysisResponse['motivationAnalysis'];
  milestones: AnalysisResponse['milestones'];
  successPrediction: AnalysisResponse['successPrediction'];
  timelinePrediction: AnalysisResponse['timelinePrediction'];
  workoutPlan?: WorkoutPlanResponse;
}

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentStep, setAssessmentStep] = useState<AssessmentStep>("fitness");
  const [initialRegData, setInitialRegData] = useState<RegisterFormData | null>(null);
  const [fitnessData, setFitnessData] = useState<FitnessAssessmentFormData | null>(null);
  const [results, setResults] = useState<ComprehensiveResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Redirect if user is already logged in
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  const handleLogin = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
      toast({
        title: "Welcome back! 💪",
        description: "Successfully logged in to your account.",
      });
    } catch (error) {
      // Error handled by mutation's onError callback
    }
  };

  const handleInitialRegister = async (data: RegisterFormData) => {
    try {
      const response = await api.checkUsername(data.username) as { available: boolean };
      
      if (!response.available) {
        toast({
          title: "Registration Error",
          description: "Username already exists",
          variant: "destructive"
        });
        return;
      }

      setInitialRegData(data);
      setShowAssessment(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check username availability",
        variant: "destructive"
      });
    }
  };

  const handleFitnessComplete = async (data: FitnessAssessmentFormData) => {
    setFitnessData(data);
    setAssessmentStep("psychological");
  };

  const handlePsychologicalComplete = async (assessmentData: PsychologicalAssessmentData) => {
    if (!initialRegData || !fitnessData) return;

    try {
      setIsAnalyzing(true);
      setAssessmentStep("analyzing");

      // First analyze the assessment data
      const analysis = await api.analyzeAssessment({
        psychologicalNarrative: assessmentData.readinessAssessment.psychologicalNarrative,
        efficacyBeliefs: assessmentData.readinessAssessment.efficacyBeliefs,
        motivations: assessmentData.readinessAssessment.motivations,
        challenges: assessmentData.readinessAssessment.challenges,
        readinessScore: assessmentData.readinessAssessment.readinessScore,
        userData: {
          age: fitnessData.basicInfo.age,
          experienceLevel: fitnessData.fitnessProfile.experienceLevel,
          currentActivityLevel: fitnessData.fitnessProfile.currentActivityLevel,
          sleepQuality: fitnessData.lifestyle.sleepQuality,
          stressLevel: fitnessData.lifestyle.stressLevel,
          workoutPreferences: fitnessData.fitnessProfile.workoutPreferences,
          timeCommitment: fitnessData.lifestyle.timeCommitment
        }
      }) as AnalysisResponse;

      // Generate workout plan
      const workoutPlan = await api.generateWorkout({
        fitnessGoal: fitnessData.fitnessProfile.fitnessGoal,
        experienceLevel: fitnessData.fitnessProfile.experienceLevel,
        age: fitnessData.basicInfo.age,
        gender: fitnessData.basicInfo.gender,
        currentActivityLevel: fitnessData.fitnessProfile.currentActivityLevel,
        workoutPreferences: fitnessData.fitnessProfile.workoutPreferences,
        obstacles: assessmentData.readinessAssessment.barriers,
        timeCommitment: fitnessData.lifestyle.timeCommitment
      }) as WorkoutPlanResponse;

      setResults({
        motivationAnalysis: analysis.motivationAnalysis,
        milestones: analysis.milestones,
        successPrediction: analysis.successPrediction,
        timelinePrediction: analysis.timelinePrediction,
        workoutPlan
      });

      setAssessmentStep("results");

      // Create a complete user object with assessment data
      const completeUserData: InsertUser = {
        ...initialRegData,
        age: Number(fitnessData.basicInfo.age),
        gender: fitnessData.basicInfo.gender,
        heightFeet: Number(fitnessData.basicInfo.heightFeet),
        heightInches: Number(fitnessData.basicInfo.heightInches),
        weight: String(fitnessData.basicInfo.weight),
        fitnessGoal: fitnessData.fitnessProfile.fitnessGoal,
        experienceLevel: fitnessData.fitnessProfile.experienceLevel,
        currentActivityLevel: fitnessData.fitnessProfile.currentActivityLevel,
        workoutPreferences: JSON.stringify(fitnessData.fitnessProfile.workoutPreferences),
        motivationFactors: JSON.stringify(analysis.motivationAnalysis.underlyingMotivations),
        pastAttempts: 0,
        confidenceLevel: analysis.motivationAnalysis.readinessScore,
        timeCommitment: Number(fitnessData.lifestyle.timeCommitment.split('_')[0]) || 0,
        obstacles: assessmentData.readinessAssessment.barriers.join(", "),
        stressLevel: { low: 1, moderate: 2, high: 3 }[fitnessData.lifestyle.stressLevel] || 0,
        sleepQuality: { poor: 1, fair: 2, good: 3, excellent: 4 }[fitnessData.lifestyle.sleepQuality] || 0,
        dietaryPreferences: "balanced",
        supplementPreferences: "none",
        occupationType: fitnessData.lifestyle.occupationType,
        workSchedule: fitnessData.lifestyle.workSchedule,
        emotionalDrivers: JSON.stringify(assessmentData.emotionalDrivers),
        personalVision: JSON.stringify(assessmentData.personalVision),
        readinessAssessment: JSON.stringify({
          narrative: assessmentData.readinessAssessment.psychologicalNarrative,
          efficacyBeliefs: assessmentData.readinessAssessment.efficacyBeliefs,
          motivations: assessmentData.readinessAssessment.motivations,
          challenges: assessmentData.readinessAssessment.challenges,
          readinessScore: assessmentData.readinessAssessment.readinessScore,
          barriers: assessmentData.readinessAssessment.barriers
        }),
        injuries: null,
        medicalConditions: null,
        additionalNotes: null
      };

      // Register the user with complete data
      await registerMutation.mutateAsync(completeUserData);

      toast({
        title: "Success! 🎉",
        description: "Your account has been created. Welcome to your fitness journey!",
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete registration",
        variant: "destructive"
      });
      setShowAssessment(false);
      setInitialRegData(null);
      setFitnessData(null);
      setAssessmentStep("fitness");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (showAssessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-4xl">
          {assessmentStep === "fitness" && (
            <Card className="border-zinc-800 bg-black/95">
              <CardHeader>
                <CardTitle className="text-2xl text-white text-center">Fitness Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <FitnessAssessment onComplete={handleFitnessComplete} />
              </CardContent>
            </Card>
          )}

          {assessmentStep === "psychological" && (
            <Card className="border-zinc-800 bg-black/95">
              <CardHeader>
                <CardTitle className="text-2xl text-white text-center">Psychological Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <PsychologicalAssessment onComplete={handlePsychologicalComplete} />
              </CardContent>
            </Card>
          )}

          {assessmentStep === "analyzing" && (
            <Card className="border-zinc-800 bg-black/95">
              <CardHeader>
                <CardTitle className="text-2xl text-white text-center">Analyzing Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-white text-center">
                  Please wait while we analyze your responses and create your personalized fitness journey...
                </p>
              </CardContent>
            </Card>
          )}

          {assessmentStep === "results" && results && (
            <Card className="border-zinc-800 bg-black/95">
              <CardHeader>
                <CardTitle className="text-2xl text-white text-center">Your Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Motivation Analysis</h3>
                    <p className="text-zinc-400">Readiness Score: {results.motivationAnalysis.readinessScore}%</p>
                    <ul className="list-disc list-inside text-zinc-400">
                      {results.motivationAnalysis.underlyingMotivations.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Success Prediction</h3>
                    <p className="text-zinc-400">Success Probability: {results.successPrediction.successProbability}%</p>
                    <ul className="list-disc list-inside text-zinc-400">
                      {results.successPrediction.keyFactors.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Timeline</h3>
                    <p className="text-zinc-400">Estimated Duration: {results.timelinePrediction.estimatedWeeks} weeks</p>
                  </div>

                  <Button
                    onClick={() => {
                      setResults(null);
                      setShowAssessment(false);
                    }}
                    className="w-full"
                  >
                    Continue to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg border-zinc-800 bg-black/95">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">Welcome to AI Fitness Coach</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleInitialRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
