'use client';

import Image from 'next/image';
import TrackerLink from '@/components/TrackerLink';
import { useEffect, useState } from 'react';

export default function CollabSideBar() {
  const [currentContext, setCurrentContext] = useState<string>();

  useEffect(() => {
    const currentUrl = localStorage.getItem('lastPath');
    if (currentUrl && currentUrl.includes('home')) {
      setCurrentContext('home');
    }
  }, []);

  return (
    <div className="py-2 bg-bgSecondaryDark">
      <div>
        <TrackerLink
          href="/home"
          className={`collab profile-circle mx-auto ${
            currentContext ? 'active' : ''
          }`}
        >
          <Image src="/home.png" alt="home" width={26} height={26} />
        </TrackerLink>
      </div>
      <hr className="mt-0 mb-2 mx-2 self-stretch border-t-2 border-bgSecondary" />
      <div>
        <button className="collab relative profile-circle mx-auto focus:outline-none">
          <p className="absolute top-[4px] text-3xl">+</p>
        </button>
      </div>
      <div>
        <button className="collab profile-circle mx-auto focus:outline-none">
          <Image src="/explore.png" alt="home" width={26} height={26} />
        </button>
      </div>
    </div>
  );
}
