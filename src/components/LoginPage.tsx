
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Lock, User, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password, rememberMe);
      if (!success) {
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f7fa] via-[#f0f4ff] to-[#ffffff] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>
      
      <Card className="w-full max-w-md glass-card border-white/40 shadow-2xl relative z-10">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 premium-gradient rounded-2xl flex items-center justify-center mb-6 premium-glow">
            <Dumbbell className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            RangeFitGym
          </CardTitle>
          <div className="flex items-center justify-center gap-2 mt-2 mb-4">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold text-gray-600">Premium CRM</span>
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </div>
          <CardDescription className="text-gray-600">
            Access your premium gym management dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 font-medium">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-white/70 border-white/60 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-blue-400 transition-all duration-200"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/70 border-white/60 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-blue-400 transition-all duration-200"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="border-gray-400"
              />
              <Label htmlFor="remember" className="text-sm text-gray-600">
                Remember me for 30 days
              </Label>
            </div>
            
            <Button
              type="submit"
              className="w-full premium-button text-lg py-3"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Demo Credentials:</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <p><strong>Admin:</strong> admin / password123</p>
              <p><strong>Partner:</strong> partner / password123</p>
              <p><strong>Employee:</strong> employee / password123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
