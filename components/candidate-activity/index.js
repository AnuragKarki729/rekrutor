'use client';

import CommonCard from "../common-card";
import JobIcon from "../job-icon";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";

function CandidateActivity({ jobList, jobApplicants }) {
    console.log(jobList, jobApplicants);

    // Extract unique statuses based on the last value of the status array
    const uniqueStatusArray = [
        ...new Set(
            jobApplicants
                .map(jobApplicantItem => jobApplicantItem.status.slice(-1)[0]) // Get the last status
                .filter(Boolean) // Remove any null or undefined statuses
        )
    ];

    // console.log("Array",uniqueStatusArray);

    return (
        <div className="mx-auto max-w-8xl max-h-full "style={{background: "radial-gradient(circle,rgba(253, 144, 144, 0.64) 10%,rgba(156, 156, 251, 0.64) 40%,rgba(200, 200, 248, 0.84) 60%,rgba(224, 224, 251, 0.23) 80%,rgb(251, 251, 251) 90%,rgb(255, 253, 255) 90%)"}}>
            <Tabs defaultValue={uniqueStatusArray[0] || "Applied"} className="w-full bg-transparent">


                <div className="flex items-baseline justify-between pb-6 pt-24 bg-transparent">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-950">Your Activity</h1>
                    <TabsList>
                        {uniqueStatusArray.map((status, index) => (
                            <TabsTrigger key={index} value={status} className="font-bold text-lg">
                                {status}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>
                <div className="pb-24 pt-6 bg-transparent">
                    <div className="container mx-auto p-0 space-y-8 bg-transparent">
                        <div className="flex flex-col gap-4 bg-transparent">

                            {uniqueStatusArray.map((status, index) => (
                                <TabsContent key={index} value={status}>
                                    {jobList
                                        .filter(jobItem =>
                                            jobApplicants
                                                .filter(
                                                    jobApplication =>
                                                        jobApplication.status.slice(-1)[0] === status // Use the last status
                                                )
                                                .find(
                                                    filteredItemByStatus =>
                                                        jobItem._id === filteredItemByStatus.jobID
                                                )
                                        )
                                        .map(finalFilteredItem => {
                                            // Find the corresponding job application for this job
                                            const relatedApplication = jobApplicants.find(
                                                jobApplication =>
                                                    jobApplication.jobID === finalFilteredItem._id &&
                                                    jobApplication.status.slice(-1)[0] === status
                                            );

                                            console.log("relatedAPplication", relatedApplication)
                                            return (
                                                <CommonCard
                                                    key={finalFilteredItem._id}

                                                    icon={
                                                        <div className='mb-2 flex flex-col items-center justify-center gap-2'>
                                                            <JobIcon industry={finalFilteredItem.industry} className="h-25 w-25" />
                                                            <span className={`${status === "Applied"
                                                                    ? "bg-blue-500"
                                                                    : status === "Selected"
                                                                        ? "bg-green-500"
                                                                        : "bg-red-500"
                                                                } text-white px-2 py-2 rounded-full text-sm text-center`}
                                                            >
                                                                {status}
                                                            </span>
                                                        </div>
                                                    }
                                                    title={finalFilteredItem?.title}

                                                    description={
                                                        <>
                                                            {finalFilteredItem?.companyName}
                                                            {console.log(status, relatedApplication.rejectionReason)}
                                                            {status === "Rejected" && relatedApplication?.rejectionReason && (
                                                                <div className="text-red-600 font-semibold mt-2">
                                                                    Reason: {relatedApplication.rejectionReason}
                                                                </div>
                                                            )}
                                                            {status === "Rejected" && relatedApplication?.rejectionReason === null && (
                                                                <div className="text-red-600 font-semibold mt-2">
                                                                    Reason: Reason Not Specified
                                                                </div>
                                                            )}
                                                        </>
                                                    }
                                                />
                                            );
                                        })}
                                </TabsContent>
                            ))}
                        </div>
                    </div>
                </div>
            </Tabs>
        </div>
    );
}

export default CandidateActivity;