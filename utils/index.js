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
        placeholder: 'Upload your Resume (PDF format)',
        componentType: 'file',
        accept: '.pdf, .doc, .docx'
    },
    {
        label: 'Name',
        name: 'name',
        placeholder: 'First Name Last Name',
        componentType: 'text'
    },
    {
        label: 'Current Company',
        name: 'currentCompany',
        placeholder: 'e.g., Google, Microsoft, etc.',
        componentType: 'text'
    },
    {
        label: 'Current Job Location',
        name: 'currentJobLocation',
        placeholder: 'City, Country (e.g., New York, USA)',
        componentType: 'text'
    },
    {
        label: 'Preferred Job Location',
        name: 'preferedJobLocation',
        placeholder: 'City, Country or Remote',
        componentType: 'text'
    },
    {
        label: 'Current Salary (USD/year)',
        name: 'currentSalary',
        placeholder: 'e.g., 75000',
        componentType: 'number'
    },
    {
        label: 'Notice Period',
        name: 'noticePeriod',
        placeholder: 'e.g., 30 days, 2 months, Immediate',
        componentType: 'text'
    },
    {
        label: 'Skills',
        name: 'skills',
        placeholder: 'Separate skills with commas (e.g., React, Node.js, Python)',
        componentType: 'text'
    },
    {
        label: 'Previous Companies',
        name: 'previousCompanies',
        placeholder: 'Separate with commas (e.g., Amazon, Facebook)',
        componentType: 'text'
    },
    {
        label: 'Total Experience (years)',
        name: 'totalExperience',
        placeholder: 'e.g., 3.5',
        componentType: 'number',
        step: '0.5'
    },
    {
        label: 'College/University',
        name: 'college',
        placeholder: 'e.g., Massachusetts Institute of Technology',
        componentType: 'text'
    },
    {
        label: 'College Location',
        name: 'collegeLocation',
        placeholder: 'City, Country (e.g., Cambridge, USA)',
        componentType: 'text'
    },
    {
        label: 'Graduation Year',
        name: 'graduatedYear',
        placeholder: 'e.g., 2022',
        componentType: 'number',
        min: '1950',
        max: new Date().getFullYear()
    },
    {
        label: 'Profile Links',
        name: 'profileLinks',
        placeholder: 'LinkedIn, GitHub, Portfolio (separate with commas)',
        componentType: 'text'
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
