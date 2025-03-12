import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Brain, Heart } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  role: "user" | "assistant";
  content: string;
  biology?: string;
  psychology?: string;
  suggestions?: string[];
}

export default function Chat() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello ${user?.username}! I'm your AI fitness trainer, focused on your ${user?.fitnessGoal || 'fitness'} journey. Let me help you achieve your goals!`,
      suggestions: [
        `What's the best way to ${user?.fitnessGoal?.toLowerCase() || 'achieve my fitness goals'}?`,
        `How can I work around my ${user?.obstacles?.toLowerCase() || 'schedule'} to stay consistent?`,
        user?.workoutPreferences?.[0] ? `Can you explain the benefits of ${user?.workoutPreferences[0]}?` : 'What workouts would you recommend for me?',
        user?.dietaryPreferences ? `How should I adjust my ${user?.dietaryPreferences} diet for optimal results?` : 'What should I eat to support my goals?'
      ].filter(Boolean),
    },
  ]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/chat", { message });
      return res.json();
    },
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: response.message,
          biology: response.biology,
          psychology: response.psychology,
          suggestions: response.suggestions 
        },
      ]);
    },
  });

  const handleSend = async () => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    chatMutation.mutate(message);
    setMessage("");
  };

  const handleSuggestion = (suggestion: string) => {
    setMessages((prev) => [...prev, { role: "user", content: suggestion }]);
    chatMutation.mutate(suggestion);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-black/95">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <Card
              key={i}
              className={`p-4 ${
                msg.role === "user" 
                  ? "bg-black border-zinc-800 shadow-lg" 
                  : "bg-black border-zinc-800 shadow-lg border-l-primary"
              }`}
            >
              <p className="text-white/90">{msg.content}</p>

              {msg.biology && (
                <div className="mt-4 p-3 bg-black/50 border border-zinc-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-primary" />
                    <span className="text-primary font-semibold">Biology</span>
                  </div>
                  <p className="text-white/80 text-sm">{msg.biology}</p>
                </div>
              )}

              {msg.psychology && (
                <div className="mt-3 p-3 bg-black/50 border border-zinc-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <span className="text-primary font-semibold">Psychology</span>
                  </div>
                  <p className="text-white/80 text-sm">{msg.psychology}</p>
                </div>
              )}

              {msg.suggestions && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {msg.suggestions.map((suggestion, j) => (
                    <Button
                      key={j}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestion(suggestion)}
                      className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_15px_rgba(255,91,24,0.3)] transition-all"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </Card>
          ))}
          {chatMutation.isPending && (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary shadow-[0_0_15px_rgba(255,91,24,0.3)]" />
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-zinc-800 bg-black">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask your AI trainer anything..."
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="bg-black border-zinc-800 text-white focus:border-primary/50 focus:ring-primary/50 transition-colors"
          />
          <Button 
            onClick={handleSend} 
            disabled={chatMutation.isPending}
            className="bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(255,91,24,0.3)] hover:shadow-[0_0_25px_rgba(255,91,24,0.5)] transition-all"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}