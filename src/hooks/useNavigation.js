import { useAuth } from '@hooks/auth/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { individualNavigation, corporateNavigation, quickActions } from '@/config/navigation';

export function useNavigation() {
    const { userType } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const navigation = userType === 'corporate' ? corporateNavigation : individualNavigation;
    const actions = quickActions[userType] || quickActions.individual;

    const getCurrentSection = () => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        return pathSegments[1] || 'dashboard';
    };

    const goToSection = (section) => {
        const basePath = userType === 'corporate' ? '/company' : '/app';
        navigate(`${basePath}/${section}`);
    };

    const goBack = () => {
        navigate(-1);
    };

    const goHome = () => {
        const homePath = userType === 'corporate' ? '/company/dashboard' : '/app/dashboard';
        navigate(homePath);
    };

    return {
        navigation,
        quickActions: actions,
        currentSection: getCurrentSection(),
        goToSection,
        goBack,
        goHome,
        userType,
    };
}