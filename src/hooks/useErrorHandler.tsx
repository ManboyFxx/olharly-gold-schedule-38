import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export const useErrorHandler = () => {
  const handleError = useCallback((error: any, context?: string) => {
    console.error(`Error ${context ? `in ${context}` : ''}:`, error);
    
    const message = error?.message || 'Ocorreu um erro inesperado';
    
    toast({
      title: 'Erro',
      description: message,
      variant: 'destructive',
    });
  }, []);

  const handleRetry = useCallback(async (
    asyncFunction: () => Promise<any>,
    maxRetries: number = 3,
    delay: number = 1000
  ) => {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        return await asyncFunction();
      } catch (error) {
        attempt++;
        
        if (attempt >= maxRetries) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }, []);

  return { handleError, handleRetry };
};