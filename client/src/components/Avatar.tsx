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
    <Image
      src={src}
      alt={alt ?? 'profile'}
      width={256}
      height={256}
      className={twMerge('profile-circle', status, className)}
    />
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
        className="size-4 xs:size-6"
      />
    </div>
  );
}
