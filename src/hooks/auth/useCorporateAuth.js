// hooks/auth/useCorporateAuth.js
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCorporateStore } from '@/store/corporateStore';

export default function useCorporateAuth() {
  const { user } = useAuthStore();
  const { currentCompany, fetchCurrentCompany } = useCorporateStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkCorporateAccess = async () => {
      if (user?.id) {
        await fetchCurrentCompany();
      }
      setIsLoading(false);
    };

    checkCorporateAccess();
  }, [user?.id]); // Only depend on user ID, not entire user object

  return {
    isLoading,
    isCorporateUser: !!currentCompany,
    currentCompany
  };
}