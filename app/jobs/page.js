import { createFilterCategoryAction, fetchJobApplicationsForCandidate, fetchJobApplicationsForRecruiter, fetchJobsForCandidateAction, fetchJobsForRecruiterAction, fetchProfileAction } from "@/actions";
import JobListing from "@/components/job-listing"
import { currentUser } from "@clerk/nextjs/server";
import Loading from "@/components/Loading";


async function JobPage({ searchParams }) {
    // Convert searchParams to a regular object
    const params = Object.fromEntries(
        Object.entries(searchParams || {})
    );

    const user = await currentUser();
    const profileInfo = await fetchProfileAction(user?.id);

    const jobList = 
        profileInfo?.role === 'candidate' ? 
        await fetchJobsForCandidateAction(params) :
        await fetchJobsForRecruiterAction(user?.id);

    const getJobApplicationList = profileInfo?.role === 'candidate' ? 
        await fetchJobApplicationsForCandidate(user?.id) :
        await fetchJobApplicationsForRecruiter(user?.id)

    const fetchFilterCategories = await createFilterCategoryAction()
    if (!jobList || !getJobApplicationList || !fetchFilterCategories) return <Loading />

    return (

        <div>
            <JobListing
            user = {JSON.parse(JSON.stringify(user))}
            profileInfo = {profileInfo}
            jobList={jobList}
            jobApplications={getJobApplicationList}
            filterCategories = {fetchFilterCategories}/>
        </div>
    )
}

export default JobPage