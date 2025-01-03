import { auth } from "@clerk/nextjs/server";

import ProfileCard from "../dashboard/profile/ProfileCard";
import CreateCategoryDialog from "./categories/CreateCategoryDialog";
import CategoryWrapper from "@/components/guilds/categories/CategoryWrapper";
import { Category } from "@/types";
import { Button } from "../ui/button";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { redirect } from "next/navigation";

import { getGuild, getMember } from "@/lib/guilds";
import GuildDropdown from "./GuildDropdown";
import { ScrollArea } from "../ui/scroll-area";

export default async function GuildLeftPanel({ guildId }: { guildId: string }) {
  const { getToken } = auth();
  const token = await getToken();
  const guild = await getGuild(token as string, guildId);

  if (!guild) {
    redirect("/friends");
  }

  const currentMember = await getMember(token as string, guildId);

  return (
    <div className="flex flex-col min-w-64 h-full bg-neutral-900 border-x border-zinc-800 relative md:min-w-56 sm:w-full">
      <GuildDropdown guild={guild} currentMember={currentMember}>
        <header className="w-full flex items-center justify-between h-12 bg-neutral-900 border-b border-zinc-800 px-4 cursor-pointer hover:bg-neutral-800">
          <h1 className="text-gray-300 text-base font-semibold">
            {guild.name}
          </h1>
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        </header>
      </GuildDropdown>

      <ScrollArea className="flex flex-col h-[calc(100%-7rem)] px-3 w-full">
        {guild.categories.map((category: Category) => (
          <CategoryWrapper
            key={category.id}
            name={category.name}
            channels={category.channels}
            guildId={guildId}
            guildName={guild.name}
            categoryId={category.id}
          />
        ))}
        <CreateCategoryDialog guildId={guildId}>
          <Button variant="outline" className="w-full mt-4 mb-2">
            Create Category
          </Button>
        </CreateCategoryDialog>
      </ScrollArea>

      <ProfileCard />
    </div>
  );
}
