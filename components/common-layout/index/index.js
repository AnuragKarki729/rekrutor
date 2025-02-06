import { fetchProfileAction } from "@/actions";
import Header from "@/components/header"
import { currentUser } from "@clerk/nextjs/server"
import { Toaster } from 'react-hot-toast';
async function CommonLayout({children}){
    const user = await currentUser();
    const profileInfo = await fetchProfileAction(user?.id)
    return (
        <div className="mx-auto max-w-8xl p-6 lg:px-8" style={{background: "radial-gradient(circle,rgba(253, 144, 144, 0) 10%,rgba(156, 156, 251, 0) 40%,rgba(200, 200, 248, 0.6) 60%,rgba(224, 224, 251, 0.15) 80%,rgb(251, 251, 251) 90%,rgb(255, 253, 255) 90%)"}}>
           <Toaster position="top-center" />
            {/* Header Component*/}
            <Header 
            profileInfo = {profileInfo}
            user  = {JSON.parse(JSON.stringify(user))}/>
            {/* Header Component*/}


            {/* Main Component*/}
            <main>{children}</main>
            {/* Main Component*/}


        </div>
    )
}

export default CommonLayout