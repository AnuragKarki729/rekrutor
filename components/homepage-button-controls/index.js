'use client'

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useEffect } from "react";

function HomepageButtonControls({user, profileInfo}) {
    const router = useRouter();

    useEffect(()=>{
        router.refresh()
    }, [])
    return ( <div className="flex space-x-4">
        
        <Button onClick={()=> user ? profileInfo.role === 'candidate' ? router.push('/membership') : router.push('/jobs') : router.push('/jobs')} className="flex h-11 items-center justify-center px-5 bg-gradient-to-r from-purple-900 to-blue-500 text-center">
          {
            user ? profileInfo.role === 'candidate' ? "Create Video CV" : "Jobs Dashboard" : "Find A Job Today"
          }
        </Button>
        <Button onClick={()=>router.push(
            user ? profileInfo?.role === 'candidate' ? '/jobs' : '/myapplicants' : 'jobs'
        )} className="flex h-11 items-center justify-center px-5">
          {
            user ? profileInfo?.role === 'candidate' ? "Browse Jobs" : "My Applicants" : "Post Vacancy"
          }
        </Button>
      </div> );
}

export default HomepageButtonControls;