'use client';

import { useState } from 'react';
import Image from 'next/image';
import ConfirmationDialog from './ConfirmationDialog';

export default function LeaveBtn() {
  const [showDialog, setShowDialog] = useState(false);
  return (
    <>
      <button
        onClick={() => setShowDialog(!showDialog)}
        className="p-2 rounded-md bg-bgPrimary focus-by-brightness"
      >
        <Image src="/door_open.png" alt="leave chat" width={26} height={26} />
      </button>
      <ConfirmationDialog
        showDialog={showDialog}
        setShowDialog={setShowDialog}
      />
    </>
  );
}
