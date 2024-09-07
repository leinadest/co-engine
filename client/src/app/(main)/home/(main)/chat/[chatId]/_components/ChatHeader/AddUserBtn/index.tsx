import Image from 'next/image';

import Alert, { AlertState } from '@/components/common/Alert';
import Dialog from '@/components/common/Dialog';
import { useState } from 'react';
import AddUserForm from './AddUserForm';

export default function AddUserBtn() {
  const [showDialog, setShowDialog] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ visible: false });

  return (
    <>
      <button
        onClick={() => setShowDialog(!showDialog)}
        className="p-2 rounded-md min-w-max bg-bgPrimary focus-by-brightness"
      >
        <Image src="/person_add.png" alt="add user" width={26} height={26} />
      </button>
      <Dialog open={showDialog} setOpen={setShowDialog} className="w-80">
        <AddUserForm setAlert={setAlert} />
      </Dialog>
      <Alert setAlert={setAlert} {...alert} />
    </>
  );
}
