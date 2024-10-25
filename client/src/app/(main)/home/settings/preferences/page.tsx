'use client';

import { useContext, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import ResetSaveBtns from '@/components/form/ResetSaveBtns';
import ToggleField from '@/components/form/ToggleField';
import { ThemeContext } from '@/app/(main)/_providers/ThemeProvider';

interface FormValues {
  darkMode: boolean;
}

const validationSchema = yup.object({
  darkMode: yup.boolean().required(),
});

export default function PreferencesPage() {
  const { theme, setTheme } = useContext(ThemeContext);

  const form = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    form.reset({ darkMode: theme === 'dark' });
  }, [theme, form]);

  function onSubmit(formValues: FormValues) {
    setTheme(formValues.darkMode ? 'dark' : 'light');
    form.reset(formValues);
  }

  return (
    <main className="flex-1 flex flex-col p-4 bg-bgPrimary">
      <h1 className="mt-4 mb-8 text-center">Preferences</h1>
      <form className="flex flex-col mx-auto size-full max-w-screen-lg">
        <ToggleField label="Dark Mode" name="darkMode" form={form} />
        <ResetSaveBtns form={form} onSubmit={onSubmit} />
      </form>
    </main>
  );
}
