
import ApplicantList from '@/components/applicant-list';
import Loading from "@/components/Loading";
import { currentUser } from "@clerk/nextjs/server";
import { fetchProfileAction } from "@/actions";
export default async function MyApplicants() {
    const user = await currentUser();
    const profileInfo = await fetchProfileAction(user?.id);
    
    console.log(profileInfo)
  return (
    <div>
    <ApplicantList userId={profileInfo?.userId} />
    </div>
  );
}
