import { FormFieldConfig } from '@/types'

// Ejemplo de configuración para un formulario de perfil de usuario
export const userProfileFieldsConfig: FormFieldConfig[] = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    placeholder: {
      create: 'Enter your full name',
      edit: 'Enter your full name',
    },
    description: {
      create: 'This will be displayed as your public name.',
      edit: 'This will be displayed as your public name.',
    },
    validation: {
      required: true,
      minLength: 2,
      maxLength: 50,
    },
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: {
      create: 'user@example.com',
      edit: 'user@example.com',
    },
    description: {
      create: 'We\'ll use this for notifications and account recovery.',
      edit: 'We\'ll use this for notifications and account recovery.',
    },
    validation: {
      required: true,
    },
  },
  {
    name: 'phone',
    label: 'Phone Number',
    type: 'tel',
    placeholder: {
      create: '+1 (555) 123-4567',
      edit: '+1 (555) 123-4567',
    },
    description: {
      create: 'Optional: For SMS notifications and 2FA.',
      edit: 'Optional: For SMS notifications and 2FA.',
    },
    optional: true,
  },
  {
    name: 'website',
    label: 'Website',
    type: 'url',
    placeholder: {
      create: 'https://yourwebsite.com',
      edit: 'https://yourwebsite.com',
    },
    description: {
      create: 'Optional: Link to your personal or professional website.',
      edit: 'Optional: Link to your personal or professional website.',
    },
    optional: true,
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: {
      create: 'Enter a secure password',
      edit: 'Leave blank to keep current password',
    },
    description: {
      create: 'Must be at least 8 characters with mixed case, numbers, and symbols.',
      edit: 'Leave empty to keep current password, or enter a new one to change it.',
    },
    optional: true,
    validation: {
      minLength: 8,
    },
  },
]

// Ejemplo de configuración para un formulario de contacto
export const contactFormFieldsConfig: FormFieldConfig[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    placeholder: {
      create: 'Your full name',
      edit: 'Your full name',
    },
    description: {
      create: 'How should we address you?',
      edit: 'How should we address you?',
    },
    validation: {
      required: true,
      minLength: 2,
    },
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: {
      create: 'your.email@example.com',
      edit: 'your.email@example.com',
    },
    description: {
      create: 'We\'ll respond to this email address.',
      edit: 'We\'ll respond to this email address.',
    },
    validation: {
      required: true,
    },
  },
  {
    name: 'subject',
    label: 'Subject',
    type: 'text',
    placeholder: {
      create: 'What is this about?',
      edit: 'What is this about?',
    },
    description: {
      create: 'Brief subject line for your message.',
      edit: 'Brief subject line for your message.',
    },
    validation: {
      required: true,
      minLength: 5,
      maxLength: 100,
    },
  },
]