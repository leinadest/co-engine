'use client';

import { useState } from 'react';
import Image from 'next/image';

import Dialog from '@/components/common/Dialog';
import useDeleteFriendship from '@/features/friends/hooks/useDeleteFriendship';

interface Props {
  friendId: string;
  friendDisplayName: string;
}

export default function DeleteFriendshipBtn({
  friendId,
  friendDisplayName,
}: Props) {
  const [showDialog, setShowDialog] = useState(false);
  const { deleteFriendship } = useDeleteFriendship();
  return (
    <>
      <button
        onClick={() => setShowDialog(!showDialog)}
        className="p-2 rounded-md bg-bgPrimary focus-by-brightness"
      >
        <Image
          src="/person_remove.png"
          alt="remove friend"
          width={26}
          height={26}
        />
      </button>

      <Dialog open={showDialog} setOpen={setShowDialog} className="w-80">
        <p>Are you sure you want to unfriend {friendDisplayName}?</p>
        <div className="mt-2 flex justify-center gap-2">
          <button onClick={() => setShowDialog(false)} className="btn">
            Cancel
          </button>
          <button onClick={() => deleteFriendship(friendId)} className="btn">
            Unfriend
          </button>
        </div>
      </Dialog>
    </>
  );
}
