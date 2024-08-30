import { Dispatch, SetStateAction } from 'react';

interface DialogProps {
  children: React.ReactNode;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  className?: string;
}

export default function Dialog({
  children,
  open,
  setOpen,
  className,
}: DialogProps) {
  return (
    <dialog
      open={open}
      className={`${className} top-1/2 -translate-y-1/2 p-2 rounded-md bg-bgSecondary shadow-md`}
    >
      <button
        onClick={() => setOpen(false)}
        className="absolute top-2 right-2 size-6 rounded-md bg-bgSecondary focus-by-brightness"
      >
        <span className="absolute-center text-textPrimary">&times;</span>
      </button>
      {children}
    </dialog>
  );
}
