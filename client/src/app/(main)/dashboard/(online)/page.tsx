import FriendsWrapper from "@/components/friends/FriendsCard";
import { getPending } from "@/services/friends";

export default async function Dashboard() {
  const friends = await getPending();

  return (
    <div className="w-full h-full">
      <div className="flex flex-col items-center w-3/4 h-full px-4 py-3 border-r border-zinc-800">
        {/* <button onClick={() => testFetch()}>hello</button> */}
        <FriendsWrapper />
      </div>
    </div>
  );
}
