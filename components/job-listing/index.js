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
    console.log("All Jobs:", jobList);
    console.log("Job Applications:", jobApplications);
    console.log("Profile Info:", profileInfo);

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

    console.log(initialJobList, 'initialJobList')

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
                    console.log('Filtered jobs:', filtered);
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
    console.log("Job List:", jobList);
    console.log()

    
    useEffect(() => {
        setSearchedJobs(jobList);
    }, [jobList]);

    const filteredJobList = {
        "All Jobs": searchedJobs,
        "Perfect Match": searchedJobs.filter(jobItem => {
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
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                {/* Header Section - More responsive spacing */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between 
                    border-b border-gray-200 pb-4 sm:pb-6 pt-8 sm:pt-12 lg:pt-16 space-y-4 sm:space-y-0">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
                        {profileInfo?.role === 'candidate' ? "Explore All Jobs" : "Jobs Dashboard"}
                    </h1>

                    {/* Filter/Post Job Section - Better mobile layout */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        {profileInfo?.role === "candidate" ? (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                                {/* Filter Menu - Improved mobile experience */}
                                <Menubar className="border rounded-lg shadow-sm bg-white w-full sm:w-auto">
                                    <div className="flex flex-wrap gap-2">
                                        {filterMenu.map((menu, index) => (
                                            <MenubarMenu key={menu.id || index}>
                                                <MenubarTrigger className="px-3 py-2 text-sm lg:text-base hover:bg-gray-50 transition-colors">
                                                    {menu.componentType === 'input' ? (
                                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                            <input 
                                                                type="text"
                                                                placeholder={menu.placeholder}
                                                                className="px-2 py-1 border rounded"
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
                                                                className="ml-2 bg-blue-500 hover:bg-blue-600 text-white"
                                                                size="sm"
                                                            >
                                                                Search
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
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
                                                )}  
                                            </MenubarMenu>
                                        ))}
                                    </div>
                                </Menubar>

                                {/* Clear Filters Button - Better spacing */}
                                {Object.keys(filterParams || {}).length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleClearFilters()}
                                        className="text-sm text-gray-600 hover:text-gray-900 w-full sm:w-auto 
                                            transition-colors duration-200 flex items-center justify-center"
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

                {/* Tabs Section - Improved spacing and mobile layout */}
                <div className="py-6 sm:py-8 lg:py-12">
                    {profileInfo?.role === "candidate" ? (
                        <Tabs
                            defaultValue="All Jobs"
                            value={activeTab}
                            onValueChange={(value) => setActiveTab(value)}
                            className="w-full"
                        >
                            <TabsList className="mb-6 flex flex-wrap gap-2 justify-start">
                                {["Perfect Match", "Good Match", "My Industry", "All Jobs", "Applied Jobs"].map((tab) => (
                                    <TabsTrigger 
                                        key={tab}
                                        value={tab}

                                        className="text-sm lg:text-base px-3 py-2 transition-colors duration-200"
                                    >
                                        {tab}
                                        {filteredJobList[tab].length > 0 && (
                                            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                                                {filteredJobList[tab].length}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {/* Content grid with responsive columns */}
                            <TabsContent value={activeTab}>
                                <div className="grid grid-cols-1 gap-6">
                                    {loading ? (
                                        <div className="flex justify-center items-center min-h-[200px]">
                                            <div className="text-gray-500 animate-pulse">Loading jobs...</div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                                            {filteredJobList[activeTab]?.length > 0 ? (
                                                [...filteredJobList[activeTab]]
                                                    .sort((a, b) => {
                                                        const aApplied = localJobApplications.some(app => app.jobID === a._id && app.status[0] === "Applied");
                                                        const bApplied = localJobApplications.some(app => app.jobID === b._id && app.status[0] === "Applied");
                                                        return aApplied - bApplied;
                                                    }).map((jobItem, index) => (
                                                        <div
                                                            key={jobItem._id || index}
                                                            className={`transform transition-all duration-500 ease-in-out ${
                                                                removedJobs.has(jobItem._id) 
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                            {jobList && jobList.length > 0
                                ? jobList.map((jobItem, index) => (
                                    <RecruiterJobCard
                                        profileInfo={profileInfo}
                                        key={jobItem.id || index}
                                        jobItem={jobItem}
                                        jobApplications={localJobApplications}
                                    />
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