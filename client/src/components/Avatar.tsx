import Image from 'next/image';

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
      width={100}
      height={100}
      className={`${className} ${status} profile-circle`}
    />
  ) : (
    <div
      className={`${className} ${status} flex justify-center items-center size-8 xs:size-12 rounded-full bg-bgSecondary dark:bg-bgSecondary-dark`}
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
