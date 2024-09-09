'use client';

import * as yup from 'yup';
import { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import { formatTime, snakeToCamel } from '@/utils/helpers';
import Alert, { AlertState } from '@/components/common/Alert';
import PreviewPictureUploader from './PreviewPictureUploader';
import ResetSaveBtns from '@/components/form/ResetSaveBtns';
import useUploadMe from '@/features/users/hooks/useUploadMe';
import useUpdateMe from '@/features/users/hooks/useUpdateMe';
import InputField from '@/components/form/InputField';

interface FormValues {
  profilePic?: File;
  displayName?: string;
  bio?: string;
}

const validationSchema = yup.object().shape({
  profilePic: yup
    .mixed<File | any>()
    .test(
      'isFile',
      'Profile picture must be a file',
      (value) => !value || value instanceof File
    ),
  displayName: yup
    .string()
    .trim()
    .min(3, 'Display name must be between 3 and 30 characters long')
    .max(30, 'Display name must be between 3 and 30 characters long'),
  bio: yup.string().max(200, 'Bio cannot be longer than 200 characters'),
});

interface ProfileFormProps {
  me: any;
}

export default function ProfileForm({ me }: ProfileFormProps) {
  const form = useForm({
    defaultValues: { displayName: me.displayName, bio: me.bio ?? 'No bio' },
    resolver: yupResolver(validationSchema),
  });
  const { errors, dirtyFields } = form.formState;

  const { uploadMe, data: uploadData, error: uploadError } = useUploadMe();
  const { updateMe, data: updateData, error: updateError } = useUpdateMe();
  const [alert, setAlert] = useState<AlertState>({ visible: false });

  function onSubmit({ profilePic, displayName, bio }: FormValues) {
    if (dirtyFields.profilePic) {
      uploadMe({ profilePic });
    }
    if (dirtyFields.displayName || dirtyFields.bio) {
      updateMe({ displayName, bio });
    }
  }

  useEffect(() => {
    const error = uploadError || updateError;
    if (error) {
      setAlert({
        visible: true,
        type: 'error',
        message: `$Error: ${error.message || 'Something went wrong'}`,
      });
    }
    if (!error && (uploadData || updateData)) {
      setAlert({
        visible: true,
        type: 'success',
        message: 'Profile successfully updated',
      });
      form.reset(form.getValues());
    }
  }, [uploadError, uploadData, updateError, updateData, form]);

  return (
    <form className="flex flex-col mx-auto h-full max-w-screen-lg">
      <PreviewPictureUploader me={me} form={form} />
      <h5 className="text-center mb-4">
        {me.username}#{me.discriminator}
      </h5>

      <InputField
        form={form}
        label="Display Name"
        name="displayName"
        type="text"
        className="first:*:font-bold gap-1"
      />

      <h5>About Me</h5>
      <textarea
        {...form.register('bio')}
        className="resize-none size-full min-w-0 max-h-40 bg-bgSecondary"
      />
      {errors.bio && <p className="error pt-2">{errors.bio.message}</p>}

      <h5 className="mt-4">Member Since</h5>
      <p className="mb-4">{formatTime(me.createdAt)}</p>

      <ResetSaveBtns form={form} onSubmit={onSubmit} />
      <Alert setAlert={setAlert} {...alert} />
    </form>
  );
}
