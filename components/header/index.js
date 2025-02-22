'use client'

import { Sheet, SheetTrigger, SheetClose, SheetContent } from "../ui/sheet";
import { Button } from "../ui/button";
import { AlignJustify } from 'lucide-react'
import Link from "next/link";
import { DialogTitle } from "@radix-ui/react-dialog";
import { UserButton, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import { usePathname } from "next/navigation";

function Header({ user, profileInfo }) {
    const { signOut } = useClerk()
    const pathname = usePathname()

    const handleSignOut = async () => {
        try {
            //console.log("Signing out...");
            await signOut();
            //console.log("Sign-out successful!");
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
                        <div className="lg:hidden flex ml-[0px] gap-[150px] items-center space-x-2 rounded-full">
                        <Button variant="ghost" className="lg:hidden -ml-4 px-4 rounded-full bg-transparent hover:scale-[1.5] transition-all duration-300 hover:border-[2px] hover:border-gray-900">
                            <AlignJustify className="h-5 w-5" />
                            <DialogTitle className="sr-only">
                                Toggle navigation Menu

                            </DialogTitle>
                        </Button>
                        <Image
                                    src="/logo.png"
                                    width={250}
                                    height={0}
                                    alt="reKrutor Logo"
                                    layout="intrinsic" // Automatically adjusts height based on width
                                    className="rounded-md opacity-100" style={{padding: "10px 20px",
                                        backgroundColor: "transparent", // Background is transparent
                                        color: "black",
                                        fontWeight: "bold",
                                        border: "none",
                                        cursor: "pointer",
                                        disabled: true // All-around shadow
                                         // Centers text inside the button
                                        }}
                                />
                        </div>
                    </SheetTrigger>

                    <SheetContent side="left" className="w-[300px] sm:w-[240px] rounded-3xl border-[4px] border-gray-900">
                        <Link href={'/'} className="flex items-center space-x-2">
                            <div style={{
                                display: "inline-block",
                                textAlign: "center",
                                overflow: "hidden"
                            }}><Image
                                    src="/logo.png"
                                    width={250}
                                    height={0}
                                    alt="reKrutor Logo"
                                    layout="intrinsic" // Automatically adjusts height based on width
                                    className="rounded-md opacity-100" style={{padding: "10px 20px",
                                        backgroundColor: "transparent", // Background is transparent
                                        color: "black",
                                        fontWeight: "bold",
                                        border: "none",
                                        cursor: "pointer",
                                        boxShadow: "0px 10px 20px rgba(53, 53, 53, 0.5)", // All-around shadow
                                         // Centers text inside the button
                                        }}
                                /></div></Link>

                        <nav className="mt-[20px] flex flex-col space-y-3 ">
                            {menuItems.map(menuItem =>
                                menuItem.show ? (
                                    <Link
                                        key={menuItem.id}
                                        href={menuItem.path}
                                        onClick={() => sessionStorage.removeItem("filterParams")}
                                        className="flex items-center space-x-[5px] 
                                        text-lg font-medium hover:scale-[1.05] 
                                        transition-all duration-300"
                                        style={{
                                            padding: "10px 20px",
                                            backgroundColor: "transparent", // Background is transparent
                                            color: "black",
                                            fontWeight: "bold",
                                            border: "none",
                                            cursor: "pointer",
                                            boxShadow: "0px 10px 20px rgba(53, 53, 53, 0.5)", // All-around shadow
                                            textAlign: "center", // Centers text inside the button
                                            display: "flex", // Flex to align text properly
                                            justifyContent: "center",
                                            borderRadius: "40px", // Centers horizontally
                                            alignItems: "center" // Centers vertically
                                        }}>
                                        {menuItem.label}
                                    </Link>

                                ) : null
                            )}
                            {user && (
                                <button
                                    onClick={handleSignOut}
                                    className="text-lg hover:font-bold hover:scale-[1.05] transition-all duration-300 border-[2px] border-gray-900 rounded-full px-4 py-2 font-medium text-gray-700 transition-colors hover:text-black"
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "transparent", // Background is transparent
                                        color: "black",
                                        fontWeight: "bold",
                                        border: "none",
                                        cursor: "pointer",
                                        boxShadow: "0px 10px 20px rgba(253, 11, 11, 0.5)", // All-around shadow
                                        textAlign: "center", // Centers text inside the button
                                        display: "flex", // Flex to align text properly
                                        justifyContent: "center",
                                        borderRadius: "40px", // Centers horizontally
                                        alignItems: "center" // Centers vertically
                                    }}
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
                        width={180}
                        height={0}
                        alt="reKrutor Logo"
                        className="h-auto w-auto rounded-md opacity-100"


                    />
                </Link>

                {/* Desktop Navigation */}
                <nav className="ml-auto hidden lg:flex items-center space-x-6">
                    {menuItems.map((menuItem) => menuItem.show ? (
                        <Link
                            key={menuItem.id}
                            href={menuItem.path}
                            onClick={() => sessionStorage.removeItem("filterParams")}
                            className="text-medium hover:font-bold hover:scale-[1.05] transition-all duration-300 border-[2px] border-gray-900 rounded-full px-4 py-2 font-medium text-gray-700 transition-colors hover:text-black"
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "transparent", // Background is transparent
                                color: "black",
                                fontWeight: "bold",
                                border: "none",
                                cursor: "pointer",
                                boxShadow: "0px 10px 20px rgba(129, 129, 129,0.5)", // All-around shadow
                                textAlign: "center", // Centers text inside the button
                                display: "flex", // Flex to align text properly
                                justifyContent: "center",
                                borderRadius: "40px", // Centers horizontally
                                alignItems: "center" // Centers vertically
                            }}
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