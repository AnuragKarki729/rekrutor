export const jobApi = {
    // Get all jobs with optional filters
    getJobs: async (filters = {}) => {
        const queryString = new URLSearchParams(filters).toString()
        const response = await fetch(`/api/jobs?${queryString}`)
        if (!response.ok) throw new Error('Failed to fetch jobs')
        return response.json()
    },

    // Get single job by ID
    getJob: async (id) => {
        const response = await fetch(`/api/jobs/${id}`)
        if (!response.ok) throw new Error('Failed to fetch job')
        return response.json()
    },

    // Create new job
    createJob: async (jobData) => {
        const response = await fetch('/api/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jobData)
        })
        if (!response.ok) throw new Error('Failed to create job')
        return response.json()
    },

    // Get jobs by recruiter ID
    getRecruiterJobs: async (recruiterId) => {
        const response = await fetch(`/api/jobs/recruiter/${recruiterId}`)
        if (!response.ok) throw new Error('Failed to fetch recruiter jobs')
        return response.json()
    }
} 