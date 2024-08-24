import { UseFormReturn } from 'react-hook-form';

interface ResetSaveBtnsProps {
  form: UseFormReturn<any>;
  onSubmit: (formValues: any) => void;
}

export default function ResetSaveBtns({ form, onSubmit }: ResetSaveBtnsProps) {
  return (
    <div className="flex gap-4 mt-auto mx-auto">
      <button
        disabled={!form.formState.isDirty || form.formState.isSubmitting}
        onClick={() => form.reset()}
        className={form.formState.isDirty ? 'btn' : 'btn-disabled'}
      >
        Reset
      </button>
      <button
        disabled={!form.formState.isDirty || form.formState.isSubmitting}
        onClick={form.handleSubmit(onSubmit)}
        className={form.formState.isDirty ? 'btn' : 'btn-disabled'}
      >
        Save Changes
      </button>
    </div>
  );
}
