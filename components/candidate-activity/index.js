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

    console.log(uniqueStatusArray);

    return (
        <div className="mx-auto max-w-7xl">
            <Tabs defaultValue={uniqueStatusArray[0] || "Applied"} className="w-full">
                <div className="flex items-baseline justify-between border-b pb-6 pt-24">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-950">Your Activity</h1>
                    <TabsList>
                    {uniqueStatusArray.map((status, index) => (
                        <TabsTrigger key={index} value={status} className= "font-bold text-lg">
                            {status}
                        </TabsTrigger>
                    ))}
                </TabsList>
                </div>
                <div className="pb-24 pt-6">
                    <div className="container mx-auto p-0 spacr-y-8">
                        <div className="flex flex-col gap-4">
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
                                        .map(finalFilteredItem => (
                                            <CommonCard
                                                key={finalFilteredItem._id}
                                                icon={<JobIcon/>}
                                                title={finalFilteredItem?.title}
                                                description={finalFilteredItem?.companyName}
                                            />
                                        ))}
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