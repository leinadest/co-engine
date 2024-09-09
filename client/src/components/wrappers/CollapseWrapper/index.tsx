'use client';

import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import CollapseBtn from './CollapseBtn';
import MouseSensor from './MouseSensor';

interface CollapseWrapper {
  children: React.ReactNode;
  direction: 'left' | 'right' | 'up' | 'down';
  isCollapsed?: boolean;
  expandedSize?: string;
  wrapperClassName?: string;
  btnClassName?: string;
  className?: string;
}

export default function CollapseWrapper({
  children,
  direction,
  isCollapsed: defaultIsCollapsed = true,
  expandedSize,
  wrapperClassName,
  btnClassName,
  className,
}: CollapseWrapper) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(defaultIsCollapsed);

  useEffect(() => {
    if (!divRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      const size = entries[0].borderBoxSize[0];
      if (size.blockSize === 0 || size.inlineSize === 0) {
        setIsCollapsed(true);
      }
    });
    resizeObserver.observe(divRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const [mouseSensed, setMouseSensed] = useState(false);

  function onCollapseBtnClick() {
    setIsCollapsed((prev) => !prev);
  }

  const collapsedSize: Record<string, string> = {
    left: '!min-w-0 !max-w-0',
    right: '!min-w-0 !max-w-0',
    up: '!min-h-0 !max-h-0',
    down: '!min-h-0 !max-h-0',
  };

  return (
    <div className={twMerge('relative flex', wrapperClassName)}>
      <CollapseBtn
        onClick={onCollapseBtnClick}
        isCollapsed={isCollapsed}
        direction={direction}
        className={twMerge(
          btnClassName,
          mouseSensed || !isCollapsed ? 'opacity-100' : 'opacity-0'
        )}
      />

      <MouseSensor direction={direction} setMouseSensed={setMouseSensed} />

      <div
        ref={divRef}
        className={twMerge(
          'flex overflow-clip transition-all',
          isCollapsed ? collapsedSize[direction] : expandedSize,
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
