'use client';
import { useState, useRef, useEffect } from 'react';
import { Loader2, Send, MessageSquarePlus, MessageSquareQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { answerFollowUp } from '@/ai/flows/follow-up-chat';
import { AnalysisResultType } from '@/app/page';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


interface FollowUpChatProps {
  analysisResult: AnalysisResultType;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

const suggestedPrompts = [
    'Is this condition common?',
    'What are the typical symptoms?',
    'Can you explain the remedies in simpler terms?',
    'What lifestyle changes might help?',
];


export default function FollowUpChat({ analysisResult }: FollowUpChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const diagnosisContext = `Condition: ${analysisResult.classification}, Severity: ${analysisResult.severity}, Suggested Remedies: ${analysisResult.remedies}`;

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageContent };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInput(''); // Clear input after sending

    try {
      const result = await answerFollowUp({
        diagnosisContext,
        userQuestion: messageContent,
        chatHistory: messages,
      });

      const modelMessage: Message = { role: 'model', content: result.aiResponse };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Follow-up chat error:', error);
      const errorMessage: Message = {
        role: 'model',
        content: "I'm sorry, but I encountered an error and can't respond right now. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        // A bit of a hack to scroll to the bottom.
        setTimeout(() => {
             if (scrollAreaRef.current) {
                const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
                if (viewport) {
                    viewport.scrollTop = viewport.scrollHeight;
                }
            }
        }, 100);
    }
  }, [messages]);


  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-primary">
          <MessageSquarePlus className="h-6 w-6" />
          Ask a Follow-up Question
        </CardTitle>
        <CardDescription>
            Use the prompts below or type your own question.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <ScrollArea className="h-48 w-full rounded-md border bg-background p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'model' && (
                     <Avatar className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center">
                        <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-xs rounded-lg p-3 text-sm whitespace-pre-wrap',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {message.content}
                  </div>
                   {message.role === 'user' && (
                     <Avatar className="w-8 h-8">
                        <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
               {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                  <Avatar className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3 flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
           {messages.length === 0 && (
                <div className="space-y-2">
                     <p className="text-sm font-medium text-muted-foreground">Suggested Questions:</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestedPrompts.map((prompt) => (
                            <Button
                                key={prompt}
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendMessage(prompt)}
                                disabled={isLoading}
                                className="text-xs h-auto py-1 px-2"
                            >
                                {prompt}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
          <form onSubmit={handleSubmit} className="flex items-start space-x-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., 'Is this condition contagious?'"
              className="flex-1 resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
