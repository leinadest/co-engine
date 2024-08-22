import { UseFormReturn } from 'react-hook-form';

interface InputFieldProps {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  className?: string;
  form: UseFormReturn<any, any, undefined>;
}

export default function InputField({
  label,
  name,
  type,
  placeholder,
  className,
  form,
}: InputFieldProps) {
  const error = form.formState.errors[name]?.message;
  return (
    <div className={`form-group ${className ?? ''}`}>
      <label>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        {...form.register(name)}
        className="border"
      />
      {error && <p className="error">{error as string}</p>}
    </div>
  );
}
