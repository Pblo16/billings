import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    items?: NavItem[];
}

export interface NavMainProps {
    navMain: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    password: string | null;
    [key: string]: unknown; // This allows for additional properties...
}

export interface UserMethods extends User {
    requestDelete?: (user: UserMethods) => void;
}

// Helper type for UI components that include an avatar property
export type UserWithAvatar = User & { avatar?: string | null };

export interface FormFieldConfig {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local';
    placeholder: {
        create: string;
        edit: string;
    };
    description: {
        create: string;
        edit: string;
    };
    optional?: boolean;
    validation?: {
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        pattern?: string;
    };
}

export interface Product {
    id: number;
    name: string;
    price?: number;
    created_at?: string;
    updated_at?: string;
}

export interface ProductForm {
    name: string;
    price?: number;
}