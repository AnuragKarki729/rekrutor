'use client'

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

    function handleFilter(getSectionID, getCurrentOption) {
        let copyFilter = { ...filterParams }
        const indexOfCurrentSection = Object.keys(copyFilter).indexOf(getSectionID)
        if (indexOfCurrentSection === -1) {
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
    
    

    console.log(filterParams, 'filter Menu');

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
                        {
                            profileInfo?.role === 'candidate' ? (<Menubar>
                                {
                                    filterMenu.map((filterMenu, index) => (
                                        <MenubarMenu key={filterMenu.id || index}>
                                            <MenubarTrigger>{filterMenu.name}</MenubarTrigger>
                                            <MenubarContent>
                                                {
                                                    filterMenu.options.map((option, optionIndex) => (
                                                        <MenubarItem key={optionIndex} className="flex items-center"
                                                            onClick={() => handleFilter(filterMenu.id, option)}>
                                                            <div className={`h-4 w-4 border rounded border-gray-900 ${filterParams && Object.keys(filterParams).length > 0 && filterParams[filterMenu.id] && filterParams[filterMenu.id].indexOf(option) > -1 ? "bg-black" : ""}`} />


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
                    <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
                        <div className="lg:col-span-4">
                            <div className="container mx-auto p-0 space-y-8">
                                <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
                                    {
                                        jobList && jobList.length > 0
                                            ? jobList.map((jobItem, index) =>
                                                profileInfo?.role === 'candidate' ?
                                                    (
                                                        <CandidateJobCard profileInfo={profileInfo} key={jobItem.id || index} jobItem={jobItem} jobApplications={jobApplications} />
                                                    ) : (
                                                        <RecruiterJobCard profileInfo={profileInfo} key={jobItem.id || index} jobItem={jobItem} jobApplications={jobApplications} />
                                                    )
                                            )
                                            : null}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default JobListing