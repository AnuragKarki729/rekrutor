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
import { Alert, AlertDescription } from "../ui/alert"




function JobListing({ user, profileInfo, initialJobList, jobList, jobApplications, filterCategories, initialSearchTerm }) {
    //console.log("All Jobs:", jobList);
    //console.log("Job Applications:", jobApplications);
    //console.log("Profile Info:", profileInfo);

    const searchParams = useSearchParams()
    const router = useRouter()
    const hasVideoCV = profileInfo?.candidateInfo?.hasVideoCV


    const filterMenu = filterMenuDataArray.map(item => {
        if (item.id === 'Search Jobs using keywords') {
            return {
                id: item.id,
                name: item.label,
                componentType: 'input',
                placeholder: item.placeholder
            }
        }
        return {
            id: item.id,
            name: item.label,
            options: [
                ...new Set(filterCategories.map(listItem => listItem[item.id]))
            ]
        }
    })

    const [filterParams, setFilterParams] = useState({})
    const [activeTab, setActiveTab] = useState('All Jobs')
    const [loading, setLoading] = useState(false)
    const [localJobApplications, setLocalJobApplications] = useState(jobApplications)
    const [searchedJobs, setSearchedJobs] = useState(jobList);
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [removedJobs, setRemovedJobs] = useState(new Set());

    //console.log(initialJobList, 'initialJobList')

    useEffect(() => {
        if (initialSearchTerm) {
            handleFilter('Search Jobs using keywords', initialSearchTerm);
        }
    }, [initialSearchTerm]);

    async function handleFilter(getSectionID, getCurrentOption) {
        try {
            setLoading(true);
            let copyFilter = { ...filterParams };

            // Special handling for search
            if (getSectionID === 'Search Jobs using keywords') {
                const term = getCurrentOption?.trim();
                setSearchTerm(term);

                if (term) {
                    const filtered = jobList.filter(job => (
                        job.title?.toLowerCase().includes(term.toLowerCase()) ||
                        job.description?.toLowerCase().includes(term.toLowerCase()) ||
                        job.companyName?.toLowerCase().includes(term.toLowerCase()) ||
                        job.industry?.toLowerCase().includes(term.toLowerCase()) ||
                        job.location?.toLowerCase().includes(term.toLowerCase()) ||
                        job.skills?.toLowerCase().includes(term.toLowerCase()) ||
                        job.type?.toLowerCase().includes(term.toLowerCase())
                    ));
                    //console.log('Filtered jobs:', filtered);
                    setSearchedJobs(filtered);

                    copyFilter.search = term;
                } else {
                    setSearchedJobs(jobList);
                    delete copyFilter.search;
                }
            } else {
                // Existing filter logic for other filters
                if (Object.keys(copyFilter).indexOf(getSectionID) === -1) {
                    copyFilter = {
                        ...copyFilter,
                        [getSectionID]: [getCurrentOption]
                    };
                } else {
                    const indexOfCurrentOption = copyFilter[getSectionID].indexOf(getCurrentOption);
                    if (indexOfCurrentOption === -1) {
                        copyFilter[getSectionID].push(getCurrentOption);
                    } else {
                        copyFilter[getSectionID].splice(indexOfCurrentOption, 1);
                    }
                }
            }

            setFilterParams(copyFilter);
            sessionStorage.setItem('filterParams', JSON.stringify(copyFilter));

            // Update URL
            const queryString = new URLSearchParams();
            Object.entries(copyFilter).forEach(([key, values]) => {
                if (key === 'search') {
                    queryString.append(key, values);
                } else if (values.length > 0) {
                    queryString.append(key, values.join(','));
                }
            });

            router.push(`/jobs?${queryString.toString()}`, { scroll: false });
        } catch (error) {
            console.error('Error applying filters:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setFilterParams(JSON.parse(sessionStorage.getItem('filterParams')))
    }, [])

    useEffect(() => {
        if (filterParams && Object.keys(filterParams).length > 0) {
            //console.log("Search Params:", searchParams.toString());
            //console.log("Filter Params:", filterParams);

            let url = formUrlQuery({
                params: searchParams.toString(),
                dataToAdd: filterParams
            });

            //console.log("Generated URL:", url); // Log the generated URL
            router.push(url, { scroll: false });
        }
    }, [filterParams, searchParams]);

    const handleApplicationSubmit = (newApplication) => {
        if (!newApplication || !newApplication.jobID) return;

        if (newApplication.deleted) {
            // Remove the application from local state
            setLocalJobApplications(prev =>
                prev.filter(app => app.jobID !== newApplication.jobID)
            );
        } else {
            // Add new application
            setLocalJobApplications(prev => [...prev, newApplication]);
        }

        setRemovedJobs(prev => new Set([...prev, newApplication.jobID]));
    };

    const appliedJobs = jobList.filter(job =>
        localJobApplications.some(
            application => {
                return application.jobID === job._id &&
                    application.status[0] === "Applied";
            }
        )
    );
    // console.log("Job List:", jobList);
    //console.log("Applied Jobs:", appliedJobs);


    useEffect(() => {
        setSearchedJobs(jobList);
    }, [jobList]);

    const filteredJobList = {
        "All Jobs": searchedJobs.filter(job => profileInfo?.role === 'recruiter' || !job.hiredFlag),
        "Perfect Match": searchedJobs.filter(jobItem => {
            if (jobItem.hiredFlag === true) return false;
            const candidateSkills = profileInfo?.candidateInfo?.skills?.split(",").map(skill => skill.trim().toLowerCase()) || []
            const jobSkills = jobItem?.skills?.split(",").map(skill => skill.trim().toLowerCase()) || []
            const candidateIndustry = profileInfo?.candidateInfo?.industry
            const jobIndustry = jobItem?.industry
            const candidateExpYears = profileInfo?.candidateInfo?.totalExperience || 0
            const yearsRange = jobItem?.yearsOfExperience?.match(/\((\d+)-(\d+)/);
            const jobExpYears = yearsRange ? (parseInt(yearsRange[1]) + parseInt(yearsRange[2])) / 2 : 0;

            const industryMatch = candidateIndustry === jobIndustry
            const perfectSkillsMatch = jobSkills.every(skill => candidateSkills.includes(skill))
            const expMatch = candidateExpYears >= jobExpYears
            const freshGradMatch = profileInfo?.candidateInfo?.experienceLevel === "Fresher" && jobItem?.experience === "Fresher"

            return (perfectSkillsMatch && expMatch && industryMatch) ||
                (freshGradMatch && industryMatch);
        }),
        "Good Match": searchedJobs.filter(jobItem => {
            if (jobItem.hiredFlag === true) return false;
            const candidateSkills = profileInfo?.candidateInfo?.skills?.split(",").map(skill => skill.trim().toLowerCase()) || []
            const jobSkills = jobItem?.skills?.split(",").map(skill => skill.trim().toLowerCase()) || []
            const candidateIndustry = profileInfo?.candidateInfo?.industry
            const jobIndustry = jobItem?.industry
            const candidateExpYears = profileInfo?.candidateInfo?.totalExperience || 0
            const yearsRange = jobItem?.yearsOfExperience?.match(/\((\d+)-(\d+)/);
            const jobExpYears = yearsRange ? (parseInt(yearsRange[1]) + parseInt(yearsRange[2])) / 2 : 0;

            const industryMatch = candidateIndustry === jobIndustry
            const perfectSkillsMatch = jobSkills.every(skill => candidateSkills.includes(skill))
            const expMatch = candidateExpYears >= jobExpYears

            return (expMatch && industryMatch) || (expMatch && perfectSkillsMatch);
        }),
        "My Industry": searchedJobs.filter(jobItem => {
            if (jobItem.hiredFlag === true) return false;
            const candidateIndustry = profileInfo?.candidateInfo?.industry
            const jobIndustry = jobItem?.industry

            return candidateIndustry === jobIndustry;
        }),
        "Applied Jobs": appliedJobs,
    };

    const handleClearFilters = () => {
        try {
            setLoading(true);
            // Clear filter params
            setFilterParams({});
            // Clear session storage
            sessionStorage.removeItem('filterParams');
            // Clear URL params
            router.push('/jobs', { scroll: false });
        } catch (error) {
            console.error('Error clearing filters:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50" style={{background: "radial-gradient(circle,rgba(253, 144, 144, 0.64) 10%,rgba(156, 156, 251, 0.64) 40%,rgba(200, 200, 248, 0.84) 60%,rgba(224, 224, 251, 0.23) 80%,rgb(251, 251, 251) 90%,rgb(255, 253, 255) 90%)"}}>
            <div className="container mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 max-w-[1440px]">
            <h1 className="text-xl mt-4 relative justify-center items-center text-start ml-4 sm:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-gray-900">
                        {profileInfo?.role === 'candidate' ? "Explore All Jobs" : "Jobs Dashboard"}

                    </h1>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between 
                    pb-3 sm:pb-4 lg:pb-6 pt-4 sm:pt-8 lg:pt-12 
                    space-y-3 sm:space-y-0">
                    {/* Filter/Post Job Section - Enhanced mobile layout */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto bg-transparent">
                        {profileInfo?.role === "candidate" ? (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                                {/* Filter Menu - Improved scrollable layout */}
                                <Menubar className="border rounded-lg shadow-sm h-full bg-transparent w-full sm:w-auto overflow-x-auto">
                                    <div className="flex flex-nowrap gap-2 p-1">
                                        {filterMenu.map((menu, index) => (
                                            <MenubarMenu key={menu.id || index}>
                                                <MenubarTrigger className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap">
                                                    {menu.componentType === 'input' ? (
                                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                            <input
                                                                type="text"
                                                                placeholder="Search Jobs"
                                                                className="px-2 py-1 border-[2px] border-gray-900 rounded bg-gray-250"
                                                                value={searchTerm}
                                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    e.stopPropagation();
                                                                    if (e.key === 'Enter') {
                                                                        handleFilter(menu.id, searchTerm);
                                                                    }
                                                                }}
                                                            />
                                                            <Button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleFilter(menu.id, searchTerm);
                                                                }}
                                                                className="ml-2 bg-blue-200 hover:bg-blue-400 hover:scale-110 border-[2px] border-gray-900 transform transition-all duration-200 ease-in-out text-white"
                                                                size="sm"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" id="search" className="w-4 h-4">
                                                                    <polygon fill="#78909c" points="357.95 351.03 346.98 361.26 314.42 326.35 302.86 313.95 313.83 303.72 325.39 316.12 357.95 351.03"></polygon>
                                                                    <path fill="#465e66" d="M325.39 316.12c-1.75 1.77-3.55 3.51-5.38 5.22s-3.7 3.39-5.59 5l-11.56-12.4 11-10.23zM359.71 352.67c-1.75 1.77-3.55 3.51-5.38 5.22s-3.7 3.39-5.59 5l-11.56-12.4 11-10.23z"></path>
                                                                    <path fill="#546e7a" d="M370.91,188.21A181.13,181.13,0,0,1,57.53,305.42,181.1,181.1,0,0,1,66.44,49.49c73-68.1,187.82-64.11,255.92,8.91A179.87,179.87,0,0,1,370.91,188.21Z"></path>
                                                                    <path fill="#90caf9" d="M337.09,187.1a147.21,147.21,0,0,1-147,142.1q-2.61,0-5.25-.09a149.23,149.23,0,0,1-27.17-3.45,145.62,145.62,0,0,1-47.8-20.08A148.49,148.49,0,0,1,82.31,282.4,147.22,147.22,0,0,1,297.62,81.57a148.87,148.87,0,0,1,15.92,20.34,145.48,145.48,0,0,1,20.11,47.77A148,148,0,0,1,337.09,187.1Z"></path>
                                                                    <path fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="15" d="M238.65,103.16A103.19,103.19,0,0,0,98,141.92"></path>
                                                                    <path fill="#5e35b1" d="M493.22,502.58a33.33,33.33,0,0,1-22.84,9l-1.19,0A33.27,33.27,0,0,1,445.89,501L322.71,373.65l49-45.73L494.87,455.2A33.58,33.58,0,0,1,493.22,502.58Z"></path>
                                                                    <path fill="#4a2a96" d="M497.58,497.62a33.5,33.5,0,0,1-27.2,14l-1.19,0A33.27,33.27,0,0,1,445.89,501L322.71,373.65l7.94-7.41L453.57,493.3a33.27,33.27,0,0,0,23.3,10.59l1.19,0A33.27,33.27,0,0,0,497.58,497.62Z"></path>
                                                                    <line x1="371.02" x2="487.01" y1="343" y2="458.99" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></line>
                                                                    <path fill="#546e7a" d="M305.86,73.88A158.49,158.49,0,0,0,74.07,290.09a157.44,157.44,0,0,0,110.38,50.28c1.89.07,3.77.1,5.65.1A158.49,158.49,0,0,0,305.86,73.88ZM337.09,187.1a147.21,147.21,0,0,1-147,142.1q-2.61,0-5.25-.09A147.26,147.26,0,0,1,89.55,74.33,147.21,147.21,0,0,1,337.09,187.1Z"></path>
                                                                    <path fill="#465e66" d="M305.86,73.88A158.49,158.49,0,0,0,74.07,290.09a157.44,157.44,0,0,0,110.38,50.28c1.89.07,3.77.1,5.65.1A158.49,158.49,0,0,0,305.86,73.88ZM337.09,187.1a147.21,147.21,0,0,1-147,142.1q-2.61,0-5.25-.09A147.26,147.26,0,0,1,89.55,74.33,147.21,147.21,0,0,1,337.09,187.1Z"></path>
                                                                </svg>
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 hover:scale-110 transform transition-all duration-200 ease-in-out cursor-pointer">
                                                            {menu.name}
                                                            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </MenubarTrigger>
                                                {menu.componentType !== 'input' && (
                                                    <MenubarContent
                                                        className="min-w-[200px] p-2 bg-white rounded-lg shadow-lg border"
                                                        align="start"
                                                    >
                                                        {menu.options.map((option, optionIndex) => (
                                                            <MenubarItem
                                                                key={optionIndex}
                                                                className="flex items-center px-3 py-2 hover:bg-gray-50 rounded-md"
                                                                onClick={() => handleFilter(menu.id, option)}
                                                            >
                                                                <div className="flex items-center gap-3 w-full">
                                                                    <div
                                                                        className={`
                                                                        h-4 w-4 rounded border border-gray-300 flex items-center justify-center
                                                                        transition-colors duration-200 cursor-pointer
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
                                                                    <Label className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer hover:scale-110 transform transition-all duration-200 ease-in-out">
                                                                        {option} 
                                                                    </Label>
                                                                </div>
                                                            </MenubarItem>
                                                        ))}
                                                    </MenubarContent>
                                                )}
                                            </MenubarMenu>
                                        ))}
                                    </div>
                                </Menubar>

                                {/* Clear Filters Button - Responsive sizing */}
                                {Object.keys(filterParams || {}).length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleClearFilters()}
                                        className="text-xs sm:text-sm w-full sm:w-auto min-w-[100px]"
                                    >
                                        Clear Filters
                                        <X className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <PostNewJob user={user} profileInfo={profileInfo} />
                        )}
                    </div>
                </div>

                {/* Tabs Section - Improved scrollable tabs */}
                <div className="py-4 sm:py-6 lg:py-8 ">
                    {profileInfo?.role === "candidate" ? (
                        <Tabs
                            defaultValue="All Jobs"
                            value={activeTab}
                            onValueChange={(value) => setActiveTab(value)}
                            className="w-full"
                        >
                            <div className="overflow-x-auto">
                                <TabsList className=" mb-4 sm:mb-6 bg-transparent">
                                    {["Perfect Match", "Good Match", "My Industry", "All Jobs", "Applied Jobs"].map((tab) => (
                                        <TabsTrigger
                                            key={tab}
                                            value={tab}
                                            disabled={filteredJobList[tab].length === 0}
                                            className="text-xs font-bold sm:text-sm lg:text-base px-2 sm:px-3 py-1.5 sm:py-2 rounded-full whitespace-nowrap bg-transparent hover:scale-105 transform transition-all duration-200 ease-in-out cursor-pointer
                                            text-gray-600 
                                            hover:border-black hover:rounded-full data-[state=active]:bg-blue-500 data-[state=active]:text-black"
                                            
                                        >
                                            {tab}
                                            {filteredJobList[tab].length > 0 && filteredJobList[tab].length <= 5 && (
                                                <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs bg-blue-300 rounded-full"
                                                >
                                                    {filteredJobList[tab].length}
                                                </span>
                                            )}
                                            {filteredJobList[tab].length > 5 && (
                                                <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs bg-blue-300 rounded-full">
                                                    5+
                                                </span>
                                            )}
                                        
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>

                            {/* Content grid with improved responsive layout */}
                            <TabsContent value={activeTab}>
                                <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
                                    {loading ? (
                                        <div className="flex justify-center items-center min-h-[150px] sm:min-h-[200px]">
                                            <div className="text-sm sm:text-base text-gray-500 animate-pulse">Loading jobs...</div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                                            {filteredJobList[activeTab]?.length > 0 ? (
                                                [...filteredJobList[activeTab]]
                                                    .sort((a, b) => {
                                                        const aApplied = localJobApplications.some(app => app.jobID === a._id && app.status[0] === "Applied");
                                                        const bApplied = localJobApplications.some(app => app.jobID === b._id && app.status[0] === "Applied");
                                                        return aApplied - bApplied;
                                                    }).map((jobItem, index) => (
                                                        <div
                                                            key={jobItem._id || index}
                                                            className={`transform transition-all duration-500 ease-in-out ${removedJobs.has(jobItem._id)
                                                                    ? 'h-0 opacity-0 m-0 p-0 overflow-hidden'
                                                                    : 'h-auto opacity-100'
                                                                }`}
                                                            style={{
                                                                gridRow: removedJobs.has(jobItem._id) ? 'span 0' : 'auto',
                                                            }}
                                                        >
                                                            <CandidateJobCard
                                                                profileInfo={profileInfo}
                                                                jobItem={jobItem}
                                                                jobApplications={localJobApplications}
                                                                onApplicationSubmit={handleApplicationSubmit}
                                                            />
                                                        </div>
                                                    ))
                                            ) : (
                                                <p className="text-gray-600 col-span-full text-center py-8 text-sm sm:text-base">
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
                        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-6 p-4">
                            {jobList && jobList.length > 0
                                ? jobList.map((jobItem, index) => (
                                    <div key={jobItem.id || index} className="w-full sm:w-1/2 lg:w-1/3 2xl:w-1/4 h-full">
                                        <RecruiterJobCard
                                            profileInfo={profileInfo}
                                            jobItem={jobItem}
                                            jobApplications={localJobApplications}
                                        />
                                    </div>
                                ))
                                : <p className="text-gray-600 text-center py-8 col-span-full text-sm sm:text-base">
                                    No jobs available.
                                </p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default JobListing