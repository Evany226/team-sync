"use client";

import { getLiveKitToken } from "@/lib/friends";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
} from "@livekit/components-react";

import "@livekit/components-styles";

import { Track } from "livekit-client";

const serverUrl = "wss://harmony-zknfyk4k.livekit.cloud";

export default function Page({ params }: { params: { id: string } }) {
  // TODO: get user input for room and name
  const room = "quickstart-room";
  const name = "quickstart-user";
  const [token, setToken] = useState("");
  const { user } = useUser();
  const userName = user?.username;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomName = params.id;
        const token = await getLiveKitToken(roomName, userName as string);
        console.log(token);
        setToken(token);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [params.id, userName]);

  if (token === "") {
    return <div>Getting token...</div>;
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={serverUrl}
      // Use the default LiveKit theme for nice styles.
      data-lk-theme="default"
      style={{ height: "100dvh" }}
    >
      {/* Your custom component with basic video conferencing functionality. */}
      <MyVideoConference />
      {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
      <RoomAudioRenderer />
      {/* Controls for the user to start/stop audio, video, and screen
        share tracks and to leave the room. */}
      <ControlBar />
    </LiveKitRoom>
  );
}

function MyVideoConference() {
  // `useTracks` returns all camera and screen share tracks. If a user
  // joins without a published camera track, a placeholder track is returned.
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  return (
    <GridLayout
      tracks={tracks}
      style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
    >
      {/* The GridLayout accepts zero or one child. The child is used
        as a template to render all passed in tracks. */}
      <ParticipantTile />
    </GridLayout>
  );
}
