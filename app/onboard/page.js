import { fetchProfileAction } from "@/actions";
import OnBoard from "@/components/on-board";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function onBoardPage() {
    const user = await currentUser();
    console.log("Current User:", user);

    if (!user) {
        console.error("User is not logged in");
        redirect("/login");
        return; // Stop further execution
    }

    const profileInfo = await fetchProfileAction(user.id);
    console.log("Profile Info:", profileInfo);

    if (profileInfo?._id) {
        if (profileInfo.role === "recruiter" && !profileInfo.isPremiumUser) {
            redirect("/");
            return; // Stop further execution
        } else {
            redirect("/");
            return; // Stop further execution
        }
    }

    console.log("Rendering OnBoard component");
    return <OnBoard />;
}

export default onBoardPage;
