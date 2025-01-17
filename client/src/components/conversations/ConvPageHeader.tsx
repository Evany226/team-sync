import {
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon,
  PhoneArrowUpRightIcon,
  UserCircleIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/solid";
import { TooltipWrapper } from "../global/TooltipWrapper";
import Image from "next/image";
import Link from "next/link";

interface ConvPageHeaderProps {
  headerText: string;
  image1: string;
  image2?: string;
  hasMultipleUsers: boolean;
  startVoiceCall: () => void;
  isPanelOpen: boolean;
  toggleProfilePanel: () => void;
}

export default function ConvPageHeader({
  headerText,
  image1,
  image2,
  hasMultipleUsers,
  startVoiceCall,
  isPanelOpen,
  toggleProfilePanel,
}: ConvPageHeaderProps) {
  return (
    <header className="flex justify-between w-full h-12 bg-zinc-900 border-b border-zinc-800 px-3 py-3 items-center">
      <div className="flex space-x-3 items-center">
        <Link href="/home/friends" className="hidden sm:block">
          <ArrowUturnLeftIcon className="w-6 h-6 text-gray-400 hover:text-gray-300 cursor-pointer" />
        </Link>
        <div className="w-10 h-10 relative flex items-center justify-center">
          {hasMultipleUsers ? (
            <>
              <div className="w-7 h-7 absolute top-0 left-0 border-2 border-neutral-900 rounded-full">
                <Image
                  src={image1}
                  alt="Conv profile picture"
                  fill
                  className="rounded-full"
                />
              </div>
              <div className="w-7 h-7 absolute right-0 bottom-0 border-2 border-neutral-900 rounded-full">
                <Image
                  src={image2 ?? ""}
                  alt="Conv profile picture"
                  fill
                  className="rounded-full"
                />
              </div>
            </>
          ) : (
            <div className="w-8 h-8 absolute">
              <Image
                src={image1}
                alt="Conv profile picture"
                className="rounded-full"
                fill
              />
            </div>
          )}
        </div>
        <h1 className="text-gray-300 font-semibold">{headerText}</h1>
      </div>

      <div className="flex space-x-4 items-center mr-2">
        <TooltipWrapper text="Start Call">
          <PhoneArrowUpRightIcon
            className="w-6 h-6 text-gray-400 hover:text-gray-300 cursor-pointer"
            onClick={startVoiceCall}
          />
        </TooltipWrapper>

        <TooltipWrapper
          text={`${isPanelOpen ? "Hide User Profile" : "Show User Profile"}`}
        >
          <UserCircleIcon
            className="w-6 h-6 text-gray-400 hover:text-gray-300 cursor-pointer"
            onClick={toggleProfilePanel}
          />
        </TooltipWrapper>

        <div className="flex items-center bg-zinc-800 rounded-sm py-1 px-2 sm:hidden">
          <input
            className="outline-0 w-full bg-zinc-800 font-semibold text-xs"
            placeholder="Search"
          ></input>
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 hover:text-gray-300 cursor-pointer" />
        </div>

        <TooltipWrapper text="Help">
          <QuestionMarkCircleIcon className="w-6 h-6 text-gray-400 hover:text-gray-300 cursor-pointer sm:hidden" />
        </TooltipWrapper>
      </div>
    </header>
  );
}
