import Image from 'next/image';
import Link from 'next/link';

import Button from '@/components/common/Button';
import Header from '@/components/common/Header';

export default function Home() {
  return (
    <>
      <Header />

      <main className="container">
        <div className="flex-col-center mx-auto gap-4 text-center max-w-xl">
          <h1>Connect, communicate, collaborate</h1>
          <p>Collaborate with others with Co-Engine&apos;s workspace.</p>
          <Link href="/signup">
            <Button>Get started</Button>
          </Link>
        </div>
        <Image
          src="/screen1.png"
          alt="screen1"
          width={1200}
          height={1200}
          className="mt-6 shadow-outline"
        />
      </main>

      <section className="container">
        <h2 className="text-center mb-4">Drive forward cooperation</h2>
        <div className="flex flex-wrap gap-2">
          <section className="grow basis-0 rounded-lg p-4 bg-bgSecondary">
            <h5>Manage your connections</h5>
            <p>
              Access and take care of all your friends, blocked users, and
              connections all at once.
            </p>
            <Image
              src="/screen2.png"
              alt="screen2"
              width={1200}
              height={1200}
              className="mt-2"
            />
          </section>
          <section className="grow basis-0 rounded-lg p-4 bg-bgSecondary">
            <h5>Communicate with others</h5>
            <p>
              Send messages and chat with friends, collaborators, and begin
              potential collaborations.
            </p>
            <Image
              src="/screen3.png"
              alt="screen3"
              width={1200}
              height={1200}
              className="mt-2"
            />
          </section>
          <section className="grow-[100] rounded-lg p-4 bg-bgSecondary">
            <h5>Perform collaborations</h5>
            <p>
              Create or join a group with others in order to discuss ideas,
              develop plans, and work together.
            </p>
            <Image
              src="/screen4.png"
              alt="screen4"
              width={1200}
              height={1200}
              className="mt-2"
            />
          </section>
        </div>
      </section>

      <section className="p-12 bg-bgSecondary">
        <div className="flex-col-center small-container gap-4 text-center">
          <h2>Use Co-Engine for free</h2>
          <p>All of Co-Engine&apos;s features are free to use.</p>
          <Link href="/signup">
            <Button>Get started</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
