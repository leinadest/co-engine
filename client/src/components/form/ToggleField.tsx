'use client';

import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface ToggleProps {
  label: string;
  name: string;
  form: UseFormReturn<any, any, undefined>;
  className?: string;
}

export default function ToggleField({
  label,
  name,
  form,
  className,
}: ToggleProps) {
  const [checked, setChecked] = useState<boolean>(false);

  const value = form.watch(name);
  useEffect(() => {
    setChecked(value);
  }, [value]);

  function onClick() {
    setChecked(!checked);
    form.setValue(name, !checked, { shouldDirty: true });
  }

  return (
    <div className={`${className ?? ''} flex justify-between items-center`}>
      <label>{label}</label>
      <button
        type="button"
        onClick={onClick}
        className={`${
          checked
            ? 'bg-primary before:translate-x-8 '
            : 'bg-bgSecondaryDark before:translate-x-0 '
        }relative border rounded-full h-8 w-16 transition-colors before:content-[''] before:absolute before:top-[3px] before:left-[3px] before:size-6 before:rounded-full before:transition-transform before:bg-bgSecondary`}
      />
    </div>
  );
}
