import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, insertUserSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { z } from "zod";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const profileSchema = insertUserSchema.extend({
    age: z.number().min(13, "Must be at least 13 years old").max(120, "Invalid age"),
    gender: z.string().min(1, "Please select your gender"),
    fitnessGoal: z.string().min(1, "Please select your fitness goal"),
    experienceLevel: z.string().min(1, "Please select your experience level"),
    currentActivityLevel: z.string().min(1, "Please select your activity level"),
    workoutPreferences: z.array(z.string()).min(1, "Please select at least one workout preference"),
    motivationFactors: z.array(z.string()).min(1, "Please select at least one motivation factor"),
  });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      age: user?.age || undefined,
      gender: user?.gender || "",
      fitnessGoal: user?.fitnessGoal || "",
      experienceLevel: user?.experienceLevel || "",
      currentActivityLevel: user?.currentActivityLevel || "",
      workoutPreferences: user?.workoutPreferences || [],
      motivationFactors: user?.motivationFactors || [],
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      if (!user?.id) throw new Error("User not found");

      // Ensure weight is string if present
      const formattedData = {
        ...data,
        weight: typeof data.weight === 'number' ? data.weight.toString() : data.weight
      };

      const res = await apiRequest("PATCH", `/api/user/${user.id}`, formattedData);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update profile');
      }
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: "Success!",
        description: "Your profile has been updated successfully.",
      });
      form.reset(form.getValues());
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      await updateProfileMutation.mutateAsync(data);
    } catch (error) {
      // Error is handled in mutation's onError
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isSubmitting = updateProfileMutation.isPending;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Profile Settings</h1>

      <Card className="bg-black border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Update Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium">Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        value={field.value ?? ''}
                        className="bg-black border-zinc-800 text-white focus:ring-primary"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium">Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger className="bg-black border-zinc-800 text-white">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fitnessGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium">Primary Fitness Goal</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger className="bg-black border-zinc-800 text-white">
                          <SelectValue placeholder="Select your main goal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weight_loss">Weight Loss</SelectItem>
                        <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                        <SelectItem value="endurance">Improve Endurance</SelectItem>
                        <SelectItem value="strength">Increase Strength</SelectItem>
                        <SelectItem value="flexibility">Increase Flexibility</SelectItem>
                        <SelectItem value="overall_health">Overall Health</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workoutPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium">
                      Workout Preferences (Select at least one)
                    </FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Strength Training",
                        "Cardio",
                        "HIIT",
                        "Yoga/Flexibility",
                        "Calisthenics",
                        "Sports",
                        "Dance",
                        "Outdoor Activities"
                      ].map((workout) => (
                        <div key={workout} className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value?.includes(workout)}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              const updated = checked
                                ? [...current, workout]
                                : current.filter((w) => w !== workout);
                              field.onChange(updated);
                            }}
                            className="border-primary/50"
                            disabled={isSubmitting}
                          />
                          <label className="text-white/90">{workout}</label>
                        </div>
                      ))}
                    </div>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-primary/20 transition-all duration-200"
                disabled={isSubmitting || !form.formState.isDirty}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Profile...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}