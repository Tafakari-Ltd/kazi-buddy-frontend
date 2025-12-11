import React from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  accept?: string;
  minLength?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helpText?: string;
  file?: File;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  value,
  placeholder,
  error,
  required = false,
  accept,
  minLength,
  onChange,
  helpText,
  file,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        accept={accept}
        minLength={minLength}
        className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 transition ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-maroon"
        }`}
        required={required}
      />
      {type === "file" && file && (
        <p className="text-xs text-gray-500 mt-1">Selected: {file.name}</p>
      )}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {helpText && !error && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
    </div>
  );
};
