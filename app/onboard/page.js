import { fetchProfileAction } from "@/actions";
import OnBoard from "@/components/on-board";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Loading from "@/components/Loading";

async function onBoardPage({ searchParams }) {
    const user = await currentUser();
    console.log("Current User:", user);

    if (!user) {
        console.error("User is not logged in");
        redirect("/login");
        return;
    }

    // Check email type
    const email = user.emailAddresses[0]?.emailAddress;
    const isGmail = email?.toLowerCase().endsWith('@gmail.com');
    
    const profileInfo = await fetchProfileAction(user.id);
    console.log("Profile Info:", profileInfo);

    // Handle existing profiles
    if (profileInfo?._id) {
        if (profileInfo.role === "recruiter" && !profileInfo.isPremiumUser) {
            redirect("/");
            return;
        } else {
            redirect("/");
            return;
        }
    }

    // If it's a new Gmail user and no type is specified in URL, redirect to candidate onboarding
    if (isGmail && !searchParams.type) {
        redirect("/onboard?type=candidate");
        return;
    }

    console.log("Rendering OnBoard component");
    
    return <OnBoard />;
}

export default onBoardPage;
