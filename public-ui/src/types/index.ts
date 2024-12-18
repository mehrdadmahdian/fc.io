export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface NavigationProps {
    isAuthenticated?: boolean;
    user?: User;
}

export interface TestimonialProps {
    author: {
        name: string;
        role: string;
        image: string;
    };
    content: string;
}

export interface PricingPlan {
    name: string;
    price: number;
    interval: 'month' | 'year';
    features: string[];
    buttonText: string;
    isFeatured?: boolean;
} 