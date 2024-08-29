import { UseFormReturn } from 'react-hook-form';

interface ResetSaveBtnsProps {
  form: UseFormReturn<any>;
  onSubmit: (formValues: any) => void;
}

export default function ResetSaveBtns({ form, onSubmit }: ResetSaveBtnsProps) {
  const disabled = !form.formState.isDirty || form.formState.isSubmitting;
  return (
    <div className="flex gap-4 mt-auto mx-auto">
      <button
        disabled={disabled}
        onClick={() => form.reset()}
        className={disabled ? 'btn-disabled' : 'btn'}
      >
        Reset
      </button>
      <button
        disabled={disabled}
        onClick={form.handleSubmit(onSubmit)}
        className={disabled ? 'btn-disabled' : 'btn'}
      >
        Save Changes
      </button>
    </div>
  );
}
