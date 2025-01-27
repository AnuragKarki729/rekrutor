'use client'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { useEffect, useState } from "react"
import { filterMenuDataArray, formUrlQuery } from "@/utils"
import CandidateJobCard from "../candidate-job-card"
import PostNewJob from "../post-new-job"
import RecruiterJobCard from "../recruiter-job-card"
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "../ui/menubar"
import { Label } from "../ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "../ui/button"
import { X } from "lucide-react"
import {Alert, AlertDescription} from "../ui/alert"




function JobListing({ user, profileInfo, jobList, jobApplications, filterCategories }) {
    console.log("All Jobs:", jobList);
    console.log("Job Applications:", jobApplications);
    console.log("Profile Info:", profileInfo);

    const searchParams = useSearchParams()
    const router = useRouter()
    const hasVideoCV= profileInfo?.candidateInfo?.hasVideoCV


    const filterMenu = filterMenuDataArray.map(item => ({
        id: item.id,
        name: item.label,
        options: [
            ...new Set(filterCategories.map(listItem => listItem[item.id]))
        ]
    }))

    const [filterParams, setFilterParams] = useState({})
    const [activeTab, setActiveTab] = useState('High Match Potential')
    const [loading, setLoading] = useState(false)


    async function handleFilter(getSectionID, getCurrentOption) {
        try {
            setLoading(true)
            let copyFilter = { ...filterParams }

            // Update filter params logic (keep existing)
            if (Object.keys(copyFilter).indexOf(getSectionID) === -1) {
                copyFilter = {
                    ...copyFilter,
                    [getSectionID]: [getCurrentOption]
                };
            } else {
                const indexOfCurrentOption = copyFilter[getSectionID].indexOf(getCurrentOption)
                if (indexOfCurrentOption === -1) {
                    copyFilter[getSectionID].push(getCurrentOption)
                } else {
                    copyFilter[getSectionID].splice(indexOfCurrentOption, 1)
                }
            }

            setFilterParams(copyFilter)
            sessionStorage.setItem('filterParams', JSON.stringify(copyFilter))

            // Call the REST API with filters
            const queryString = new URLSearchParams()
            Object.entries(copyFilter).forEach(([key, values]) => {
                if (values.length > 0) {
                    queryString.append(key, values.join(','))
                }
            })

            // Update URL with new filters
            router.push(`/jobs?${queryString.toString()}`, { scroll: false })

        } catch (error) {
            console.error('Error applying filters:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setFilterParams(JSON.parse(sessionStorage.getItem('filterParams')))
    }, [])

    useEffect(() => {
        if (filterParams && Object.keys(filterParams).length > 0) {
            console.log("Search Params:", searchParams.toString());
            console.log("Filter Params:", filterParams);

            let url = formUrlQuery({
                params: searchParams.toString(),
                dataToAdd: filterParams
            });

            console.log("Generated URL:", url); // Log the generated URL
            router.push(url, { scroll: false });
        }
    }, [filterParams, searchParams]);

    const appliedJobs = jobList.filter(jobItem => 
        jobApplications.some(
            application => {
                return application.jobID === jobItem._id && 
                       application.status[0] === "Applied";
            }
        )
    );
    console.log("Applied Jobs:", appliedJobs);

    const filteredJobList = {
        "All Jobs": jobList,
        "High Match Potential": jobList.filter(jobItem => {
            const jobExperience = parseFloat(jobItem?.experience?.match(/[\d.]+/)?.[0]) || 0
            const candidateExperience = profileInfo?.candidateInfo?.totalExperience || 0
            const candidateSkills = profileInfo?.candidateInfo?.skills?.split(",").map(skill => skill.trim().toLowerCase()) || []
            const jobSkills = jobItem?.skills?.split(",").map(skill => skill.trim().toLowerCase()) || []

            const ExperienceGap = jobExperience - candidateExperience


            const HighexperienceMatch = ExperienceGap <= 0;
            const HighSkillsMatch = candidateSkills.some(skill => jobSkills.includes(skill));


            return HighexperienceMatch && HighSkillsMatch && !appliedJobs.some(jobItem => jobItem._id === jobItem._id)  ; // Only consider high match potential
        }),
        "Low Match Potential": jobList.filter(jobItem => {
            const jobExperience = parseFloat(jobItem?.experience?.match(/[\d.]+/)?.[0]) || 0;
            const candidateExperience = profileInfo?.candidateInfo?.totalExperience || 0;
            const candidateSkills = profileInfo?.candidateInfo?.skills?.split(",").map(skill => skill.trim().toLowerCase()) || [];
            const jobSkills = jobItem?.skills?.split(",").map(skill => skill.trim().toLowerCase()) || [];

            const ExperienceGap = jobExperience - candidateExperience;
            const LowExperienceMatch = ExperienceGap > 0;
            const NoSkillsMatch = !candidateSkills.some(skill => jobSkills.includes(skill));
            const LowSkillsMatch = candidateSkills.some(skill => jobSkills.includes(skill));
            const SignificantExperienceGap = jobExperience > (candidateExperience + 2);

            // Return true if either low match or no match conditions are met
            return (LowExperienceMatch && LowSkillsMatch) || NoSkillsMatch || SignificantExperienceGap;
        }),
        "Applied Jobs": appliedJobs, 
        
    };
    

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-gray-200 pb-4 sm:pb-6 pt-16 sm:pt-24 space-y-4 sm:space-y-0">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
                        {profileInfo?.role === 'candidate' ? "Explore All Jobs" : "Jobs Dashboard"}
                    </h1>

                    {/* Filter/Post Job Section */}
                    <div className="flex items-center">
                        {profileInfo?.role === "candidate" ? (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                                {/* Filter Menu */}
                                <Menubar className="border rounded-lg shadow-sm bg-white w-full sm:w-auto">
                                    {loading && (
                                        <span className="px-3 py-2 text-sm text-gray-500 animate-pulse">
                                            Updating filters...
                                        </span>
                                    )}
                                    <div className="flex flex-wrap">
                                        {filterMenu.map((menu, index) => (
                                            <MenubarMenu key={menu.id || index}>
                                                <MenubarTrigger className="px-2 sm:px-4 py-2 text-sm sm:text-base hover:bg-gray-50">
                                                    <div className="flex items-center gap-2">
                                                        {menu.name}
                                                        <svg 
                                                            className="w-4 h-4 text-gray-500" 
                                                            fill="none" 
                                                            viewBox="0 0 24 24" 
                                                            stroke="currentColor"
                                                        >
                                                            <path 
                                                                strokeLinecap="round" 
                                                                strokeLinejoin="round" 
                                                                strokeWidth={2} 
                                                                d="M19 9l-7 7-7-7" 
                                                            />
                                                        </svg>
                                                    </div>
                                                </MenubarTrigger>
                                                <MenubarContent 
                                                    className="min-w-[200px] p-2 bg-white rounded-lg shadow-lg border"
                                                    align="start"
                                                >
                                                    {menu.options.map((option, optionIndex) => (
                                                        <MenubarItem
                                                            key={optionIndex}
                                                            className="flex items-center px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer"
                                                            onClick={() => handleFilter(menu.id, option)}
                                                        >
                                                            <div className="flex items-center gap-3 w-full">
                                                                <div
                                                                    className={`
                                                                        h-4 w-4 rounded border border-gray-300 flex items-center justify-center
                                                                        transition-colors duration-200
                                                                        ${filterParams?.[menu.id]?.includes(option)
                                                                            ? "bg-blue-500 border-blue-500"
                                                                            : "bg-white hover:border-blue-500"
                                                                        }
                                                                    `}
                                                                >
                                                                    {filterParams?.[menu.id]?.includes(option) && (
                                                                        <svg 
                                                                            className="w-3 h-3 text-white" 
                                                                            fill="none" 
                                                                            viewBox="0 0 24 24" 
                                                                            stroke="currentColor"
                                                                        >
                                                                            <path 
                                                                                strokeLinecap="round" 
                                                                                strokeLinejoin="round" 
                                                                                strokeWidth={2} 
                                                                                d="M5 13l4 4L19 7" 
                                                                            />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                <Label className="text-sm text-gray-700 hover:text-gray-900">
                                                                    {option}
                                                                </Label>
                                                            </div>
                                                        </MenubarItem>
                                                    ))}
                                                </MenubarContent>
                                            </MenubarMenu>
                                        ))}
                                    </div>
                                </Menubar>

                                {/* Clear Filters Button */}
                                {Object.keys(filterParams || {}).length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleClearFilters()}
                                        className="text-sm text-gray-600 hover:text-gray-900 w-full sm:w-auto"
                                    >
                                        Clear Filters
                                        <X className="w-4 h-4 ml-2" />
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <PostNewJob user={user} profileInfo={profileInfo} />
                        )}
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="pt-4 sm:pt-6 pb-16 sm:pb-24">
                    {profileInfo?.role === "candidate" ? (
                        <Tabs
                            defaultValue="All Jobs"
                            value={activeTab}
                            onValueChange={(value) => setActiveTab(value)}
                            className="w-full"
                        >
                            <TabsList className="mb-4 sm:mb-6 flex flex-wrap gap-2 justify-start">
                              
                                <TabsTrigger value="All Jobs" className="text-sm sm:text-base px-2 sm:px-4">
                                    All Jobs
                                    {filteredJobList["All Jobs"].length > 0 && (
                                        <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                                            {filteredJobList["All Jobs"].length}
                                        </span>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="High Match Potential" className="text-sm sm:text-base px-2 sm:px-4">
                                    New Jobs In Your Caliber
                                    {filteredJobList["High Match Potential"].length > 0 && (    
                                        <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                                            {filteredJobList["High Match Potential"].length}
                                        </span>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="Low Match Potential" className="text-sm sm:text-base px-2 sm:px-4">
                                    New Jobs Outside Your Caliber
                                    {filteredJobList["Low Match Potential"].length > 0 && (
                                        <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                                            {filteredJobList["Low Match Potential"].length}
                                        </span>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="Applied Jobs" className="text-sm sm:text-base px-2 sm:px-4">
                                    Applied Jobs
                                    {filteredJobList["Applied Jobs"].length > 0 && (
                                        <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                                            {filteredJobList["Applied Jobs"].length}
                                        </span>
                                    )}
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value={activeTab}>
                                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
                                    {loading ? (
                                        <div className="flex justify-center items-center min-h-[200px]">
                                            <div className="text-gray-500">Loading jobs...</div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                            {filteredJobList[activeTab]?.length > 0 ? (
                                                filteredJobList[activeTab].map((jobItem, index) => (
                                                    <CandidateJobCard
                                                        profileInfo={profileInfo}
                                                        key={jobItem.id || index}
                                                        jobItem={jobItem}
                                                        jobApplications={jobApplications}
                                                    />
                                                ))
                                            ) : (
                                                <p className="text-gray-600 col-span-full text-center py-8">
                                                    {activeTab === "Applied Jobs" 
                                                        ? "You haven't applied to any jobs yet."
                                                        : `No jobs found for ${activeTab}.`
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {jobList && jobList.length > 0
                                ? jobList.map((jobItem, index) => (
                                    <RecruiterJobCard
                                        profileInfo={profileInfo}
                                        key={jobItem.id || index}
                                        jobItem={jobItem}
                                        jobApplications={jobApplications}
                                    />
                                ))
                                : <p className="text-gray-600">No jobs available.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default JobListing