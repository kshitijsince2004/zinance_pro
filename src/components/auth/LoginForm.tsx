
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Database, Shield, Eye, EyeOff, User, Mail, Lock, Building2, MapPin, Users } from 'lucide-react';

interface LoginFormProps {
  onLogin: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'viewer' as any,
    department: '',
    location: '',
    company: 'Hero Corporate Services'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt with:', loginData);
    
    if (!loginData.email || !loginData.password) {
      toast({
        title: 'Login Failed',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting login...');
      const user = await authService.login(loginData.email, loginData.password);
      console.log('Login successful, user:', user);
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${user.name}!`
      });
      onLogin();
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    console.log('Demo login clicked');
    setLoginData({
      email: 'admin@herocorp.com',
      password: 'password123'
    });
    
    setIsLoading(true);
    try {
      console.log('Attempting demo login...');
      const user = await authService.login('admin@herocorp.com', 'password123');
      console.log('Demo login successful, user:', user);
      
      toast({
        title: 'Demo Login Successful',
        description: `Welcome, ${user.name}! You're logged in as ${user.role}.`
      });
      onLogin();
    } catch (error) {
      console.error('Demo login error:', error);
      toast({
        title: 'Demo Login Failed',
        description: error instanceof Error ? error.message : 'Demo login failed',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateRegistration = () => {
    if (!registerData.name || !registerData.email || !registerData.password || !registerData.department || !registerData.location) {
      toast({
        title: 'Registration Failed',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return false;
    }

    if (registerData.password.length < 6) {
      toast({
        title: 'Registration Failed',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive'
      });
      return false;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: 'Registration Failed',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Registration attempt with:', registerData);
    
    if (!validateRegistration()) return;

    setIsLoading(true);
    try {
      console.log('Attempting registration...');
      const newUser = await authService.register(registerData);
      console.log('Registration successful, user:', newUser);
      
      toast({
        title: 'Registration Successful',
        description: 'Account created successfully. Logging you in...'
      });
      
      // Auto-login after registration
      console.log('Auto-login after registration...');
      await authService.login(registerData.email, registerData.password);
      onLogin();
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Failed to create account',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Card className="bg-card border shadow-2xl">
          <CardHeader className="text-center space-y-6 pb-8">
            <img 
              src="/logo.png" 
              alt="Zinance Logo" 
              className="mx-auto w-20 h-20 rounded-3xl shadow-xl object-cover" 
            />

            <div>
              <CardTitle className="text-3xl font-bold text-foreground mb-2">Zinance</CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                Fixed Asset Management Software
              </CardDescription>
              <CardDescription className="text-primary/70 text-sm mt-1">
                Enterprise Asset Tracking Platform
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted rounded-lg p-1">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all">
                  <Users className="w-4 h-4 mr-2" />
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6 mt-8">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-primary" />
                      Email Address
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email" 
                      value={loginData.email} 
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} 
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 h-12 rounded-lg" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-primary" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="Enter your password" 
                        value={loginData.password} 
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} 
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 h-12 rounded-lg pr-12" 
                        required 
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent" 
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-12 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground mr-2"></div>
                        Signing in...
                      </>
                    ) : (
                      'Sign In to Zinance'
                    )}
                  </Button>
                </form>
                
                <div className="text-center">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleDemoLogin}
                    disabled={isLoading}
                    className="w-full h-12 rounded-lg border-primary/20 text-primary hover:bg-primary/5"
                  >
                    Try Demo Login
                  </Button>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-2 font-medium">Demo Credentials:</p>
                  <div className="space-y-1">
                    <p className="text-primary text-sm font-mono">admin@herocorp.com</p>
                    <p className="text-primary text-sm font-mono">password123</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="register" className="space-y-6 mt-8">
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground font-medium flex items-center">
                        <User className="w-4 h-4 mr-2 text-primary" />
                        Full Name *
                      </Label>
                      <Input 
                        id="name" 
                        placeholder="Enter your full name" 
                        value={registerData.name} 
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} 
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 h-12 rounded-lg" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-foreground font-medium flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-primary" />
                        Email Address *
                      </Label>
                      <Input 
                        id="register-email" 
                        type="email" 
                        placeholder="Enter your email" 
                        value={registerData.email} 
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} 
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 h-12 rounded-lg" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-foreground font-medium flex items-center">
                        <Lock className="w-4 h-4 mr-2 text-primary" />
                        Password *
                      </Label>
                      <div className="relative">
                        <Input 
                          id="register-password" 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="Min 6 characters" 
                          value={registerData.password} 
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} 
                          className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 h-12 rounded-lg pr-10" 
                          required 
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent" 
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <Eye className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-foreground font-medium flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-primary" />
                        Confirm *
                      </Label>
                      <div className="relative">
                        <Input 
                          id="confirm-password" 
                          type={showConfirmPassword ? 'text' : 'password'} 
                          placeholder="Confirm password" 
                          value={registerData.confirmPassword} 
                          onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })} 
                          className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 h-12 rounded-lg pr-10" 
                          required 
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent" 
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <Eye className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-foreground font-medium flex items-center">
                      <Users className="w-4 h-4 mr-2 text-primary" />
                      Role
                    </Label>
                    <Select value={registerData.role} onValueChange={(value) => setRegisterData({ ...registerData, role: value as any })}>
                      <SelectTrigger className="bg-background border-border text-foreground h-12 rounded-lg">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border rounded-lg">
                        <SelectItem value="viewer" className="text-foreground hover:bg-accent rounded-md">👁️ Viewer - Read Only</SelectItem>
                        <SelectItem value="amc_officer" className="text-foreground hover:bg-accent rounded-md">🛠️ AMC Officer - Maintenance</SelectItem>
                        <SelectItem value="manager" className="text-foreground hover:bg-accent rounded-md">👨‍💼 Manager - Asset Management</SelectItem>
                        <SelectItem value="admin" className="text-foreground hover:bg-accent rounded-md">⚡ Admin - Full Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-foreground font-medium flex items-center">
                        <Building2 className="w-4 h-4 mr-2 text-primary" />
                        Department *
                      </Label>
                      <Input 
                        id="department" 
                        placeholder="e.g., IT, Finance" 
                        value={registerData.department} 
                        onChange={(e) => setRegisterData({ ...registerData, department: e.target.value })} 
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 h-12 rounded-lg" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-foreground font-medium flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                        Location *
                      </Label>
                      <Input 
                        id="location" 
                        placeholder="e.g., Mumbai, Delhi" 
                        value={registerData.location} 
                        onChange={(e) => setRegisterData({ ...registerData, location: e.target.value })} 
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 h-12 rounded-lg" 
                        required 
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-12 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground mr-2"></div>
                        Creating Account...
                      </>
                    ) : (
                      'Create Zinance Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
