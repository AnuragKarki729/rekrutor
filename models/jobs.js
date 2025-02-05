import mongoose from "mongoose"


const JobSchema = new mongoose.Schema({
    companyName: String,
    title: String,
    location: String,
    type: String,
    description: String,
    experience: String,
    yearsOfExperience: String,
    industry: String,
    salary: String,
    skills: String,
    recruiterId: String,
    hiredFlag: {type: Boolean, default: false},
    applicants: [
        {
            name: String,


            email: String,
            userId: String,
            status: String
        }
    ]
})

const Job = mongoose.models.Job || mongoose.model('Job', JobSchema)
export default Job