import React from 'react';

interface TicketFormFieldsProps {
  name: string;
  email: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  errors: { name?: string; email?: string };
  disabled?: boolean;
}

export const TicketFormFields: React.FC<TicketFormFieldsProps> = ({
  name,
  email,
  onNameChange,
  onEmailChange,
  errors,
  disabled = false,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md bg-gray-800 text-white border-gray-600 focus:border-primary-300 focus:ring-1 focus:ring-primary-300 focus:outline-none transition-colors ${
            errors.name ? 'border-red-500' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder="Enter your full name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-400">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md bg-gray-800 text-white border-gray-600 focus:border-primary-300 focus:ring-1 focus:ring-primary-300 focus:outline-none transition-colors ${
            errors.email ? 'border-red-500' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder="Enter your email address"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-400">{errors.email}</p>
        )}
      </div>
    </div>
  );
}; 