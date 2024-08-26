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
  item: ComponentType<any>;
  data: any[];
  getKey?: (item: any) => string;
  startAtBottom?: boolean;
  onEndReached?: () => void;
  className?: string;
}

export default function List({
  top: heading,
  item: Item,
  data,
  getKey = (item: any) => item.id,
  startAtBottom,
  onEndReached,
  className,
}: ListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [endReached, setEndReached] = useState<'top' | 'bottom'>();

  useLayoutEffect(() => {
    if (!startAtBottom || !listRef.current || endReached === 'top') {
      return;
    }
    const bottom = { top: listRef.current.scrollHeight };
    listRef.current.scrollTo(bottom);
  });

  function onScroll(event: UIEvent<HTMLUListElement>) {
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
    <ul
      ref={listRef}
      onScroll={onScroll}
      className={className + ' size-full overflow-auto'}
    >
      {heading}
      {data.map((itemData) => (
        <li key={getKey(itemData)}>
          <Item {...itemData} />
        </li>
      ))}
    </ul>
  );
}
