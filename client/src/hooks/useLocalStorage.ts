import { useCallback, useState } from 'react';

export default function useLocalStorage(
  keys: string | string[],
  initialValues?: any | Record<string, any>
) {
  const [items, setItems] = useState<Record<string, any>>(() => {
    const normalizedKeys = typeof keys === 'string' ? [keys] : keys;
    const normalizedInitialValues = normalizedKeys.reduce<Record<string, any>>(
      (acc, key) => {
        acc[key] = initialValues?.[key] ?? null;
        return acc;
      },
      {}
    );

    try {
      const storedValues = normalizedKeys.reduce<Record<string, any>>(
        (acc, key) => {
          const item = window.localStorage.getItem(key);
          acc[key] = item ? JSON.parse(item) : normalizedInitialValues[key];
          return acc;
        },
        {}
      );
      return storedValues;
    } catch (error) {
      return normalizedInitialValues;
    }
  });

  const handleSetItems = useCallback((values: Record<string, any>) => {
    setItems((items) => ({ ...items, ...values }));
    Object.entries(values).forEach(([key, value]) => {
      window.localStorage.setItem(key, JSON.stringify(value));
    });
  }, []);

  return [items, handleSetItems] as const;
}
