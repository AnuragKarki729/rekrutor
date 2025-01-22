import { fetchJobApplicationsForCandidate, fetchJobsForCandidateAction } from "@/actions"
import CandidateActivity from "@/components/candidate-activity"
import { currentUser } from "@clerk/nextjs/server"
import Loading from "@/components/Loading"



export default async function Activity(){
    const user = await currentUser()
    const jobList = await fetchJobsForCandidateAction()
    const jobApplicants = await fetchJobApplicationsForCandidate(user?.id)
    if (!jobList || !jobApplicants) return <Loading />
    return (
        <div>
            <CandidateActivity 
            jobList={jobList}
            jobApplicants={jobApplicants}/>
        </div>
    )
}