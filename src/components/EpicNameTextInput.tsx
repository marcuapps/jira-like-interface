import React, { InputHTMLAttributes, forwardRef } from 'react';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEnter?: (value: string) => void;
  className?: string;
}

const EpicNameTextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ icon, placeholder, value, onChange, onEnter, className, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full max-w-md">
        {icon && (
          <div className="absolute left-3 flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onEnter) {
              e.preventDefault();
              onEnter(e.currentTarget.value);
            }
          }}
          className={`w-full py-2 px-3 ${
            icon ? 'pl-10' : 'pl-3'
          } border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm ${className}`}
          {...props}
        />
      </div>
    );
  }
);

EpicNameTextInput.displayName = 'TextInput';

export default EpicNameTextInput;