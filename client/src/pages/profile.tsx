import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

// Form schemas
const profileUpdateSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
});

const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;
type PasswordUpdateValues = z.infer<typeof passwordUpdateSchema>;

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Fetch user data
  const { data: user, isLoading: isLoadingUser, error: userError } = useQuery({
    queryKey: ['/api/users/me'],
    retry: 1,
    onError: () => {
      setLocation('/auth');
    }
  });
  
  // Fetch user's itineraries
  const { data: itineraries, isLoading: isLoadingItineraries } = useQuery({
    queryKey: ['/api/itineraries/user'],
    enabled: !!user,
  });
  
  // Profile update form
  const profileForm = useForm<ProfileUpdateValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      username: user?.username || '',
    },
  });
  
  // Update profile form values when user data loads
  useEffect(() => {
    if (user) {
      profileForm.reset({
        fullName: user.fullName,
        email: user.email,
        username: user.username,
      });
    }
  }, [user, profileForm]);
  
  // Password update form
  const passwordForm = useForm<PasswordUpdateValues>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  // Profile update mutation
  const profileUpdateMutation = useMutation({
    mutationFn: async (data: ProfileUpdateValues) => {
      const res = await apiRequest('PATCH', '/api/users/me', data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/users/me'], data);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message || 'Failed to update profile',
      });
    },
  });
  
  // Password update mutation
  const passwordUpdateMutation = useMutation({
    mutationFn: async (data: { currentPassword: string, newPassword: string }) => {
      const res = await apiRequest('POST', '/api/users/change-password', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully',
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Password change failed',
        description: error.message || 'Failed to update password',
      });
    },
  });
  
  // Handle profile update form submission
  const onProfileSubmit = (values: ProfileUpdateValues) => {
    // Remove username if it hasn't changed (server doesn't allow username changes)
    if (values.username === user?.username) {
      const { username, ...rest } = values;
      profileUpdateMutation.mutate(rest);
    } else {
      profileUpdateMutation.mutate(values);
    }
  };
  
  // Handle password update form submission
  const onPasswordSubmit = (values: PasswordUpdateValues) => {
    const { confirmPassword, ...rest } = values;
    passwordUpdateMutation.mutate(rest);
  };
  
  // Redirect if not logged in
  if (userError) {
    return null; // Redirecting in the onError handler
  }
  
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };
  
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMMM d, yyyy');
  };
  
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      
      {isLoadingUser ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="itineraries">My Itineraries</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal details and profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                  <Avatar className="h-24 w-24 border-2 border-primary/10">
                    <AvatarImage 
                      src={user?.profilePicture || ''} 
                      alt={user?.fullName || 'User'} 
                    />
                    <AvatarFallback className="text-xl bg-primary/10 text-primary font-medium">
                      {getInitials(user?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex flex-col">
                    <h3 className="text-lg font-medium">{user?.fullName}</h3>
                    <p className="text-gray-500">Member since {formatDate(user?.createdAt)}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="bg-primary/10 px-3 py-1 rounded-full text-xs text-primary">
                        {itineraries?.length || 0} Itineraries
                      </div>
                    </div>
                  </div>
                </div>
                
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="mt-4"
                      disabled={profileUpdateMutation.isPending || !profileForm.formState.isDirty}
                    >
                      {profileUpdateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Password Tab */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showCurrentPassword ? 'text' : 'password'}
                                placeholder="Enter your current password"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              >
                                {showCurrentPassword ? (
                                  <EyeOffIcon className="h-4 w-4" />
                                ) : (
                                  <EyeIcon className="h-4 w-4" />
                                )}
                                <span className="sr-only">
                                  {showCurrentPassword ? 'Hide password' : 'Show password'}
                                </span>
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="Enter your new password"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword ? (
                                  <EyeOffIcon className="h-4 w-4" />
                                ) : (
                                  <EyeIcon className="h-4 w-4" />
                                )}
                                <span className="sr-only">
                                  {showNewPassword ? 'Hide password' : 'Show password'}
                                </span>
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm your new password"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? (
                                  <EyeOffIcon className="h-4 w-4" />
                                ) : (
                                  <EyeIcon className="h-4 w-4" />
                                )}
                                <span className="sr-only">
                                  {showConfirmPassword ? 'Hide password' : 'Show password'}
                                </span>
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="mt-4"
                      disabled={passwordUpdateMutation.isPending}
                    >
                      {passwordUpdateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Itineraries Tab */}
          <TabsContent value="itineraries">
            <Card>
              <CardHeader>
                <CardTitle>My Itineraries</CardTitle>
                <CardDescription>
                  View and manage your saved travel itineraries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingItineraries ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !itineraries || itineraries.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">No itineraries yet</h3>
                    <p className="text-gray-500 mb-4">You haven't created any travel itineraries yet.</p>
                    <Button onClick={() => setLocation('/')}>Create Your First Itinerary</Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {itineraries.map(itinerary => (
                      <Card key={itinerary.id} className="h-full">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            {itinerary.destination}
                          </CardTitle>
                          <CardDescription>
                            {itinerary.dates} • {itinerary.travelers}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {itinerary.interests.map((interest, idx) => (
                              <span 
                                key={idx} 
                                className="bg-primary/10 px-2 py-0.5 rounded-full text-xs text-primary"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                          {itinerary.notes && (
                            <p className="text-sm text-gray-500 mt-2">
                              {itinerary.notes}
                            </p>
                          )}
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setLocation(`/comparison?id=${itinerary.id}`)}
                          >
                            View Details
                          </Button>
                          <div className="text-xs text-gray-400">
                            {formatDate(itinerary.createdAt)}
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}