import qs from 'query-string'
import { arrayCountries } from '../lib/constants'




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
        componentType: 'text',
        required: true
    },
    {
        label: 'College/University',
        name: 'college',
        placeholder: 'e.g., Massachusetts Institute of Technology',
        componentType: 'text',
        required: true
    },
    {
        label: 'College Location',
        name: 'collegeLocation',
        placeholder: 'City, Country (e.g., Cambridge, USA)',
        componentType: 'select',
        options: arrayCountries,
        required: true
    },
    {
        label: 'Experience Level',
        name: 'experienceLevel',
        placeholder: 'Select your experience level',
        componentType: 'select',
        options: ['Fresher', 'Experienced'],
        required: true
    },
    {
        label: 'Current Company',
        name: 'currentCompany',
        placeholder: 'e.g., Google, Microsoft, etc.',
        componentType: 'text',
        showWhen: (formData) => formData.experienceLevel === 'Experienced'
    },
    {
        label: 'Current Position',
        name: 'currentPosition',
        placeholder: 'e.g., Software Engineer, Product Manager, etc.',
        componentType: 'text',
        showWhen: (formData) => formData.experienceLevel === 'Experienced'
    },
    {
        label: 'Current Job Location',
        name: 'currentJobLocation',
        placeholder: 'City, Country (e.g., New York, USA)',
        componentType: 'select',
        options: arrayCountries,
        showWhen: (formData) => formData.experienceLevel === 'Experienced'
    },
    {
        label: 'Preferred Job Location',
        name: 'preferedJobLocation',
        placeholder: 'Country or Remote',
        componentType: 'select',
        options: arrayCountries,
        required: true
    },
    {
        label: 'Current Salary (USD/year)',
        name: 'currentSalary',
        placeholder: 'e.g., 75000',
        componentType: 'number',
        showWhen: (formData) => formData.experienceLevel === 'Experienced'
    },
    {
        label: 'Notice Period',
        name: 'noticePeriod',
        placeholder: 'e.g., 30 days, 2 months, Immediate',
        componentType: 'text',
        showWhen: (formData) => formData.experienceLevel === 'Experienced'
    },
    
    {
        label: 'Previous Companies',
        name: 'previousCompanies',
        placeholder: 'Add your previous work experience',
        componentType: 'previousCompanies',
        showWhen: (formData) => formData.experienceLevel === 'Experienced',
        fields: [
            {
                label: 'Company Name',
                name: 'companyName',
                placeholder: 'e.g., Amazon, Facebook',
                componentType: 'text'
            },
            {
                label: 'Position',
                name: 'position',
                placeholder: 'e.g., Software Engineer',
                componentType: 'text'
            },
            {
                label: 'Start Date',
                name: 'startDate',
                componentType: 'date'
            },
            {
                label: 'End Date',
                name: 'endDate',
                componentType: 'date'
            }
        ]
        
    },
    {
        label: 'Total Experience',
        name: 'totalExperience',
        placeholder: 'Calculated from previous experience',
        componentType: 'totalExperience',
        showWhen: (formData) => formData.experienceLevel === 'Experienced',
        disabled: true
    },
    {
        label: 'Skills',
        name: 'skills',
        placeholder: 'Separate skills with commas (e.g., React, Node.js, Python)',
        componentType: 'skills',
        required: true
    },
    {
        label: 'Profile Links',
        name: 'profileLinks',
        placeholder: 'LinkedIn, GitHub, Portfolio (separate with commas)',
        componentType: 'text'
    },
    {
        label: 'Industry',
        name: 'industry',
        placeholder: 'Select your industry experience',
        componentType: 'select',
        options: [
            'Technology',
            'Healthcare',
            'Finance',
            'Education',
            'Manufacturing',
            'Retail',
            'Other'
        ],
        showWhen: (formData) => formData.experienceLevel === 'Experienced'
    },
    {
        label: 'Specify Industry',
        name: 'otherIndustry',
        placeholder: 'Please specify your industry',
        componentType: 'text',
        showWhen: (formData) => formData.industry === 'Other'
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
    currentPosition: '',
    previousCompanies: [],
    totalExperience: '',
    college: '',
    collegeLocation: '',
    graduatedYear: '',
    profileLinks: '',
    experienceLevel: 'Fresher',
    yearsOfExperience: '',
    industry: '',
    otherIndustry: '',

}

