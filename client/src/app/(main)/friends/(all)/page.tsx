import FriendsWrapper from "@/components/dashboard/friends/FriendsCard";
import { auth } from "@clerk/nextjs/server";
import { getAllFriends } from "@/lib/friends";
import { currentUser } from "@clerk/nextjs/server";
import { SignedIn } from "@clerk/nextjs";

export default async function Dashboard() {
  const { getToken } = auth();
  const user = await currentUser();
  const token = await getToken();

  if (!token) {
    return null;
  }

  const data = await getAllFriends(token as string);

  return (
    <SignedIn>
      <div className="flex flex-col items-center w-3/4 h-full py-3 overflow-y-hidden">
        <FriendsWrapper
          friends={data}
          variant="All"
          emptyStateText="You currently have no friends. What a shame."
        />
      </div>
    </SignedIn>
  );
}
