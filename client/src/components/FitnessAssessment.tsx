import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Progress } from "./ui/progress";

const fitnessSchema = z.object({
  basicInfo: z.object({
    age: z.coerce.number().min(13, "Must be at least 13 years old").max(120, "Invalid age"),
    gender: z.string().min(1, "Gender is required"),
    heightFeet: z.coerce.number().min(4, "Height must be at least 4 feet").max(8, "Height must be less than 8 feet"),
    heightInches: z.coerce.number().min(0, "Inches must be between 0-11").max(11, "Inches must be between 0-11"),
    weight: z.string().min(2, "Weight must be at least 2 characters"),
  }),
  fitnessProfile: z.object({
    fitnessGoal: z.string().min(1, "Fitness goal is required"),
    experienceLevel: z.string().min(1, "Experience level is required"),
    currentActivityLevel: z.string().min(1, "Current activity level is required"),
    workoutPreferences: z.array(z.string()).min(1, "Select at least one workout preference"),
  }),
  lifestyle: z.object({
    timeCommitment: z.string().min(1, "Time commitment is required"),
    occupationType: z.string().min(1, "Occupation type is required"),
    workSchedule: z.string().min(1, "Work schedule is required"),
    sleepQuality: z.string().min(1, "Sleep quality is required"),
    stressLevel: z.string().min(1, "Stress level is required"),
  }),
});

export type FitnessAssessmentFormData = z.infer<typeof fitnessSchema>;

interface FitnessAssessmentProps {
  onComplete: (data: FitnessAssessmentFormData) => void;
}

export function FitnessAssessment({ onComplete }: FitnessAssessmentProps) {
  const [step, setStep] = useState(1);
  const form = useForm<FitnessAssessmentFormData>({
    resolver: zodResolver(fitnessSchema),
    defaultValues: {
      basicInfo: {
        age: 0,
        gender: "",
        heightFeet: 0,
        heightInches: 0,
        weight: "",
      },
      fitnessProfile: {
        fitnessGoal: "",
        experienceLevel: "",
        currentActivityLevel: "",
        workoutPreferences: [],
      },
      lifestyle: {
        timeCommitment: "",
        occupationType: "",
        workSchedule: "",
        sleepQuality: "",
        stressLevel: "",
      },
    },
  });

  const onSubmit = (data: FitnessAssessmentFormData) => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };

  return (
    <div className="space-y-6">
      <Progress value={step * 33.33} className="w-full" />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="basicInfo.age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="basicInfo.gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="basicInfo.heightFeet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (feet)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="basicInfo.heightInches"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (inches)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="basicInfo.weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (lbs)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="fitnessProfile.fitnessGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Fitness Goal</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your goal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weight_loss">Weight Loss</SelectItem>
                        <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                        <SelectItem value="endurance">Endurance</SelectItem>
                        <SelectItem value="strength">Strength</SelectItem>
                        <SelectItem value="flexibility">Flexibility</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fitnessProfile.experienceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fitnessProfile.currentActivityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Activity Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="lightly_active">Lightly Active</SelectItem>
                        <SelectItem value="moderately_active">Moderately Active</SelectItem>
                        <SelectItem value="very_active">Very Active</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="lifestyle.timeCommitment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Available for Exercise (per week)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time commitment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1-2_hours">1-2 hours</SelectItem>
                        <SelectItem value="3-4_hours">3-4 hours</SelectItem>
                        <SelectItem value="5-6_hours">5-6 hours</SelectItem>
                        <SelectItem value="7+_hours">7+ hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lifestyle.occupationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupation Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select occupation type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (Desk Job)</SelectItem>
                        <SelectItem value="light_activity">Light Activity</SelectItem>
                        <SelectItem value="moderate_activity">Moderate Activity</SelectItem>
                        <SelectItem value="heavy_activity">Heavy Activity</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lifestyle.workSchedule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Schedule</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select work schedule" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="regular">Regular (9-5)</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                        <SelectItem value="shift_work">Shift Work</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lifestyle.sleepQuality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sleep Quality</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sleep quality" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="poor">Poor</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="excellent">Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lifestyle.stressLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stress Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stress level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="flex justify-between">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                Previous
              </Button>
            )}
            <Button type="submit">
              {step === 3 ? "Complete" : "Next"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
