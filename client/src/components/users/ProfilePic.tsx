import Image from 'next/image';

interface ProfilePicProps {
  src?: string;
  defaultSrc: string;
  alt?: string;
  className?: string;
}

export default function ProfilePic({
  src,
  defaultSrc,
  alt,
  className,
}: ProfilePicProps) {
  return src ? (
    <Image
      src={src}
      alt={alt ?? 'profile'}
      width={100}
      height={100}
      className={className + ' profile-circle'}
    />
  ) : (
    <div
      className={
        className +
        ' flex justify-center items-center size-12 rounded-full bg-bgSecondary'
      }
    >
      <Image src={defaultSrc} alt={alt ?? 'profile'} width={26} height={26} />
    </div>
  );
}
