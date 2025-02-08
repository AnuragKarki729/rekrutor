'use client'

import { Sheet, SheetTrigger, SheetClose, SheetContent } from "../ui/sheet";
import { Button } from "../ui/button";
import { AlignJustify } from 'lucide-react'
import Link from "next/link";
import { DialogTitle } from "@radix-ui/react-dialog";
import { UserButton, useClerk } from "@clerk/nextjs";
import Image from "next/image";
function Header({ user, profileInfo }) {
    const { signOut } = useClerk()

    const handleSignOut = async () => {
        try {
            console.log("Signing out...");
            await signOut();
            console.log("Sign-out successful!");
            window.location.href = "/sign-in";
        } catch (error) {
            console.error("Sign-out failed:", error);
        }
    };

    const menuItems = [
        { id: 'home', label: 'Home', path: '/', show: true },
        { id: 'login', label: 'Login', path: '/sign-in', show: !user },
        { id: 'register', label: 'Register', path: '/sign-up', show: !user },
        { id: 'jobs', label: 'Jobs', path: '/jobs', show: user },
        { id: 'activity', label: 'Activity', path: '/activity', show: profileInfo?.role === 'candidate' },
        { id: 'myapplicants', label: 'My Applicants', path: '/myapplicants', show: profileInfo?.role === 'recruiter' },
        {
            id: 'nudge',
            label: (
                profileInfo?.role === 'candidate' ?
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text font-semibold">
                        Nudge Mail
                    </div>
                    :
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text font-semibold">
                        Acknowledge Applicants
                    </div>
            ),
            path: '/mailto',
            show: profileInfo?.role === 'candidate' || profileInfo?.role === 'recruiter'
        },

        {
            id: 'video',
            label: (
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-transparent bg-clip-text font-semibold">
                    Video CV
                </div>
            ),
            path: '/membership',
            show: profileInfo?.role === 'candidate'
        },
        { id: 'account', label: 'Account', path: '/account', show: user },
    ]

    return (
        <div className="sticky top-0 z-50 w-full border-[2px] border-gray-900 rounded-full backdrop-blur" style={{ background: "linear-gradient(98.24deg,rgba(251, 251, 251, 0.64) 10%,rgba(156, 156, 251, 0.48) 50.4%, #EBECF7 90%)" }}>
            <header className="container mx-auto flex h-16 items-center justify-between px-4">


                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" className="lg:hidden -ml-4 px-4 rounded-full bg-transparent hover:scale-[1.5] transition-all duration-300 hover:border-[2px] hover:border-gray-900">
                            <AlignJustify className="h-5 w-5" />
                            <DialogTitle className="sr-only">
                                Toggle navigation Menu

                            </DialogTitle>
                        </Button>
                    </SheetTrigger>

                    <SheetContent side="left" className="w-[300px] sm:w-[240px] rounded-3xl border-[4px] border-gray-900">
                        <Link href={'/'} className="flex items-center space-x-2 bg-red-200 rounded-full">
                            <Image
                                src="/logo.png"
                                width={200}
                                height={100}
                                alt="reKrutor Logo"
                                

                            /></Link>

                        <nav className="mt-1 flex flex-col space-y-3">
                            {menuItems.map(menuItem =>
                                menuItem.show ? (
                                    <Link
                                        key={menuItem.id}
                                        href={menuItem.path}
                                        onClick={() => sessionStorage.removeItem("filterParams")}
                                        className="flex items-center space-x-2 text-lg font-medium border-[2px] border-gray-900 rounded-full px-4 py-2 transition-colors hover:text-black hover:font-bold hover:scale-[1.02] transition-all duration-300 "
                                    >
                                        {menuItem.label}
                                    </Link>

                                ) : null
                            )}
                            {user && (
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center space-x-2 text-lg border-[2px] border-gray-900 rounded-full px-4 py-2 font-medium text-red-500 transition-colors hover:text-red-600"
                                >
                                    Logout
                                </button>
                            )}
                        </nav>
                    </SheetContent>
                </Sheet>

                {/* Desktop Logo */}
                <Link
                    href={'/'}
                    className="hidden lg:flex items-center space-x-2 font-bold text-2xl hover:opacity-90 transition-opacity"
                >
                    <Image
                                src="/logo.png"
                                width={100}
                                height={10}
                                alt="reKrutor Logo"
                                className="h-auto w-auto rounded-md opacity-90 border-t-[5px] border-b-[5px] border-gray-500"
                                

                            />
                </Link>

                {/* Desktop Navigation */}
                <nav className="ml-auto hidden lg:flex items-center space-x-6">
                    {menuItems.map((menuItem) => menuItem.show ? (
                        <Link
                            key={menuItem.id}
                            href={menuItem.path}
                            onClick={() => sessionStorage.removeItem("filterParams")}
                            className="text-lg hover:font-bold hover:scale-[1.02] transition-all duration-300 border-[2px] border-gray-900 rounded-full px-4 py-2 font-medium text-gray-700 transition-colors hover:text-black"
                        >
                            {menuItem.label}
                        </Link>
                    ) : null)}
                    <div className="pl-2">
                        <UserButton
                            afterSignOutUrl="/sign-in"
                            signOutForceRedirectUrl="/sign-in"
                            appearance={{
                                elements: {
                                    avatarBox: "h-8 w-8"
                                }
                            }}
                        />
                    </div>
                </nav>
            </header>
        </div>
    )
}

export default Header;