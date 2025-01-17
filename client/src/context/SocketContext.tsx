"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { socket } from "@/app/socket";
import { useAuth } from "@clerk/nextjs";
import { Conversation, Message } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { formatTimestamp } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { getAllConversationIds } from "@/lib/conversations";
import { getUserChannelIds, getUserGuildIds } from "@/lib/guilds";
import { useUser } from "@clerk/nextjs";
import { useVoiceCall } from "./VoiceCallContext";
import { useGuild } from "./GuildContext";
import { useVoiceRoom } from "./VoiceRoomContext";
import { useAudio } from "./AudioContext";

interface SocketContextProps {
  socket: typeof socket;
  isConnected: boolean;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const { createAlert, isVoiceCallOpen } = useVoiceCall();
  const { addParticipant, removeParticipant, updateMuteStatus } = useGuild();
  const { isConnected: isVoiceChannelOpen, room } = useVoiceRoom();
  const router = useRouter();
  const { playLeaveSound, playJoinSound } = useAudio();

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [hasFetchedConversations, setHasFetchedConversations] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    const token = await getToken();
    const [conversationIds, channelIds, guildIds] = await Promise.all([
      getAllConversationIds(token as string),
      getUserChannelIds(token as string),
      getUserGuildIds(token as string),
    ]);

    socket.emit("joinRoom", conversationIds);
    socket.emit("joinRoom", channelIds);
    socket.emit("joinRoom", guildIds);
  }, [user, getToken]);

  useEffect(() => {
    if (!user) return;

    socket.connect();

    if (!hasFetchedConversations) {
      fetchConversations();
      setHasFetchedConversations(true); // flag to prevent re-fetching
    }

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("joinOnline", user?.id);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("notification", (data: Message) => {
      const { content, sender } = data;

      const senderUser = sender.user;
      console.log("notification received");
      toast({
        title: `${senderUser.username}`,
        description: `${content}`,
        image: senderUser.imageUrl,
        createdAt: `${formatTimestamp(data.createdAt)}`,
      });
    });

    socket.on(`newChannel`, (channelId: string) => {
      socket.emit("joinChannel", channelId);
      console.log("once");
    });

    socket.on("refresh", () => {
      //revalidates the other clients when a new conversation is created
      console.log("refreshed");
      router.refresh();
    });

    socket.on("onlineUsers", (data: string[]) => {
      setOnlineUsers(data);
    });

    socket.on(
      "incomingVoiceCall",
      (conversationId: string, imageUrl: string) => {
        console.log("incoming call");
        createAlert("Incoming call", conversationId, imageUrl);
      }
    );

    socket.on("leaveVoiceCall", () => {
      if (isVoiceCallOpen) {
        console.log("other user left");
        playLeaveSound();
      }
    });

    socket.on("joinVoiceCall", () => {
      if (isVoiceCallOpen) {
        console.log("other user joined");
        playJoinSound();
      }
    });

    const socketAddParticipant = (channelId: string, username: string) => {
      addParticipant(channelId, username);

      if (isVoiceChannelOpen && room && room.name === channelId) {
        playJoinSound();
      }
    };

    socket.on("joinVoiceChannel", socketAddParticipant);

    const socketRemoveParticipant = (channelId: string, username: string) => {
      removeParticipant(channelId, username);

      if (isVoiceChannelOpen && room && room.name === channelId) {
        playLeaveSound();
      }
    };

    socket.on("leaveVoiceChannel", socketRemoveParticipant);

    const socketMuteVoiceChannel = (
      channelId: string,
      username: string,
      isMuted: boolean
    ) => {
      updateMuteStatus(channelId, username, isMuted);
    };

    socket.on("muteVoiceChannel", socketMuteVoiceChannel);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("notification");
      socket.off("onlineUsers");
      socket.off("refresh");
      socket.off("incomingVoiceCall");
      socket.off("leaveVoiceCall");
      socket.off("joinVoiceCall");
      socket.off("joinVoiceChannel");
      socket.off("leaveVoiceChannel");
      socket.off("muteVoiceChannel");
    };
  }, [
    createAlert,
    getToken,
    toast,
    router,
    user,
    playLeaveSound,
    playJoinSound,
    isVoiceCallOpen,
    addParticipant,
    removeParticipant,
    isVoiceChannelOpen,
    room,
    updateMuteStatus,
    fetchConversations,
    hasFetchedConversations,
  ]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextProps => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
