import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Slider } from "./ui/slider";
import { Card } from "./ui/card";
import { Brain, Heart, Target, Loader2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const psychologicalAssessmentSchema = z.object({
  emotionalDrivers: z.object({
    current: z.array(z.string()).min(1, "Select at least one current emotion"),
    desired: z.array(z.string()).min(1, "Select at least one desired emotion"),
    impact: z.number().min(1).max(10)
  }),
  personalVision: z.object({
    oneYearGoal: z.string().min(1, "One year goal is required"),
    visionSatisfaction: z.number().min(1).max(10)
  }),
  readinessAssessment: z.object({
    efficacyBeliefs: z.string().min(1, "Please share your thoughts about your ability to achieve these goals"),
    motivations: z.string().min(1, "Please share what drives you"),
    challenges: z.string().min(1, "Please share your challenges"),
    readinessScore: z.number().min(1).max(10),
    barriers: z.array(z.string()),
    supportSystem: z.array(z.string()),
    psychologicalNarrative: z.string().min(1, "Please share your thoughts about starting this journey")
  })
});

export type PsychologicalAssessmentData = z.infer<typeof psychologicalAssessmentSchema>;

const currentEmotionOptions = [
  "Frustrated", "Hopeful", "Determined", "Anxious",
  "Excited", "Overwhelmed", "Confident", "Uncertain",
  "Insecure", "Motivated", "Stressed", "Ready"
] as const;

const desiredEmotionOptions = [
  "Empowered", "Accomplished", "Energized", "Proud",
  "Balanced", "Strong", "Disciplined", "Inspired",
  "Resilient", "Focused", "Confident", "Fulfilled"
] as const;

interface PsychologicalAssessmentProps {
  onComplete: (data: PsychologicalAssessmentData) => void;
}

export function PsychologicalAssessment({ onComplete }: PsychologicalAssessmentProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<PsychologicalAssessmentData>({
    resolver: zodResolver(psychologicalAssessmentSchema),
    defaultValues: {
      emotionalDrivers: {
        current: [],
        desired: [],
        impact: 5
      },
      personalVision: {
        oneYearGoal: "",
        visionSatisfaction: 5
      },
      readinessAssessment: {
        efficacyBeliefs: "",
        motivations: "",
        challenges: "",
        readinessScore: 5,
        barriers: [],
        supportSystem: [],
        psychologicalNarrative: ""
      }
    }
  });

  const validateCurrentStep = async () => {
    let isValid = true;

    try {
      switch (step) {
        case 1:
          isValid = await form.trigger(['emotionalDrivers.current', 'emotionalDrivers.desired', 'emotionalDrivers.impact']);
          break;
        case 2:
          isValid = await form.trigger(['personalVision.oneYearGoal', 'personalVision.visionSatisfaction', 'readinessAssessment.efficacyBeliefs', 'readinessAssessment.motivations', 'readinessAssessment.challenges']);
          break;
        case 3:
          isValid = await form.trigger(['readinessAssessment.readinessScore', 'readinessAssessment.barriers', 'readinessAssessment.supportSystem', 'readinessAssessment.psychologicalNarrative']);
          break;
      }

      if (!isValid) {
        const errors = form.formState.errors;
        console.error('Validation errors:', errors);

        toast({
          title: "Please check your inputs",
          description: "Some required fields are missing or invalid.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const isValid = await validateCurrentStep();

      if (isValid) {
        const formData = form.getValues();

        if (step < 3) {
          setStep(prev => prev + 1);
        } else {
          await onComplete(formData);
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <Card className="p-6 bg-black/95 border-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-white">Emotional Assessment</h2>
            </div>

            <FormField
              control={form.control}
              name="emotionalDrivers.current"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Current Emotions</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {currentEmotionOptions.map((emotion) => (
                      <Button
                        key={emotion}
                        type="button"
                        variant={field.value?.includes(emotion) ? "default" : "outline"}
                        className="justify-start"
                        onClick={(e) => {
                          e.preventDefault();
                          const current = field.value || [];
                          field.onChange(
                            current.includes(emotion)
                              ? current.filter((e) => e !== emotion)
                              : [...current, emotion]
                          );
                        }}
                      >
                        {emotion}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emotionalDrivers.desired"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Desired Emotional State</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {desiredEmotionOptions.map((emotion) => (
                      <Button
                        key={emotion}
                        type="button"
                        variant={field.value?.includes(emotion) ? "default" : "outline"}
                        className="justify-start"
                        onClick={(e) => {
                          e.preventDefault();
                          const desired = field.value || [];
                          field.onChange(
                            desired.includes(emotion)
                              ? desired.filter((e) => e !== emotion)
                              : [...desired, emotion]
                          );
                        }}
                      >
                        {emotion}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emotionalDrivers.impact"
              render={({ field }) => (
                <FormItem className="mt-6">
                  <FormLabel className="text-white">
                    How significant would achieving your fitness goals be? (1-10)
                  </FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="py-4"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
        )}

        {step === 2 && (
          <Card className="p-6 bg-black/95 border-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-white">Future Vision</h2>
            </div>

            <FormField
              control={form.control}
              name="personalVision.oneYearGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">
                    Describe your ideal fitness outcome one year from now
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="bg-black border-zinc-800 text-white min-h-[100px]"
                      placeholder="Just have a routine of fitness"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="readinessAssessment.efficacyBeliefs"
              render={({ field }) => (
                <FormItem className="mt-6">
                  <FormLabel className="text-white">
                    How confident do you feel about making and maintaining changes in your fitness routine?
                  </FormLabel>
                  <div className="text-sm text-zinc-400 mb-2">
                    Think about your past experiences with habit changes. What helped you succeed, and how might that apply here?
                    Have you had any setbacks that influence your confidence now?
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="bg-black border-zinc-800 text-white min-h-[150px]"
                      placeholder="I've successfully changed habits before by... The main things that helped were..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="readinessAssessment.motivations"
              render={({ field }) => (
                <FormItem className="mt-6">
                  <FormLabel className="text-white">
                    What deeper reasons are driving you to seek a healthier lifestyle right now?
                  </FormLabel>
                  <div className="text-sm text-zinc-400 mb-2">
                    Looking beyond physical appearance, how do you imagine your life changing if you achieve these fitness goals?
                    Consider physical, mental, and emotional impacts. What values (e.g., family, health, achievement) guide this decision?
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="bg-black border-zinc-800 text-white min-h-[150px]"
                      placeholder="I want to have more energy for my family... This aligns with my values of..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="readinessAssessment.challenges"
              render={({ field }) => (
                <FormItem className="mt-6">
                  <FormLabel className="text-white">
                    What obstacles or fears might affect your fitness journey?
                  </FormLabel>
                  <div className="text-sm text-zinc-400 mb-2">
                    Consider both practical barriers (time, energy, support) and emotional challenges (self-doubt, past negative experiences).
                    How do you typically respond to setbacks, and what helps you overcome them?
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="bg-black border-zinc-800 text-white min-h-[150px]"
                      placeholder="My main concerns are... When facing setbacks, I usually..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="personalVision.visionSatisfaction"
              render={({ field }) => (
                <FormItem className="mt-6">
                  <FormLabel className="text-white">
                    How satisfied would you be with achieving this vision? (1-10)
                  </FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="py-4"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
        )}

        {step === 3 && (
          <Card className="p-6 bg-black/95 border-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-white">Readiness Assessment</h2>
            </div>

            <FormField
              control={form.control}
              name="readinessAssessment.psychologicalNarrative"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel className="text-white">
                    Share Your Thoughts (Private & Confidential)
                  </FormLabel>
                  <div className="text-sm text-zinc-400 mb-2">
                    This is a safe space to express your feelings, fears, hopes, and past experiences about starting your fitness journey.
                    Your response will help us better understand and support you. Only you and your AI coach will have access to this information.
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="bg-black border-zinc-800 text-white min-h-[200px]"
                      placeholder="Feel free to write about:&#13;&#10;- Your past experiences with fitness&#13;&#10;- What motivates you to start now&#13;&#10;- Your fears or concerns&#13;&#10;- What success would mean to you&#13;&#10;- Any emotional barriers you face"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="readinessAssessment.readinessScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">
                    How ready do you feel to start this journey? (1-10)
                  </FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="py-4"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="readinessAssessment.barriers"
              render={({ field }) => (
                <FormItem className="mt-6">
                  <FormLabel className="text-white">
                    What specific obstacles might you face? (One per line)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      value={field.value?.join("\n")}
                      onChange={(e) => {
                        const lines = e.target.value.split("\n").filter(line => line.trim() !== "");
                        field.onChange(lines);
                      }}
                      className="bg-black border-zinc-800 text-white min-h-[150px]"
                      placeholder="Time management challenges&#13;&#10;Work stress&#13;&#10;Family commitments&#13;&#10;Self-doubt"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="readinessAssessment.supportSystem"
              render={({ field }) => (
                <FormItem className="mt-6">
                  <FormLabel className="text-white">
                    Who or what will support your journey? (One per line)
                  </FormLabel>
                  <div className="text-sm text-zinc-400 mb-2">
                    Consider both people (family, friends, trainers) and resources (gym membership, apps, scheduled time) that can help you succeed.
                  </div>
                  <FormControl>
                    <Textarea
                      value={field.value?.join("\n")}
                      onChange={(e) => {
                        const lines = e.target.value.split("\n").filter(line => line.trim() !== "");
                        field.onChange(lines);
                      }}
                      className="bg-black border-zinc-800 text-white min-h-[150px]"
                      placeholder="Supportive spouse&#13;&#10;Local gym&#13;&#10;Morning schedule&#13;&#10;Workout buddy"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
        )}

        <div className="flex justify-between gap-4">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              className="border-primary/50 text-primary"
              disabled={isSubmitting}
            >
              Previous
            </Button>
          )}
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-white ml-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {step === 3 ? "Completing..." : "Next..."}
              </>
            ) : (
              step === 3 ? "Complete Assessment" : "Next"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
