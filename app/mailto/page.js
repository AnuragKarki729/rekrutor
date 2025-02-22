import MailComponent from '@/components/mail-component';
import { currentUser } from '@clerk/nextjs/server';
import {
  fetchProfileAction,
  fetchJobApplicationsForRecruiter,
  fetchJobApplicationsForCandidate,
  fetchJobsForCandidateAction,
} from '@/actions';
import Profile from '@/models/profile';
import Loading from "@/components/Loading";

export default async function MailPage() {
  const user = await currentUser();
  const userID = user?.id;
  


  const userInfo = await fetchProfileAction(userID);
  //console.log(userInfo)
  const role = userInfo?.role;
  const userEmail = userInfo.email;
  const userName = role === 'candidate' ? userInfo?.candidateInfo?.name : 
  userInfo?.recruiterInfo?.name;


  

  if (role === 'candidate') {

    const jobList = await fetchJobsForCandidateAction();
    const jobApplicants = await fetchJobApplicationsForCandidate(userID);

    //console.log(jobList, "jobList")

    const selectedJobApplications = jobApplicants.filter(
      (application) => application.status.slice(-1)[0] === 'Selected'
    );
    const rejectedJobApplications = jobApplicants.filter(
      (application) => application.status.slice(-1)[0] === 'Rejected'
    );
    const appliedJobApplications = jobApplicants.filter(
      (application) => application.status.slice(-1)[0] === 'Applied'
    );
    
    const selectedData = await Promise.all(
        selectedJobApplications.map(async (application) => {
          const jobDetails = jobList.find((job) => job._id === application.jobID);
      
          if (!jobDetails?.recruiterId) return null; // Handle missing recruiterId
      
          const recruiter = await Profile.findOne({ userId: jobDetails.recruiterId });
      
          if (!recruiter) return null; // Handle missing recruiter profile
      
          const recruiterEmail = recruiter.email;
      
          return [recruiterEmail, jobDetails?.title, jobDetails?.companyName, application.jobID, jobDetails?.hiredFlag];
        })
      );


    

    const rejectedData = await Promise.all(
        rejectedJobApplications.map(async (application) => {
          const jobDetails = jobList.find((job) => job._id === application.jobID);
      
          if (!jobDetails?.recruiterId) return null; // Handle missing recruiterId
      
          const recruiter = await Profile.findOne({ userId: jobDetails.recruiterId });
      
          if (!recruiter) return null; // Handle missing recruiter profile
      
          const recruiterEmail = recruiter.email;
      
          return [recruiterEmail, jobDetails?.title, jobDetails?.companyName, application.jobID, jobDetails?.hiredFlag];
        })
      );

    if (!selectedData || !rejectedData) return <Loading />

    const appliedData = await Promise.all(
      appliedJobApplications.map(async (application) => {
        const jobDetails = jobList.find((job) => job._id === application.jobID);
      
        if (!jobDetails?.recruiterId) return null; // Handle missing recruiterId
    
        const recruiter = await Profile.findOne({ userId: jobDetails.recruiterId });
    
        if (!recruiter) return null; // Handle missing recruiter profile
    
        const recruiterEmail = recruiter.email;
    
        return [recruiterEmail, jobDetails?.title, jobDetails?.companyName, application.jobID, jobDetails?.hiredFlag];
       })
    );


    // console.log("HELLO", rejectedData)

    return (
      <div className="w-full h-[1000px] overflow-hidden"style={{background: "radial-gradient(circle,rgba(253, 144, 144, 0.64) 10%,rgba(156, 156, 251, 0.64) 40%,rgba(200, 200, 248, 0.84) 60%,rgba(224, 224, 251, 0.23) 80%,rgb(251, 251, 251) 90%,rgb(255, 253, 255) 90%)"}}>
      <MailComponent
        selectedData={selectedData.filter(Boolean)}
        rejectedData={rejectedData.filter(Boolean)}
        appliedData={appliedData.filter(Boolean)}
        role={role}
        userEmail={userEmail}
        userName={userName}
      />
      </div>
    );
  }



  if (role === 'recruiter') {

    
    const jobList = await fetchJobsForCandidateAction();
    const jobApplicants = await fetchJobApplicationsForRecruiter(userID);
    const selectedJobApplications = jobApplicants.filter(
        (application) => application.status.slice(-1)[0] === 'Selected'
    );

    const selectedData = selectedJobApplications.map((application) => {
        const jobDetails = jobList.find((job) => job._id === application.jobID);
        //console.log(jobDetails, "jobDetails")
        
        return [
            application.email,      // Candidate email
            application.name,       // Candidate name
            jobDetails?.title,      // Job title
            jobDetails?.companyName, // Company name
            application.jobID,      // Added jobID
            jobDetails?.hiredFlag
        ];
    });


    if (!selectedData) return <Loading />
    return (
        <MailComponent
            selectedData={selectedData.filter(Boolean)} // Added filter(Boolean) to remove any null entries
            role={role}
            userEmail={userEmail}
            userName={userName}
        />
    );
  }

  return <p>Invalid role.</p>;
}
