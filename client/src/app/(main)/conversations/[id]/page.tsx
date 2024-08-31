"use client";

import { useState, useEffect } from "react";
import { getConversation, getAllMessages } from "@/lib/conversations";
import { useAuth } from "@clerk/nextjs";
import { User, Message } from "@/types/index.js";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ChatInput from "@/components/conversations/ChatInput";
import ConvEmptyState from "@/components/empty-states/ConvEmptyState";
import MessageCard from "@/components/conversations/MessageCard";
import { socket } from "@/app/socket";

export default function Conversation({ params }: { params: { id: string } }) {
  const [chatTitle, setChatTitle] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [image, setImage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [chat, setChat] = useState<string[]>([]);
  // const { socket, isConnected } = useSocket({
  //   conversationId: params.id,
  // });

  const { user: currUser } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();
      const conversationObject = await getConversation(
        token as string,
        params.id
      );

      const messages = await getAllMessages(token as string, params.id);

      setMessages(messages);

      const users = conversationObject.users.filter(
        (user: User) => currUser && user.id !== currUser.id
      );

      setUsers(users);
      setImage(users[0].imageUrl);

      const header = await users.map((user: User) => user.username).join(" | ");
      setChatTitle(header);

      setLoading(false);
    };

    if (currUser) {
      fetchData();
    }
  }, [getToken, params.id, currUser]);

  useEffect(() => {
    socket.connect();
    if (socket.connected) {
      onConnect(); // If already connected, run the logic
    }
    //socket setup
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    const handleMessage = (msg: string) => {
      console.log("Received message:", msg);
      setChat((prevMessages) => [...prevMessages, msg]);
    };

    socket.on("connect", () => {
      onConnect();
    });
    socket.on("disconnect", onDisconnect);
    socket.emit("joinRoom", params.id);
    socket.on(`message ${params.id}`, handleMessage);

    //cleans up by turning off functions when useEffect dismounts
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [params.id]);

  const sendMessage = () => {
    socket.emit(`message`, {
      msg: "Hello world",
      conversationId: params.id,
    });
  };

  return (
    <>
      {users.length > 0 ? (
        <>
          <header className="flex w-full h-12 bg-zinc-900 border-b border-zinc-800 px-2 py-3 space-x-3 items-center ">
            <Avatar className="w-7 h-7 ml-2">
              <AvatarImage src={image} />
              <AvatarFallback>EY</AvatarFallback>
            </Avatar>
            <h1 className="text-gray-300 font-semibold">{chatTitle}</h1>
          </header>
          <p>Status: {isConnected ? "connected" : "disconnected"}</p>
          <button className="text-gray-300" onClick={sendMessage}>
            Press
          </button>

          <main className="w-full h-[calc(100%-3rem)] flex flex-col">
            <article className="w-3/4 h-full border-r border-zinc-800 flex flex-col relative px-5">
              <div className="h-full w-full flex flex-col overflow-y-auto mb-4">
                <ConvEmptyState name={chatTitle} imageUrl={users[0].imageUrl} />

                <div>
                  <h2>Messages:</h2>
                  <ul>
                    {chat.map((msg, index) => (
                      <li key={index}>{msg}</li>
                    ))}
                  </ul>
                </div>

                {messages.map((message: Message) => {
                  const sender = message.sender;

                  return (
                    <MessageCard
                      key={message.id}
                      name={sender.username}
                      message={message.content}
                      imageUrl={sender.imageUrl}
                    />
                  );
                })}
              </div>
              <ChatInput />
            </article>
          </main>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}
