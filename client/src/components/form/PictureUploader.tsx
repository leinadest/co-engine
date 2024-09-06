import Image from 'next/image';
import React, { Dispatch, FormEvent, SetStateAction, useState } from 'react';

interface PictureUploaderProps {
  setVisible: Dispatch<SetStateAction<boolean>>;
  setPicture: (pic: File) => void;
  setOtherPreview?: Dispatch<SetStateAction<string>>;
}

export default function PictureUploader({
  setVisible,
  setPicture,
  setOtherPreview,
}: PictureUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  const handleFileChange = (event: FormEvent<HTMLInputElement>) => {
    const file = (event.target as HTMLInputElement).files?.item(0);
    if (!file) return;

    setSelectedImage(file);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
  };

  function handleUpload() {
    if (!selectedImage) return;
    if (setOtherPreview) setOtherPreview(preview);
    setPicture(selectedImage);
    setVisible(false);
  }

  return (
    <div className="absolute inset-x-0 mx-auto flex-col-center p-6 border rounded-lg shadow-md w-full max-w-96 h-96 bg-bgPrimary">
      <button
        onClick={() => setVisible(false)}
        className="absolute top-0 right-0 flex justify-center items-center size-8 rounded-full text-2xl bg-inherit focus-by-brightness"
      >
        &times;
      </button>
      <h2 className="mb-4">Upload Profile Picture</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4 bg-bgPrimary"
      />
      {preview ? (
        <Image
          src={preview}
          alt="Profile Preview"
          width={40}
          height={40}
          className="mb-4 size-40 object-cover rounded-full border"
        />
      ) : (
        <div className="mb-4 size-40 object-cover rounded-full border"></div>
      )}
      <button
        disabled={!selectedImage}
        onClick={handleUpload}
        className={
          (selectedImage ? 'btn' : 'btn-disabled') + ' mt-auto self-end'
        }
      >
        Upload
      </button>
    </div>
  );
}
