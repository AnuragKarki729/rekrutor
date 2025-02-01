import { createFilterCategoryAction, fetchJobApplicationsForCandidate, fetchJobApplicationsForRecruiter, fetchJobsForCandidateAction, fetchJobsForRecruiterAction, fetchProfileAction } from "@/actions";
import JobListing from "@/components/job-listing"
import { currentUser } from "@clerk/nextjs/server";
import Loading from "@/components/Loading";


async function JobPage({ searchParams }) {
    const user = await currentUser();
    const profileInfo = await fetchProfileAction(user?.id);

    // Safely handle searchParams
    const initialSearchTerm = await (searchParams ? searchParams.search || '' : '');

    const jobList = profileInfo?.role === 'candidate' ? 
        await fetchJobsForCandidateAction(searchParams) :
        await fetchJobsForRecruiterAction(user?.id);

    const getJobApplicationList = profileInfo?.role === 'candidate' ? 
        await fetchJobApplicationsForCandidate(user?.id) :
        await fetchJobApplicationsForRecruiter(user?.id);

    const fetchFilterCategories = await createFilterCategoryAction();
    
    if (!jobList || !getJobApplicationList || !fetchFilterCategories) return <Loading />;

    return (
        <div>
            <JobListing
                user={JSON.parse(JSON.stringify(user))}
                profileInfo={profileInfo}
                jobList={jobList}
                jobApplications={getJobApplicationList}
                filterCategories={fetchFilterCategories}
                initialSearchTerm={initialSearchTerm}
            />
        </div>
    );
}

export default JobPage;