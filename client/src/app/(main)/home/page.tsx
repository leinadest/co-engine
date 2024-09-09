'use client';

import { useEffect, useState } from 'react';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';

import CollabSideBar from '@/features/collabs/components/CollabSidebar';
import Sidebar from './_components/Sidebar';
import ChatPage from './(main)/chat/[chatId]/page';
import useLocalStorage from '@/hooks/useLocalStorage';
import ChatPageLayout from './(main)/chat/[chatId]/layout';
import Error from '@/app/error';

export default function Home() {
  const { storage } = useLocalStorage('lastChatId');
  const [lastChatId, setLastChatId] = useState('');

  useEffect(() => setLastChatId(storage.lastChatId), [storage.lastChatId]);

  return (
    <div className="flex h-screen bg-bgPrimary">
      <CollabSideBar />
      <Sidebar
        isCollapsed={false}
        className="sm:flex-none max-w-full sm:max-w-80"
      />
      {lastChatId ? (
        <ErrorBoundary errorComponent={Error}>
          <ChatPageLayout>
            <ChatPage params={{ chatId: lastChatId }} className="min-w-0 " />
          </ChatPageLayout>
        </ErrorBoundary>
      ) : (
        <h1 className="m-auto text-6xl text-bgSecondary dark:text-bgSecondary-dark">
          home
        </h1>
      )}
    </div>
  );
}
