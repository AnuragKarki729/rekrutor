import CandidateVideo from "@/components/candidate-video";

export default function VideoCVPage(){
    
    return (
        <div className="text-center border-2 border-gray-900 rounded-3xl">
             <h1 className="text-4xl mt-4 font-bold tracking-tight text-gray-900">
        Create Your Video CV
              </h1>
            <CandidateVideo/>
        </div>
    )
}