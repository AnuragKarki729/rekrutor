const { mongoose } = require("mongoose");



const ProfileSchema = new mongoose.Schema(
    {
        userId : String,
        role: String,
        email: String,
        isPremiumUser: Boolean,
        memberShipType: String,
        memberShipEndDate: String,
        memberShipStartDate: String,
        recruiterInfo: {
            name:String,
            companyName: String,
            companyRole: String,
        },
        candidateInfo: {
            name: String,
            currentJobLocation: String,
            preferedJobLocation: String,
            currentSalary: String,
            noticePeriod: String,
            skills: String,
            currentCompany: String,
            experienceLevel: { type: String, enum: ['Fresher', 'Experienced'] },
            industry: String,
            specifiedIndustry: { 
                type: String,
                required: function() { return this.industry === 'Other'; }
            },
            previousCompanies: [{
                companyName: String,
                position: String,
                startDate: Date,
                endDate: Date
            }],
            totalExperience: { 
                type: String, 
                default: function() {
                    if (this.role === 'recruiter') return '0 years';
                    if (this.experienceLevel === 'Fresher') return '0 years';
                    
                    
                    return this.previousCompanies.reduce((total, company) => {
                        if (!company.startDate || !company.endDate) return total;
                        
                        const start = new Date(company.startDate);
                        const end = new Date(company.endDate);
                        const years = (end - start) / (1000 * 60 * 60 * 24 * 365.25);
                        
                        return total + Math.max(0, years);
                    }, 0).toFixed(1) + ' years';
                }
            },
            college: String,
            collegeLocation: String,
            graduatedYear: String,
            profileLinks: String,
            resume: String,
            videoCV: String
        }
    }
)

const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema)

export default Profile;