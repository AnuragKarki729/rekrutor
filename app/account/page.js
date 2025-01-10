import { fetchProfileAction } from "@/actions";
import AccountInfo from "@/components/account-info";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/dist/server/api-utils";


export default async function AccountPage(){
    const user = await currentUser();
    const profileInfo = await fetchProfileAction(user?.id)
    if (!profileInfo) redirect ("/onboard")
    return (
        <div>
            <AccountInfo profileInfo={profileInfo}/>
        </div>
    )
}