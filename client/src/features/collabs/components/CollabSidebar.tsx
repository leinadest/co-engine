'use client';

import Image from 'next/image';
import TrackerLink from '@/components/TrackerLink';
import { useEffect, useState } from 'react';
import Avatar from '@/components/Avatar';

export default function CollabSideBar() {
  const [currentContext, setCurrentContext] = useState<string>();

  useEffect(() => {
    const currentUrl = localStorage.getItem('lastPath');
    if (currentUrl && currentUrl.includes('home')) {
      setCurrentContext('home');
    }
  }, []);

  return (
    <nav className="py-2 bg-bgSecondaryDark">
      <ol>
        <li>
          <TrackerLink
            href="/home"
            className={`collab relative mx-auto ${
              currentContext ? 'active' : ''
            }`}
          >
            <Avatar defaultSrc="/home.png" alt="home" />
          </TrackerLink>
        </li>
        <hr className="mt-0 mb-2 mx-2 self-stretch border-t-2 border-bgSecondary dark:border-bgSecondary-dark" />
        <li>
          <button className="collab relative mx-auto focus:outline-none">
            <Avatar defaultSrc="/add.svg" alt="add" />
          </button>
        </li>
        <li>
          <button className="collab mx-auto focus:outline-none">
            <Avatar defaultSrc="/explore.png" alt="explore" />
          </button>
        </li>
      </ol>
    </nav>
  );
}
