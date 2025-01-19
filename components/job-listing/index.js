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

function JobListing({ user, profileInfo, jobList, jobApplications, filterCategories }) {

    const searchParams = useSearchParams()
    const router = useRouter()


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


            return HighexperienceMatch && HighSkillsMatch; // Only consider high match potential
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
    };


    return (
        <div>
            <div className="mx-auto max-w-7xl">
                <div className="flex items-baseline justify-between border-bottom border-gray-200 pb-6 pt-24">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                        {
                            profileInfo?.role === 'candidate' ?
                                "Explore All Jobs" : "Jobs Dashboard"
                        }
                    </h1>
                    <div className="flex items-center">
                        {profileInfo?.role === "candidate" ? (
                            <Menubar>
                                {loading && (
                                    <div className="ml-2 text-sm text-gray-500">
                                        Updating filters...
                                    </div>
                                )}
                                {filterMenu.map((filterMenu, index) => (
                                    <MenubarMenu key={filterMenu.id || index}>
                                        <MenubarTrigger>{filterMenu.name}</MenubarTrigger>
                                        <MenubarContent>
                                            {filterMenu.options.map((option, optionIndex) => (
                                                <MenubarItem
                                                    key={optionIndex}
                                                    className="flex items-center"
                                                    onClick={() => handleFilter(filterMenu.id, option)}
                                                >
                                                    <div
                                                        className={`h-4 w-4 border rounded border-gray-900 ${filterParams &&
                                                            Object.keys(filterParams).length > 0 &&
                                                            filterParams[filterMenu.id] &&
                                                            filterParams[filterMenu.id].indexOf(option) > -1
                                                            ? "bg-black"
                                                            : ""
                                                            }`}
                                                    />
                                                    <Label className="ml-3 cursor:pointer text-sm text-gray-600">
                                                        {option}
                                                    </Label>
                                                </MenubarItem>
                                            ))}
                                        </MenubarContent>
                                    </MenubarMenu>
                                ))}
                            </Menubar>
                        ) : (
                            <PostNewJob user={user} profileInfo={profileInfo} />)
                        }
                    </div>
                </div>
                <div className="pt-6 pb-24">
                    {profileInfo?.role === "candidate" ? (
                        <Tabs
                            defaultValue="All Jobs"
                            value={activeTab}
                            onValueChange={(value) => setActiveTab(value)}
                            className="w-full"
                        >
                            <TabsList className="mb-6">
                                <TabsTrigger value="All Jobs">All Jobs</TabsTrigger>
                                <TabsTrigger value="High Match Potential">In Your Caliber</TabsTrigger>
                                <TabsTrigger value="Low Match Potential">Outside Your Caliber</TabsTrigger>
                            </TabsList>
                            <TabsContent value={activeTab}>
                                <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
                                    <div className="lg:col-span-4">
                                        {loading ? (
                                            <div className="flex justify-center items-center min-h-[200px]">
                                                <div className="text-gray-500">Loading jobs...</div>
                                            </div>
                                        ) : (<div className="container mx-auto p-0 space-y-8">
                                            <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
                                                {console.log(filteredJobList["High Match Potential"], "HIGHMATCHPOTENTIAL")}
                                                {console.log(filteredJobList["Low Match Potential"], "LOWMATCHPOTENTIAL")}

                                                {filteredJobList[activeTab]?.length > 0
                                                    ? filteredJobList[activeTab].map((jobItem, index) => (
                                                        <CandidateJobCard
                                                            profileInfo={profileInfo}
                                                            key={jobItem.id || index}
                                                            jobItem={jobItem}
                                                            jobApplications={jobApplications}
                                                        />
                                                    ))
                                                    : <p className="text-gray-600">No jobs found for {activeTab}.</p>}
                                            </div>
                                        </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
                            <div className="lg:col-span-4">
                                <div className="container mx-auto p-0 space-y-8">
                                    <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
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
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default JobListing