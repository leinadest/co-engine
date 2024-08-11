import Image from 'next/image';
import { headers } from 'next/headers';

import TrackerLink from '@/components/TrackerLink';

export default function CollabSideBar() {
  const currentUrl = headers().get('referer');
  const currentCollab = currentUrl && currentUrl.includes('home') && 'home';

  return (
    <div className="py-2 bg-bgSecondaryDark">
      <div className={`collab ${currentCollab ? 'active' : ''}`}>
        <TrackerLink href="/home" className="profile-circle">
          <Image src="/home.png" alt="home" width={26} height={26} />
        </TrackerLink>
      </div>
      <hr className="mt-0 mb-2 mx-2 self-stretch border-t-2 border-bgSecondary" />
      <div className="collab">
        <button className="relative profile-circle focus:outline-none">
          <p className="absolute top-[4px] text-3xl">+</p>
        </button>
      </div>
      <div className="collab">
        <button className="profile-circle focus:outline-none">
          <Image src="/explore.png" alt="home" width={26} height={26} />
        </button>
      </div>
    </div>
  );
}
