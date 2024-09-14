'use client';

import { UseFormReturn } from 'react-hook-form';
import { useState } from 'react';

import PictureUploader from '@/components/form/PictureUploader';
import Avatar from '@/components/Avatar';
import { twMerge } from 'tailwind-merge';

interface PreviewProps {
  me: any;
  form: UseFormReturn<{ profilePic?: any; bio?: string }>;
}

export default function PreviewPictureUploader({ me, form }: PreviewProps) {
  const [preview, setPreview] = useState(me.profilePicUrl);
  const [showPictureUploader, setShowPictureUploader] = useState(false);

  function setPicture(pic: File) {
    form.setValue('profilePic', pic, { shouldDirty: true });
    setPreview(URL.createObjectURL(pic));
  }

  return (
    <>
      <div className="relative mx-auto mb-2">
        <Avatar
          src={preview}
          defaultSrc={'/person.png'}
          alt="profile preview"
          status="online"
          className={twMerge(
            'size-40 xs:size-40 bg-bgSecondaryDark before:size-10',
            preview
              ? 'first:*:size-40 xs:first:*:size-40'
              : 'first:*:size-24 xs:first:*:size-24'
          )}
        />
        <button
          type="button"
          onClick={() => setShowPictureUploader(!showPictureUploader)}
          className="btn absolute bottom-14 -right-20"
        >
          Edit
        </button>
      </div>
      {showPictureUploader && (
        <PictureUploader
          setVisible={setShowPictureUploader}
          setPicture={setPicture}
          setOtherPreview={setPreview}
        />
      )}
    </>
  );
}
