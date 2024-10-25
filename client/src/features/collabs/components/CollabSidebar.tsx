'use client';

import { useEffect, useState } from 'react';

import TrackerLink from '@/components/TrackerLink';
import Avatar from '@/components/Avatar';
import { twMerge } from 'tailwind-merge';

export default function CollabSideBar() {
  const [currentContext, setCurrentContext] = useState<string>();

  useEffect(() => {
    const currentUrl = localStorage.getItem('lastPath');
    if (currentUrl && currentUrl.includes('home')) {
      setCurrentContext('home');
    }
  }, []);

  const responsiveClasses = 'min-w-10 max-w-10 xs:min-w-20 xs:max-w-20';

  return (
    <nav className={twMerge('py-2 bg-bgSecondaryDark', responsiveClasses)}>
      <ol>
        <li>
          <TrackerLink
            href="/home"
            className={`collab relative mx-auto ${
              currentContext ? 'active' : ''
            }`}
          >
            <Avatar
              defaultSrc="/home.png"
              alt="home"
              className="size-8 xs:size-12"
            />
          </TrackerLink>
        </li>
        <hr className="mt-0 mb-2 mx-2 self-stretch border-t-2 border-bgSecondary dark:border-bgSecondary-dark" />
        <li>
          <button className="collab relative mx-auto focus:outline-none">
            <Avatar
              defaultSrc="/add.svg"
              alt="add"
              className="size-8 xs:size-12"
            />
          </button>
        </li>
        <li>
          <button className="collab mx-auto focus:outline-none">
            <Avatar
              defaultSrc="/explore.png"
              alt="explore"
              className="size-8 xs:size-12"
            />
          </button>
        </li>
      </ol>
    </nav>
  );
}
