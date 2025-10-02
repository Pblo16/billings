import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    options?: { value: string; label: string }[]; // array de cualquier tamaño (opciones manuales)
    searchUrl?: string; // URL para búsqueda asíncrona (usado con type 'select')
    disabled?: boolean;
    readOnly?: boolean;
    onEditReadOnly?: boolean;
    colspan?: number; // Number of columns to span in a grid layout
    rowspan?: number; // Number of rows to span in a grid layout
    onEditDisabled?: boolean;
    show?: number; // Cantidad de resultados a mostrar en la paginación de búsqueda asíncrona (default: 10)er;
}

interface GetColumnsOptions {
    onActionSuccess?: () => void
    actionsConfig?: {
        canEdit?: boolean
        canDelete?: boolean
    }
}

export interface PaginatedResponse<T> {
    current_page: number
    data: T[]
    first_page_url: string
    from: any
    last_page: number
    last_page_url: string
    links: Link[]
    next_page_url: any
    path: string
    per_page: number
    prev_page_url: any
    to: any
    total: number
}

export interface Link {
    url?: string
    label: string
    page?: number
    active: boolean
}


export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface ComboboxOption {
    value: string
    label: string
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
    type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'phone' | 'select';
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
    // NumberInput specific props (only used when type is 'number')
    numberInputProps?: {
        stepper?: number;
        thousandSeparator?: string;
        min?: number;
        max?: number;
        suffix?: string;
        prefix?: string;
        fixedDecimalScale?: boolean;
        decimalScale?: number;
    };
    options?: { value: string; label: string }[]; // array de cualquier tamaño
    searchUrl?: string; // URL para búsqueda asíncrona (usado con type 'select')
    disabled?: boolean;
    readOnly?: boolean;
    onEditReadOnly?: boolean;
    colspan?: number; // Number of columns to span in a grid layout
    rowspan?: number; // Number of rows to span in a grid layout
    onEditDisabled?: boolean;
    show?: number;
}


export interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at?: string;
    updated_at?: string;
}

export interface RoleForm {
    name: string;
    guard_name: string;
}

export interface Posts {
    id: number;
    name: string;
    slug: string;
    text?: string;
    user_id: number;
    created_at?: string;
    updated_at?: string;
}

export interface PostsForm {
    name: string;
    slug: string;
    text?: string;
    user_id: number;
}