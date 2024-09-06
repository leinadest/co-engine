import { UseFormReturn } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';

interface InputFieldProps {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
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
    <div className={twMerge('form-group', className)}>
      <label>{label}</label>
      <input type={type} placeholder={placeholder} {...form.register(name)} />
      {error && <p className="error">{error as string}</p>}
    </div>
  );
}
