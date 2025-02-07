'use client'

import { Button } from "../ui/button"
import { X } from "lucide-react"
import { useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

export default function CancelSignupButton() {
    const { signOut } = useClerk()
    const router = useRouter()
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)

    const handleCancelSignup = async () => {
        try {
            await signOut()
            router.push('/sign-in')
        } catch (error) {
            console.error('Error canceling signup:', error)
        }
    }

    return (
        <>
            <Button
                onClick={() => setShowConfirmDialog(true)}
                className="fixed top-4 right-4 z-50 rounded-full w-12 h-12 hover:scale-110 transition-all duration-300 border-[2px] border-gray-900 bg-red-500 hover:bg-red-600 p-0 shadow-lg"
                aria-label="Cancel signup"
            >
                <X className="h-6 w-6" />
            </Button>

            <AlertDialog 
            open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent className="border-[5px] border-gray-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Sign Up?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will delete your account and all associated data. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-row gap-4">
                        <AlertDialogCancel
                        className= "border-[3px] border-gray-900 hover:scale-110 items-center justify-center transition-all duration-300"
                        >No, continue signup</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelSignup}
                            className="text-center border-[3px] border-gray-900 w-2/7 items-center justify-center bg-red-500 hover:bg-red-600"
                        >
                            Yes, cancel signup
                        </AlertDialogAction>

                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
} 