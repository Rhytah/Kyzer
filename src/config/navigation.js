import {
    Home,
    BookOpen,
    BarChart3,
    Award,
    User,
    Settings,
    Users,
    FileText,
    Building,
    GraduationCap,
    Calendar,
    Bell,
    Search,
    Grid3X3,
    TrendingUp,
    Shield,
    Download,
    PlusCircle,
    Eye,
    Edit,
    Trash2,
    ChevronRight,
    Menu,
    X,
} from 'lucide-react';

// Individual User Navigation
export const individualNavigation = [{
        name: 'Dashboard',
        href: '/app/dashboard',
        icon: Home,
        description: 'Overview of your learning progress',
    },
    {
        name: 'My Courses',
        href: '/app/courses',
        icon: BookOpen,
        description: 'Your enrolled courses',
        children: [
            { name: 'Enrolled', href: '/app/courses' },
            { name: 'Browse Catalog', href: '/app/courses/catalog' },
        ],
    },
    {
        name: 'Progress',
        href: '/app/progress',
        icon: BarChart3,
        description: 'Track your learning progress',
    },
    {
        name: 'Certificates',
        href: '/app/certificates',
        icon: Award,
        description: 'View and download certificates',
    },
    {
        name: 'Profile',
        href: '/app/profile',
        icon: User,
        description: 'Manage your profile',
    },
    {
        name: 'Settings',
        href: '/app/settings',
        icon: Settings,
        description: 'Account settings',
    },
];

// Corporate Navigation
export const corporateNavigation = [{
        name: 'Dashboard',
        href: '/corporate/dashboard',
        icon: Grid3X3,
        description: 'Company learning overview',
    },
    {
        name: 'Employees',
        href: '/corporate/employees',
        icon: Users,
        description: 'Manage team members',
        children: [
            { name: 'All Employees', href: '/corporate/employees' },
            { name: 'Invite Members', href: '/corporate/employees/invite' },
            { name: 'Groups', href: '/corporate/employees/groups' },
        ],
    },
    {
        name: 'Reports',
        href: '/corporate/reports',
        icon: FileText,
        description: 'Learning analytics and reports',
        children: [
            { name: 'Progress Reports', href: '/corporate/reports/progress' },
            { name: 'Completion Reports', href: '/corporate/reports/completion' },
            { name: 'Custom Reports', href: '/corporate/reports/custom' },
        ],
    },
    {
        name: 'Settings',
        href: '/corporate/settings',
        icon: Settings,
        description: 'Company settings',
        children: [
            { name: 'Company Profile', href: '/corporate/settings/profile' },
            { name: 'Billing', href: '/corporate/settings/billing' },
            { name: 'Integrations', href: '/corporate/settings/integrations' },
        ],
    },
];

// Quick Actions for different user types
export const quickActions = {
    individual: [{
            name: 'Browse Courses',
            href: '/app/courses/catalog',
            icon: Search,
            color: 'bg-blue-500',
        },
        {
            name: 'Continue Learning',
            href: '/app/courses',
            icon: BookOpen,
            color: 'bg-green-500',
        },
        {
            name: 'View Progress',
            href: '/app/progress',
            icon: TrendingUp,
            color: 'bg-purple-500',
        },
    ],
    corporate: [{
            name: 'Invite Employees',
            href: '/corporate/employees/invite',
            icon: PlusCircle,
            color: 'bg-blue-500',
        },
        {
            name: 'View Reports',
            href: '/corporate/reports',
            icon: FileText,
            color: 'bg-green-500',
        },
        {
            name: 'Company Settings',
            href: '/corporate/settings',
            icon: Building,
            color: 'bg-purple-500',
        },
    ],
};

// Breadcrumb configuration
export const getBreadcrumbs = (pathname, params = {}) => {
    const pathSegments = pathname.split('/').filter(Boolean);

    const breadcrumbMap = {
        app: { label: 'Dashboard', href: '/app/dashboard' },
        dashboard: { label: 'Dashboard', href: '/app/dashboard' },
        courses: { label: 'Courses', href: '/app/courses' },
        catalog: { label: 'Catalog', href: '/app/courses/catalog' },
        progress: { label: 'Progress', href: '/app/progress' },
        certificates: { label: 'Certificates', href: '/app/certificates' },
        profile: { label: 'Profile', href: '/app/profile' },
        settings: { label: 'Settings', href: '/app/settings' },
        corporate: { label: 'Corporate', href: '/corporate/dashboard' },
        employees: { label: 'Employees', href: '/corporate/employees' },
        reports: { label: 'Reports', href: '/corporate/reports' },
        lesson: { label: 'Lesson', href: null },
        completion: { label: 'Completion', href: null },
    };

    const breadcrumbs = [{ label: 'Home', href: '/' }];
    let currentPath = '';

    pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;

        if (breadcrumbMap[segment]) {
            breadcrumbs.push({
                label: breadcrumbMap[segment].label,
                href: breadcrumbMap[segment].href || currentPath,
                isLast: index === pathSegments.length - 1,
            });
        } else if (params[segment]) {
            // Dynamic segments like courseId
            breadcrumbs.push({
                label: params[segment],
                href: currentPath,
                isLast: index === pathSegments.length - 1,
            });
        }
    });

    return breadcrumbs;
};