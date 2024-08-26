import FriendsNavButton from "./friends/FriendsNavButton";
import DirectMessageWrapper from "./direct-messages/DmCard";
import ProfileCard from "./profile/ProfileCard";
import { getAllConversations } from "@/lib/conversations";
import { auth } from "@clerk/nextjs/server";

export default async function ConversationsPanel() {
  const { getToken } = auth();
  const token = await getToken();
  const data = await getAllConversations(token as string);

  return (
    <div className="flex flex-col w-64 h-full bg-neutral-900 border-x border-zinc-800 relative">
      <header className="flex items-center justify-center w-full h-12 bg-neutral-900 border-b border-zinc-800 px-3">
        <input
          className="outline-0 rounded-sm w-full bg-zinc-800 text-xs py-1 px-2"
          placeholder="Find or start a conversation"
        ></input>
      </header>

      <div className="flex flex-col p-3">
        <FriendsNavButton />
        <DirectMessageWrapper conversations={data} />
      </div>

      <ProfileCard />
    </div>
  );
}