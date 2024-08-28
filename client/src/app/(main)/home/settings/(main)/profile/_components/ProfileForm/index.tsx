'use client';

import * as yup from 'yup';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import { formatTime } from '@/utils/helpers';
import useEditMe from '@/features/users/hooks/useEditMe';
import Alert, { AlertState } from '@/components/common/Alert';
import PreviewPictureUploader from './PreviewPictureUploader';
import ResetSaveBtns from '@/components/form/ResetSaveBtns';

interface FormValues {
  profilePic?: File;
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
  bio: yup
    .string()
    .optional()
    .max(200, 'Bio cannot be longer than 200 characters'),
});

interface ProfileFormProps {
  me: any;
}

export default function ProfileForm({ me }: ProfileFormProps) {
  const form = useForm({
    defaultValues: { bio: me.bio ?? 'No bio' },
    resolver: yupResolver(validationSchema),
  });
  const errors = form.formState.errors;

  const { editMe, ...editMeResult } = useEditMe();
  const [alert, setAlert] = useState<AlertState>({ visible: false });

  function onSubmit({ profilePic, bio }: FormValues) {
    editMe({ profilePic, bio });
  }

  useEffect(() => {
    if (editMeResult.error) {
      setAlert({
        visible: true,
        type: 'error',
        message: editMeResult.error.message,
      });
    }
    if (!editMeResult.error && editMeResult.data) {
      setAlert({
        visible: true,
        type: 'success',
        message: 'Profile successfully updated',
      });
      form.reset({ bio: editMeResult.data.editMe.bio });
    }
  }, [editMeResult.error, editMeResult.data, form]);

  return (
    <form className="flex flex-col h-full">
      <PreviewPictureUploader me={me} form={form} />
      <h1 className="text-center mb-4">
        {me.username}#{me.discriminator}
      </h1>

      <h5>About Me</h5>
      <textarea
        {...form.register('bio')}
        className="resize-none size-full max-h-40 bg-bgSecondary"
      />
      {errors.bio && <p className="error pt-2">{errors.bio.message}</p>}

      <h5 className="mt-4">Member Since</h5>
      <p className="mb-4">{formatTime(me.createdAt, DateTime.DATE_MED)}</p>

      <ResetSaveBtns form={form} onSubmit={onSubmit} />
      <Alert setAlert={setAlert} {...alert} />
    </form>
  );
}
