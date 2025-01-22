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
  console.log(userInfo)
  const role = userInfo?.role;
  const userEmail = userInfo.email;
  const userName = role === 'candidate' ? userInfo?.candidateInfo?.name : 
  userInfo?.recruiterInfo?.name;


  

  if (role === 'candidate') {
    const jobList = await fetchJobsForCandidateAction();
    const jobApplicants = await fetchJobApplicationsForCandidate(userID);

    console.log(jobApplicants, "jobApplicants")

    const selectedJobApplications = jobApplicants.filter(
      (application) => application.status.slice(-1)[0] === 'Selected'
    );
    const rejectedJobApplications = jobApplicants.filter(
      (application) => application.status.slice(-1)[0] === 'Rejected'
    );

    const selectedData = await Promise.all(
        selectedJobApplications.map(async (application) => {
          const jobDetails = jobList.find((job) => job._id === application.jobID);
      
          if (!jobDetails?.recruiterId) return null; // Handle missing recruiterId
      
          const recruiter = await Profile.findOne({ userId: jobDetails.recruiterId });
      
          if (!recruiter) return null; // Handle missing recruiter profile
      
          const recruiterEmail = recruiter.email;
      
          return [recruiterEmail, jobDetails?.title, jobDetails?.companyName];
        })
      );


    

    const rejectedData = await Promise.all(
        rejectedJobApplications.map(async (application) => {
          const jobDetails = jobList.find((job) => job._id === application.jobID);
      
          if (!jobDetails?.recruiterId) return null; // Handle missing recruiterId
      
          const recruiter = await Profile.findOne({ userId: jobDetails.recruiterId });
      
          if (!recruiter) return null; // Handle missing recruiter profile
      
          const recruiterEmail = recruiter.email;
      
          return [recruiterEmail, jobDetails?.title, jobDetails?.companyName];
        })
      );

    if (!selectedData || !rejectedData) return <Loading />

    // console.log("HELLO", rejectedData)
    return (
      <MailComponent
        selectedData={selectedData.filter(Boolean)}
        rejectedData={rejectedData.filter(Boolean)}
        role={role}
        userEmail={userEmail}
        userName={userName}
      />
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
      return [
        application.email, // Candidate email
        application.name, // Candidate name
        jobDetails?.title, // Job title
        jobDetails?.companyName, // Company name
      ];
    });
  
    if (!selectedData) return <Loading />
    return (
      <MailComponent
        selectedData={selectedData}
        role={role}
        userEmail={userEmail}
        userName={userName}
      />
    );
  }

  return <p>Invalid role.</p>;
}
