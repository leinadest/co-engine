import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

interface AvatarProps {
  src?: string;
  defaultSrc: string;
  alt?: string;
  className?: string;
  status?: 'online' | 'offline';
}

export default function Avatar({
  src,
  defaultSrc,
  alt,
  className,
  status,
}: AvatarProps) {
  return src ? (
    <div className={twMerge('rounded-full', status, className)}>
      <Image
        src={src}
        alt={alt ?? 'profile'}
        width={256}
        height={256}
        className="profile-circle"
      />
    </div>
  ) : (
    <div
      className={twMerge(
        'flex justify-center items-center size-8 xs:size-12 rounded-full bg-bgSecondary dark:bg-bgSecondary-dark',
        status,
        className
      )}
    >
      <Image
        src={defaultSrc}
        alt={alt ?? 'profile'}
        width={26}
        height={26}
        className={twMerge('size-4 xs:size-6')}
      />
    </div>
  );
}