export const initialCandidateAccountFormData = {
    name: '',
    currentJobLocation: '',
    preferedJobLocation: '',
    currentSalary: '',
    noticePeriod: '',
    skills: '',
    currentCompany: '',
    currentPosition: '',
    previousCompanies: [],
    totalExperience: '',
    college: '',
    collegeLocation: '',
    graduatedYear: '',
    profileLinks: '',
    experienceLevel: '',
    yearsOfExperience: '',
    industry: '',
    otherIndustry: '',

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
        label: 'Job Title',
        name: 'title',
        placeholder: 'Job Title',
        componentType: 'input',
        required: true
    },
    {
        label: 'Job Type',
        name: 'type',
        placeholder: 'Select Job Type',
        componentType: 'selectJob',
        options: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Temporary'],
        required: true
    },
    {
        label: 'Job Location eg. India, USA, Remote',
        name: 'location',
        placeholder: 'Job Location',
        componentType: 'input',
        required: true
    },
    {
        label: 'Experience Required',
        name: 'experience',
        placeholder: 'Enter Experience required',
        componentType: 'selectJob',
        options: ['Fresher', 'Experienced'],
        required: true
    },
    {
        label: 'Years of Experience',
        name: 'yearsOfExperience',
        placeholder: 'Select years of experience',
        componentType: 'selectJob',
        options: ['0-1 year', '1-2 years', '2-3 years', '3-5 years', '5+ years'],
        showWhen: (formData) => formData.experience === 'Experienced'
    },
    {
        label: 'Job Industry',
        name: 'industry',
        placeholder: 'Select Job Industry',
        componentType: 'selectJob',
        options: [
            'Technology',
            'Healthcare',
            'Finance',
            'Education',
            'Manufacturing',
            'Retail',
            'Other'
        ],
            },
    {
        label: 'Salary Offered (USD/year)',
        name: 'salary',
        placeholder: 'Enter Salary',
        componentType: 'number',
        step: 100,
        min: 0,
        showWhen: (formData) => formData.experience === 'Experienced'
    },
    {
        label: 'Specify Industry',
        name: 'otherIndustry',
        placeholder: 'Please specify the industry',
        componentType: 'text',
        showWhen: (formData) => 
            formData.experience === 'Experienced' && 
            formData.industry === 'Other'
    },
    {
        label: 'Description',
        name: 'description',
        placeholder: 'Job Description',
        componentType: 'input',
    },
    {
        label: 'Skills Required: React, Node.js (Separate with commas)',
        name: 'skills',
        placeholder: 'Skills Required',
        componentType: 'input',
        required: true
    },
]

export const initialPostNewJobFormData = {
    companyName: '',
    title: '',
    type: '',
    location: '',
    experience: '',
    description: '',
    skills: '',
    yearsOfExperience: '',
    industry: '',
    otherIndustry: '',
}

export const filterMenuDataArray = [
    {id: 'Search Jobs using keywords',
        label: 'Search Jobs using keywords',
        placeholder: 'Search Jobs using keywords',
        componentType: 'input'
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

// export function formUrlQuery({ params, dataToAdd }) {
//     let currentURL = qs.parse(params || ""); // Parse current query string

//     if (dataToAdd && Object.keys(dataToAdd).length > 0) {
//         Object.keys(dataToAdd).forEach(key => {
//             if (!dataToAdd[key] || dataToAdd[key].length === 0) {
//                 // If the value is empty, remove the key from the URL
//                 delete currentURL[key];
//             } else {
//                 // Join array values into a comma-separated string
//                 currentURL[key] = dataToAdd[key].join(",");
//             }
//         });
//     }

//     return qs.stringifyUrl(
//         {
//             url: window.location.pathname, // Base URL
//             query: currentURL // Updated query parameters
//         },
//         { skipNull: true } // Skip keys with null values
//     );
// }

export function formUrlQuery({ params, dataToAdd }) {
    const urlParams = new URLSearchParams(params);

    Object.entries(dataToAdd).forEach(([key, value]) => {
        if (key === 'search') {
            // Handle search term as a string
            urlParams.set(key, value);
        } else if (Array.isArray(value) && value.length > 0) {
            // Handle array values for other filters
            urlParams.set(key, value.join(','));
        }
    });

    return `${window.location.pathname}?${urlParams.toString()}`;
}

export const initialJobFormData = {
    // ... existing fields ...
    experience: '',
    yearsOfExperience: '',
    industry: '',
    // ... rest of the fields ...
}
