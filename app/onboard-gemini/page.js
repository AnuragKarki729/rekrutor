import { fetchProfileAction } from "@/actions";
import OnBoard from "@/components/on-board-gemini";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Loading from "@/components/Loading";

async function onBoardPage({ searchParams }) {
   
    return <OnBoard />;
}

export default onBoardPage;
