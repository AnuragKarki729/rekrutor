import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchProfileAction } from "@/actions";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import HomepageButtonControls from "@/components/homepage-button-controls";
import Image from "next/image";

async function Home() {
  const user = await currentUser();
  console.log(user, "currentUser");

  // If no user is logged in, redirect to the login page
  if (!user) {
    console.log("No user logged in, redirecting to login");
    redirect("/sign-in");
    return null;
  }

  // Check email domain
  const email = user.emailAddresses[0]?.emailAddress;
  console.log("User email:", email);
  
  const isGmail = email?.toLowerCase().endsWith('@gmail.com');
  const isCompanyEmail = !isGmail && email?.includes('@');
  
  console.log({
    isGmail,
    isCompanyEmail,
    emailDomain: email?.split('@')[1]
  });

  // Fetch profile information from the database
  const profileInfo = await fetchProfileAction(user.id);
  console.log(profileInfo, "profileInfo");

  // If the user does not have a profile, redirect to the onboarding page
  if (!profileInfo?._id) {
    console.log("No profile found, redirecting to onboard");
    redirect("/onboard");
    return null; // Stop further rendering
  }

  // If the user is authenticated and has a profile, render the main content
  return <Fragment>
    <div className="bg-white">
      <div className="relative w-full bg-white">
        
        <div className="min-h-screen flex" style={{background: "radial-gradient(circle,rgba(253, 144, 144, 0.64) 10%,rgba(156, 156, 251, 0.64) 40%,rgba(200, 200, 248, 0.84) 60%,rgba(224, 224, 251, 0.23) 80%,rgb(251, 251, 251) 90%,rgb(255, 253, 255) 90%)"}}>
          
          <div className="container m-auto p-0">
            <div className="flex flex-wrap items-center gap-12 lg:gap-0">
              <div className="lg:w-5/12 space-y-8">
              <span className="flex space-x-2">
                <span className="block w-100 mb-2">
                  <span className="text-md text-gray-900">One Stop Solution to find Jobs</span>
                  </span>
                  </span>
                  <h1 className="text-4xl font-bold md:text-6xl">
                    Recruiter App<br></br> Project
                  </h1>
                  <p className="text-lg text-gray-600">Find the best talent for your business
                    </p>
                  <HomepageButtonControls user={JSON.parse(JSON.stringify(user))} profileInfo={profileInfo}/>
              </div>
              <div className="sm:w-full relative lg:block lg:w-7/12">
              <Image width={900} height={600} 
                src="https://img.freepik.com/free-vector/choice-worker-concept-illustrated_52683-44076.jpg?t=st=1733500941~exp=1733504541~hmac=fc4b61f34a1f8bcf0485db22abecfe8f1be94c43b9bdca8127fe89d7f9126647&w=900"
                alt="Choice Worker Concept"
                layout="responsive"
                className="w-full h-full border-[4px] border-gray-900 object-cover rounded-md shadow-lg"
              />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </Fragment>;
}

export default Home;
