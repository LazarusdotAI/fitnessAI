import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { LoadingOverlay } from './ui/spinner';
import { toast } from '../hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  // Query to check session status
  const { isLoading, error } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          // Handle specific HTTP errors
          if (response.status === 401) {
            throw new Error('Session expired. Please log in again.');
          }
          throw new Error('Failed to verify session');
        }
        
        return response.json();
      } catch (error) {
        // Handle network errors
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          throw new Error('Unable to connect to server. Please check your connection.');
        }
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Only retry on network errors, not auth errors
      if (error instanceof Error && error.message.includes('Session expired')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!isLoading && !user) {
      // Store the attempted URL to redirect back after login
      sessionStorage.setItem('redirectUrl', location);
      setLocation('/?error=unauthorized');
    }

    // Show error toast if session check fails
    if (error) {
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Failed to verify session",
        variant: "destructive",
      });
    }
  }, [user, isLoading, error, setLocation, location]);

  // Show loading overlay while checking authentication
  if (isLoading) {
    return <LoadingOverlay />;
  }

  // If we have a user, render the protected content
  return user ? <>{children}</> : null;
}
