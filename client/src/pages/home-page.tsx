import { useAuth } from "@/hooks/use-auth";
import Chat from "@/components/chat";
// Temporarily comment out heavy components
// import MuscleHeatmap from "@/components/MuscleHeatmap";
// import ExerciseDemo from "@/components/ExerciseDemo";
import { Button } from "@/components/ui/button";
import { LogOut, Dumbbell, LineChart, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-black/95">
      <header className="border-b border-zinc-800 p-4 bg-black">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary animate-pulse" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              AI Fitness Trainer
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-primary/10 transition-colors"
              >
                <User className="h-4 w-4 mr-2" />
                Profile Settings
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-primary/10 transition-colors"
              >
                <LineChart className="h-4 w-4 mr-2" />
                Progress Dashboard
              </Button>
            </Link>
            <span className="text-white/90">Welcome, {user?.username}!</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="text-white/80 hover:text-white hover:bg-primary/10 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
        <Tabs defaultValue="chat" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-1 bg-black border border-zinc-800">
            <TabsTrigger value="chat" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white">
              AI Trainer Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <div className="max-w-4xl mx-auto">
              <Chat />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}