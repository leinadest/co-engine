import React, {
  ComponentType,
  ReactNode,
  UIEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

interface ListProps {
  top?: ReactNode;
  item?: ComponentType<any>;
  data?: any[];
  items?: ReactNode[];
  keyHandler?: (item: any) => string;
  startAtBottom?: boolean;
  onEndReached?: () => void;
  className?: string;
}

export default function List({
  top,
  item: Item,
  data,
  items,
  keyHandler = (itemData: any) => itemData.id,
  startAtBottom,
  onEndReached,
  className,
}: ListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [endReached, setEndReached] = useState<'top' | 'bottom'>();

  useLayoutEffect(() => {
    if (!listRef.current || !scrollRef.current || !onEndReached) return;
    const scrollHeight = listRef.current.scrollHeight;
    const availableScrollHeight = scrollRef.current.clientHeight;
    if (scrollHeight <= availableScrollHeight) {
      onEndReached();
    }
  });

  useLayoutEffect(() => {
    if (!startAtBottom || !scrollRef.current || endReached === 'top') {
      return;
    }
    const bottom = { top: scrollRef.current.scrollHeight };
    scrollRef.current.scrollTo(bottom);
  });

  function onScroll(event: UIEvent<HTMLDivElement>) {
    if (!onEndReached) return;

    const THRESHOLD = 100;
    const { scrollHeight, clientHeight, scrollTop } = event.currentTarget;
    const reachedBottom = scrollHeight - scrollTop <= clientHeight + THRESHOLD;
    const reachedTop = scrollTop <= THRESHOLD;

    if ((reachedBottom && !startAtBottom) || (reachedTop && startAtBottom)) {
      setEndReached(reachedBottom ? 'bottom' : 'top');
      onEndReached();
    }
  }

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="size-full overflow-auto"
    >
      <ul ref={listRef} className={className}>
        {top}
        {items ??
          data?.map((itemData) => (
            <li key={keyHandler(itemData)}>{Item && <Item {...itemData} />}</li>
          ))}
      </ul>
    </div>
  );
}
