import { SignIn } from "@clerk/nextjs"

export default function Login() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                    <p className="text-gray-600 mt-2">Please sign in to continue</p>
                </div>
                <SignIn />
            </div>
        </div>
    )
}