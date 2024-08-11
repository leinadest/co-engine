interface ChatPageProps {
  params: { chatId: string };
}

export default function ChatPage({ params: { chatId } }: ChatPageProps) {
  return <main>Chat {chatId}</main>;
}
