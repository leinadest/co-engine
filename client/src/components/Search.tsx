import { SetStateAction, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useDebounce } from 'use-debounce';

interface SearchProps {
  setDebouncedSearch: React.Dispatch<SetStateAction<string | undefined>>;
  placeholder?: string;
  className?: string;
}

export default function Search({
  setDebouncedSearch,
  placeholder = 'Search',
  className,
}: SearchProps) {
  const [search, setSearch] = useState('');
  const [localDebouncedSearch] = useDebounce(search, 300);

  useEffect(() => {
    setDebouncedSearch(localDebouncedSearch);
  }, [setDebouncedSearch, localDebouncedSearch]);

  return (
    <div className={twMerge('mx-auto p-4 w-full max-w-screen-lg', className)}>
      <input
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={placeholder}
        className="min-w-40 w-full"
      />
    </div>
  );
}
