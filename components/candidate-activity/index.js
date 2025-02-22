'use client';

import ActivityCard from "../activity-card";
import JobIcon from "../job-icon";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { useRouter } from "next/navigation";

function CandidateActivity({ jobList, jobApplicants }) {
    console.log(jobList, jobApplicants);
    const router = useRouter();
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
        <div className="mx-auto max-w-8xl min-h-screen" style={{
            background: "radial-gradient(circle,rgba(253, 144, 144, 0.64) 10%,rgba(156, 156, 251, 0.64) 40%,rgba(200, 200, 248, 0.84) 60%,rgba(224, 224, 251, 0.23) 80%,rgb(251, 251, 251) 90%,rgb(255, 253, 255) 90%)"
        }}>
            <Tabs defaultValue={uniqueStatusArray[0] || "Applied"} className="w-full">
                <div className="flex items-baseline justify-between pb-6 pt-24">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-950">Your Activity</h1>
                    <TabsList className="bg-transparent backdrop-blur-sm">
                        {uniqueStatusArray.map((status, index) => (
                            <TabsTrigger key={index} value={status} className="font-bold data-[state=active]:bg-blue-300 border-[3px] border-gray-900 rounded-full text-lg">
                                {status}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>
                
                <div className="pb-24 pt-6">
                    <div className="container mx-auto p-4">
                        {uniqueStatusArray.map((status, index) => (
                            <TabsContent key={index} value={status}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12">
                                    {jobList
                                        .filter(jobItem =>
                                            jobApplicants
                                                .filter(jobApplication => jobApplication.status.slice(-1)[0] === status)
                                                .find(filteredItemByStatus => jobItem._id === filteredItemByStatus.jobID)
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
                                                <ActivityCard
                                                    key={finalFilteredItem._id}
                                                    className="min-h-[100px] lg:min-h-[350px] xl:min-h-[400px] transition-all duration-300 hover:scale-105"
                                                    icon={

                                                        <div className='font-bold mb-2 flex flex-col items-center justify-center gap-2'>
                                                        
                                                            <span>{finalFilteredItem?.title}</span>
                                                            <span>{finalFilteredItem?.companyName}</span>
                                                            <span>{finalFilteredItem?.industry} Industry | {finalFilteredItem?.location} {finalFilteredItem?.salary === undefined ? "" : "| $" + finalFilteredItem?.salary + "/yr"}</span>
                                                            <span className={`${status === "Applied"
                                                                    ? "bg-blue-500 mt-2"
                                                                    : status === "Selected"
                                                                        ? "bg-green-500 mt-2"
                                                                        : "bg-red-500 mt-2"


                                                                    } text-white px-2 py-2 rounded-full text-sm text-center`}
                                                            >
                                                                {status}
                                                            </span>
                                                            <button 
                                                            onClick={() => {
                                                                router.push(`/mailto`)
                                                            }}
                                                            className="bg-gradient-to-r from-blue-500 to-purple-500 border-[3px] border-black text-white px-4 py-2 rounded-full text-sm text-center hover:scale-105 transition-all duration-300">
                                                                Want Acknowledgement?
                                                            </button>
                                                            


                                                        </div>
                                                    }
                                                    
                                                    description={
                                                        <>
                                                            
                                                            {status === "Rejected" && relatedApplication?.rejectionReason && (
                                                                <div className="text-red-600 text-center font-semibold mt-0">
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
                                </div>
                            </TabsContent>
                        ))}
                    </div>
                </div>
            </Tabs>
        </div>
    );
}

export default CandidateActivity;