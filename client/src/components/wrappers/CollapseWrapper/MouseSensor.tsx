import { useState, useRef, useCallback, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

interface MouseSensorProps {
  direction: 'left' | 'right' | 'up' | 'down';
  setMouseSensed: (mouseSensed: boolean) => void;
}

export default function MouseSensor({
  direction,
  setMouseSensed,
}: MouseSensorProps) {
  const [isHovered, setIsHovered] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (divRef.current) {
        const divRect = divRef.current.getBoundingClientRect();
        const sensorRect = {
          left: divRect.left,
          top: divRect.top,
          right: divRect.right,
          bottom: divRect.bottom,
        };

        const SENSE_OFFSET = 100;
        if (direction === 'left') {
          sensorRect.right += SENSE_OFFSET;
        }
        if (direction === 'right') {
          sensorRect.left -= SENSE_OFFSET;
        }
        if (direction === 'up') {
          sensorRect.bottom += SENSE_OFFSET;
        }
        if (direction === 'down') {
          sensorRect.top -= SENSE_OFFSET;
        }

        const isInDiv =
          e.clientX >= sensorRect.left &&
          e.clientX <= sensorRect.right &&
          e.clientY >= sensorRect.top &&
          e.clientY <= sensorRect.bottom;

        if (isInDiv && !isHovered) {
          setIsHovered(true);
          setMouseSensed(true);
        }
        if (!isInDiv && isHovered) {
          setIsHovered(false);
          setMouseSensed(false);
        }
      }
    },
    [direction, isHovered, setMouseSensed]
  );

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  const sensorPosition: Record<string, string> = {
    left: 'h-full',
    right: 'h-full',
    up: 'w-full',
    down: 'w-full',
  };

  return (
    <div
      ref={divRef}
      className={twMerge(
        'absolute z-50 pointer-events-none',
        sensorPosition[direction]
      )}
    />
  );
}
