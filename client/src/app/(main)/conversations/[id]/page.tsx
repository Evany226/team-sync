"use client";

import { useState, useEffect, useRef } from "react";
import { getConversation, getAllMessages } from "@/lib/conversations";
import { useAuth } from "@clerk/nextjs";
import { User, Message, Participant } from "@/types/index.js";
import { useUser } from "@clerk/nextjs";

import ChatInput from "@/components/global/ChatInput";
import ChatHeader from "@/components/global/ChatHeader";
import MessageCard from "@/components/global/MessageCard";
import ConvPageSkeleton from "@/components/skeletons/ConvPageSkeleton";
import ConvPageHeader from "@/components/conversations/ConvPageHeader";
import ConvProfilePanel from "@/components/conversations/ConvProfilePanel";
import VoiceCallOverlay from "@/components/conference/VoiceCallOverlay";

import { createMessage } from "@/actions/conv";
import { useToast } from "@/components/ui/use-toast";
import { useSocket } from "@/context/SocketContext";
import { useRouter } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";

import { usePathname } from "next/navigation";

export default function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const [headerText, setHeaderText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [image, setImage] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [inputValue, setInputValue] = useState<string>("");
  const [socketLoading, setSocketLoading] = useState<boolean>(false);
  const { socket, isConnected } = useSocket();
  const { isVoiceCallOpen, setIsVoiceCallOpen } = useNotification();

  const { user: currUser } = useUser();
  const { getToken } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  //fetch
  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();
      const conversationObject = await getConversation(
        token as string,
        params.id
      );

      if (!conversationObject) {
        router.push("/404");
      }
      const messages = await getAllMessages(token as string, params.id);

      setMessages(messages);

      const participants = conversationObject.participants.filter(
        (participant: Participant) =>
          currUser && participant.userId !== currUser.id
      );

      const users = participants.map((participant: Participant) => {
        return participant.user;
      });

      setUsers(users);
      if (users.length > 1) {
        setImage([users[0].imageUrl, users[1].imageUrl]);
      } else {
        setImage([users[0].imageUrl]);
      }

      const header = await users.map((user: User) => user.username).join(" | ");
      setHeaderText(header);

      setLoading(false);
    };

    if (currUser) {
      fetchData();
    }
  }, [getToken, params.id, currUser, router]);

  //handle incoming sockets
  useEffect(() => {
    const handleMessage = (msg: Message) => {
      console.log("Received message:", msg);
      setMessages((prevMessages) => [...prevMessages, msg]);
    };

    const handleEdit = (msg: Message) => {
      console.log("Received edited message:", msg);
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === msg.id
            ? { ...message, content: msg.content, edited: msg.edited }
            : message
        )
      );
    };

    socket.on(`message ${params.id}`, handleMessage);
    socket.on(`editMessage ${params.id}`, handleEdit);

    //cleans up by turning off functions when useEffect dismounts
    return () => {
      socket.off(`message ${params.id}`, handleMessage);
      socket.off(`editMessage ${params.id}`, handleEdit);
    };
  }, [params.id, socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (inputValue === "") {
      toast({
        variant: "destructive",
        title: "Message cannot be empty",
        description: "Please enter a message.",
      });
      return;
    }

    setSocketLoading(true);

    try {
      const result = await createMessage(params.id, inputValue);
      socket.emit("message", result);
      socket.emit("notification", result);
      setInputValue("");
      setSocketLoading(false);
    } catch (error: any) {
      console.log("Failed to create message:" + error);
    } finally {
      setSocketLoading(false);
    }
  };

  const startVoiceCall = () => {
    setIsVoiceCallOpen(true);
    socket.emit("newVoiceCall", params.id, currUser?.imageUrl);
  };

  return (
    <>
      {users.length > 0 ? (
        <>
          <ConvPageHeader
            headerText={headerText}
            image1={image[0]}
            image2={image[1]}
            hasMultipleUsers={users.length > 1}
            startVoiceCall={startVoiceCall}
          />

          <main className="w-full h-[calc(100%-3rem)] flex">
            <article className="w-4/5 h-full border-r border-zinc-800 flex flex-col relative px-0">
              {isVoiceCallOpen && <VoiceCallOverlay convId={params.id} />}
              <div
                className={`h-full w-full flex flex-col overflow-y-auto mb-4 ${
                  isVoiceCallOpen && "h-1/3"
                }`}
              >
                <ChatHeader name={headerText} imageUrl={users[0].imageUrl} />

                {messages.map((message: Message) => {
                  return (
                    <MessageCard
                      key={message.id}
                      message={message}
                      variant="conversation"
                    />
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="px-5">
                <ChatInput
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  handleSubmit={handleSubmit}
                  socketLoading={socketLoading}
                />
              </div>
            </article>

            <ConvProfilePanel imageUrl={image[0]} name={headerText} />
          </main>
        </>
      ) : (
        <ConvPageSkeleton />
      )}
    </>
  );
}
