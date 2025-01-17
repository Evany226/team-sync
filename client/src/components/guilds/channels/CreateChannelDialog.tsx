"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import GuildDialogFooter from "../GuildDialogFooter";
import { HashtagIcon, SpeakerWaveIcon } from "@heroicons/react/24/solid";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { createChannel } from "@/actions/actions";
import { useSocket } from "@/context/SocketContext";

interface CreateChannelDialogProps {
  children: React.ReactNode;
  categoryId: string;
  guildId: string;
}

export default function CreateChannelDialog({
  children,
  categoryId,
  guildId,
}: CreateChannelDialogProps) {
  const { toast } = useToast();
  const { socket } = useSocket();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("test chanel submit");
    const formData = new FormData(e.target as HTMLFormElement);
    formData.set("categoryId", categoryId);

    const channelType = formData.get("channel");
    const name = formData.get("name");

    console.log(formData.get("channel"));

    if (!channelType) {
      toast({
        variant: "destructive",
        title: "Failed to create channel",
        description:
          "The channel type field cannot be empty. Please select a valid channel type.",
      });
      return;
    }

    if (!name) {
      toast({
        variant: "destructive",
        title: "Failed to create channel",
        description:
          "The channel name field cannot be empty. Please enter a valid channel name.",
      });
      return;
    }

    formData.set("name", name.toString().toLowerCase());

    try {
      setDialogOpen(false);
      const result = await createChannel(formData);
      socket.emit("refresh", guildId);
      toast({
        variant: "default",
        title: "Channel created",
        description: "You have successfully created a channel.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create channel",
        description:
          error.message ||
          "An error occurred while creating the channel. Please try again later.",
      });
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="bg-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-gray-300 ">Create Channel</DialogTitle>
          <DialogDescription>
            Your channel is where you and your friends hangout. Make yours and
            start talking.
          </DialogDescription>
        </DialogHeader>
        <form className=" w-full flex flex-col" onSubmit={handleSubmit}>
          <section className="w-full flex flex-col space-y-2">
            <label className="text-gray-300 text-sm font-semibold">
              CHANNEL TYPE
            </label>

            <label className="flex items-center w-full bg-zinc-900 border border-zinc-700 py-2 px-3 justify-between hover:bg-zinc-700 cursor-pointer">
              <div className="flex items-center w-11/12">
                <HashtagIcon className="w-5 text-gray-300" />
                <div className="flex flex-col">
                  <p className="text-gray-300 text-base font-medium ml-2">
                    Text
                  </p>
                  <p className="text-gray-400 text-sm ml-2">
                    Send messages, images, emojis, opinions and puns.
                  </p>
                </div>
              </div>
              <div className="h-full w-1/12 flex items-center justify-center">
                <input
                  type="radio"
                  name="channel"
                  className=""
                  value="text"
                ></input>
              </div>
            </label>

            <label className="flex items-center w-full bg-zinc-900 border border-zinc-700 py-2 px-3 hover:bg-zinc-700 cursor-pointer">
              <div className="flex items-center w-11/12">
                <SpeakerWaveIcon className="w-5 text-gray-300" />
                <div className="flex flex-col">
                  <p className="text-gray-300 text-base font-medium ml-2">
                    Voice
                  </p>
                  <p className="text-gray-400 text-sm ml-2">
                    Hang out together with a voice call.
                  </p>
                </div>
              </div>
              <div className="h-full w-1/12 flex items-center justify-center">
                <input
                  type="radio"
                  name="channel"
                  className=""
                  value="voice"
                ></input>
              </div>
            </label>
          </section>

          <aside className="flex flex-col space-y-2 mt-4">
            <label className="text-gray-300 text-sm font-semibold">
              CHANNEL NAME
            </label>
            <div className="flex items-center bg-neutral-900 px-2 rounded-md">
              <HashtagIcon className="w-5 text-gray-300" />
              <input
                className="outline-0 w-full bg-neutral-900 text-sm py-2 px-1 text-gray-300 lowercase"
                placeholder="new-channel"
                name="name"
              ></input>
            </div>
          </aside>

          <GuildDialogFooter
            dialogFunc={() => setDialogOpen(false)}
            text="Create"
            variant="Channel"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
