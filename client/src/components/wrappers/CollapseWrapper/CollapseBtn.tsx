import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

interface CollapseBtnProps {
  onClick: () => void;
  isCollapsed: boolean;
  direction: 'left' | 'right' | 'up' | 'down';
  className?: string;
}

export default function CollapseBtn({
  onClick,
  isCollapsed,
  direction,
  className,
}: CollapseBtnProps) {
  const directionMap: Record<string, Record<string, string>> = {
    left: {
      collapsedSrc: '/double_arrow_right.png',
      expandedSrc: '/double_arrow_left.png',
      onCollapsed: 'right-0 translate-x-full rounded-r-md',
      onExpanded: 'right-0 rounded-l-md',
    },
    right: {
      collapsedSrc: '/double_arrow_left.png',
      expandedSrc: '/double_arrow_right.png',
      onCollapsed: 'left-0 -translate-x-full rounded-l-md',
      onExpanded: 'left-0 rounded-r-md',
    },
  };
  return (
    <button
      onClick={onClick}
      className={twMerge(
        'absolute z-10 top-3 w-8 h-10 border bg-bgSecondary focus-by-brightness',
        directionMap[direction][isCollapsed ? 'onCollapsed' : 'onExpanded'],
        className
      )}
    >
      <Image
        src={
          directionMap[direction][isCollapsed ? 'collapsedSrc' : 'expandedSrc']
        }
        alt="collapse button"
        width={26}
        height={26}
      />
    </button>
  );
}
