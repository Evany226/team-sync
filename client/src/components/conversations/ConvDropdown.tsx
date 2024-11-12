"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConvDropdownItem from "./ConvDropdownItem";
import { getAllFriends } from "@/lib/friends";
import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Friend, User, Participant } from "@/types";
import { Button } from "../ui/button";
import { createConversation } from "@/actions/actions";
import { useToast } from "../ui/use-toast";
import { socket } from "@/app/socket";
import { ScrollArea } from "../ui/scroll-area";
import Loading from "../global/Loading";

export default function ConvDropdown({
  children,
}: {
  children: React.ReactNode;
}) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { getToken } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchFriends = async () => {
      setIsLoading(true);
      const token = await getToken();
      const response = await getAllFriends(token as string);
      setFriends(response);
      setIsLoading(false);
    };

    fetchFriends();
  }, [getToken]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    try {
      setModalOpen(false);
      const result = await createConversation(formData);
      socket.emit("joinConversation", {
        conversationId: result.id,
        participantIds: result.participants.map(
          (participant: Participant) => participant.userId
        ),
      });

      toast({
        variant: "default",
        title: "Conversation created",
        description: "You have successfully created a conversation.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create conversation",
        description:
          error.message ||
          "An error occurred while creating the conversation. Please try again later.",
      });
    }
  };

  return (
    <DropdownMenu open={modalOpen} onOpenChange={setModalOpen}>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        alignOffset={12}
        className="bg-zinc-800 px-4 py-2 "
      >
        <DropdownMenuLabel className="text-lg px-0 ">
          Select Friends
        </DropdownMenuLabel>
        <p className="text-gray-300 text-sm ">
          You can select a maximum of 10 friends to start a conversation.
        </p>
        <div className="w-full my-2">
          <input
            className="w-full outline-0 bg-zinc-900 text-gray-200 py-1.5 px-2 rounded-sm text-sm placeholder-gray-400"
            placeholder="Type the username of a friend."
          ></input>
        </div>
        <form onSubmit={handleSubmit}>
          <Loading isLoading={isLoading}>
            <ScrollArea className="w-full h-40 top-0 left-0 px-2">
              {friends.map((friend) => {
                return (
                  <ConvDropdownItem
                    id={friend.id}
                    key={friend.id}
                    username={friend.username}
                    imageUrl={friend.imageUrl}
                  />
                );
              })}
            </ScrollArea>
          </Loading>
          <Button type="submit" variant="outline" className="w-full py-1 mt-4 ">
            <p className="text-black font-medium">Create DM</p>
          </Button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
