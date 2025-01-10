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
    return null; // Stop further rendering
  }

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
      <div className="relative w-full">
        <div className="min-h-screen flex">
          <div className="container m-auto p-0">
            <div className="flex flex-wrap items-center gap-12 lg:gap-0">
              <div className="lg:w-5/12 space-y-8">
              <span className="flex space-x-2">
                <span className="block w-100 mb-2 border-b-2 border-gray-700">
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
              <div className="hidden relative md:block lg:w-7/12">
              <Image width={900} height={600} 
                src="https://img.freepik.com/free-vector/choice-worker-concept-illustrated_52683-44076.jpg?t=st=1733500941~exp=1733504541~hmac=fc4b61f34a1f8bcf0485db22abecfe8f1be94c43b9bdca8127fe89d7f9126647&w=900"
                alt="Choice Worker Concept"
                layout="responsive"
                className="w-full h-full object-cover rounded-md shadow-lg"
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
