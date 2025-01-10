import qs from 'query-string'

export const recruiterOnBoardFormControls = [
    {
        label: 'Name',
        name: 'name',
        placeholder: 'Enter your Name',
        componentType: 'input'

    },
    {
        label: 'Company Name',
        name: 'companyName',
        placeholder: 'Enter the Company Name',
        componentType: 'input'

    },
    {
        label: 'Company Role',
        name: 'companyRole',
        placeholder: 'Enter your Role in the company',
        componentType: 'input'

    }
]

export const initialRecruiterFormData = {
    name: '',
    companyName: '',
    companyRole: '',

}

export const candidateOnBoardFormControls = [
    {
        label: 'Resume',
        name: 'resume',
        placeholder: 'Upload your Resume',
        componentType: 'file'
    },
    {
        label: 'Name',
        name: 'name',
        placeholder: 'Enter your Name',
        componentType: 'input'
    },
    {
        label: 'Current Company',
        name: 'currentCompany',
        placeholder: 'Enter your current Company',
        componentType: 'input'
    },
    {
        label: 'Current Job Location',
        name: 'currentJobLocation',
        placeholder: 'Enter your current Job Location',
        componentType: 'input'
    },
    {
        label: 'Prefered Job Location',
        name: 'preferedJobLocation',
        placeholder: 'Enter your prefered Job Location',
        componentType: 'input'
    },
    {
        label: 'Current Salary',
        name: 'currentSalary',
        placeholder: 'Enter your current Salary',
        componentType: 'input'
    },
    {
        label: 'Notice Period',
        name: 'noticePeriod',
        placeholder: 'Enter your Notice Period',
        componentType: 'input'
    },
    {
        label: 'Skills',
        name: 'skills',
        placeholder: 'Enter your skills',
        componentType: 'input'
    },
    {
        label: 'Previous Companies',
        name: 'previousCompanies',
        placeholder: 'Enter Previous Companies youve worked for',
        componentType: 'input'
    },
    {
        label: 'Total Experience',
        name: 'totalExperience',
        placeholder: 'Enter your total years of experience',
        componentType: 'input'
    },
    {
        label: 'College',
        name: 'college',
        placeholder: 'Enter your college',
        componentType: 'input'
    },
    {
        label: 'College Location',
        name: 'collegeLocation',
        placeholder: 'Enter your college location',
        componentType: 'input'
    },
    {
        label: 'Graduated Year',
        name: 'graduatedYear',
        placeholder: 'Enter your graduated year',
        componentType: 'input'
    },
    {
        label: 'Significant Links',
        name: 'profileLinks',
        placeholder: 'Enter your links that may be significant',
        componentType: 'input'
    },

]

export const initialCandidateFormData = {
    resume: '',
    name: '',
    currentJobLocation: '',
    preferedJobLocation: '',
    currentSalary: '',
    noticePeriod: '',
    skills: '',
    currentCompany: '',
    previousCompanies: '',
    totalExperience: '',
    college: '',
    collegeLocation: '',
    graduatedYear: '',
    profileLinks: '',

}

export const initialCandidateAccountFormData = {
    name: '',
    currentJobLocation: '',
    preferedJobLocation: '',
    currentSalary: '',
    noticePeriod: '',
    skills: '',
    currentCompany: '',
    previousCompanies: '',
    totalExperience: '',
    college: '',
    collegeLocation: '',
    graduatedYear: '',
    profileLinks: '',

}


export const postNewJobFormControls = [
    {
        label: 'Company Name',
        name: 'companyName',
        placeholder: 'Company Name',
        componentType: 'input',
        disabled: true
    },
    {
        label: 'Title',
        name: 'title',
        placeholder: 'Job Title',
        componentType: 'input'
    },
    {
        label: 'Type',
        name: 'type',
        placeholder: 'Job Type',
        componentType: 'input'
    },
    {
        label: 'Location',
        name: 'location',
        placeholder: 'Job Location',
        componentType: 'input'
    },
    {
        label: 'Experience',
        name: 'experience',
        placeholder: 'Enter Experience required',
        componentType: 'input'
    },
    {
        label: 'Description',
        name: 'description',
        placeholder: 'Job Description',
        componentType: 'input'
    },
    {
        label: 'Skills',
        name: 'skills',
        placeholder: 'Skills Required',
        componentType: 'input'
    },
]

export const initialPostNewJobFormData = {
    companyName: '',
    title: '',
    type: '',
    location: '',
    experience: '',
    description: '',
    skills: ''
}

export const filterMenuDataArray = [
    {
        id: 'companyName',
        label: 'Company Title'
    },
    {
        id: 'title',
        label: 'Title'
    },
    {
        id: 'type',
        label: 'Type'
    },
    {
        id: 'location',
        label: 'Location'
    },
]

export function formUrlQuery({ params, dataToAdd }) {
    let currentURL = qs.parse(params || ""); // Parse current query string

    if (dataToAdd && Object.keys(dataToAdd).length > 0) {
        Object.keys(dataToAdd).forEach(key => {
            if (!dataToAdd[key] || dataToAdd[key].length === 0) {
                // If the value is empty, remove the key from the URL
                delete currentURL[key];
            } else {
                // Join array values into a comma-separated string
                currentURL[key] = dataToAdd[key].join(",");
            }
        });
    }

    return qs.stringifyUrl(
        {
            url: window.location.pathname, // Base URL
            query: currentURL // Updated query parameters
        },
        { skipNull: true } // Skip keys with null values
    );
}
