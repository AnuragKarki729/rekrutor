'use client'

import { Sheet, SheetTrigger, SheetClose, SheetContent } from "../ui/sheet";
import { Button } from "../ui/button";
import { AlignJustify } from 'lucide-react'
import Link from "next/link";
import { DialogTitle } from "@radix-ui/react-dialog";
import { UserButton, useClerk } from "@clerk/nextjs";


function Header({ user, profileInfo }) {
    const { signOut } = useClerk()

    const handleSignOut = async () => {
        try {
            console.log("Signing out...");
            await signOut(); // Sign out the user
            console.log("Sign-out successful!");
            window.location.href = "/sign-in"; // Redirect to the sign-in page
        } catch (error) {
            console.error("Sign-out failed:", error);
        }
    };



    const menuItems = [
        { label: 'Home', path: '/', show: true },
        { label: 'Login', path: '/sign-in', show: !user },
        { label: 'Register', path: '/sign-up', show: !user },
        { label: 'Jobs', path: '/jobs', show: user },
        { label: 'Activity', path: '/activity', show: profileInfo?.role === 'candidate' },
        { label: 'Video CV', path: '/membership', show: profileInfo?.role === 'candidate' },
        { label: 'Account', path: '/account', show: user },
        ]
    return (<div>
        <header className="flex h-16 w-full shrink-0 items-center">
            <Sheet>
                <SheetTrigger asChild>
                    <Button className="lg:hidden">
                        <AlignJustify className="h-6 w-6" />
                        <DialogTitle className="sr-only">
                            Toggle navigation Menu
                        </DialogTitle>
                    </Button>
                </SheetTrigger>

                <SheetContent side="left">
                    <Link href={'#'} className="font-bold text-8xl">
                        <h2>reKrutor</h2>
                    </Link>
                    <div className="grid gap-2 py-6">
                        {
                            menuItems.map(menuItem =>
                                menuItem.show ? (
                                    <Link key={menuItem.label} href={menuItem.path} 
                                    onClick={()=> sessionStorage.removeItem("filterParams")} className="flex w-full items-center py-2 text-lg font-semibold">
                                        {menuItem.label}
                                    </Link>
                                ) : null
                            )}
                        {user && (
                            <button
                                onClick={handleSignOut}
                                className="flex w-full items-center py-2 text-lg font-semibold text-red-500 hover:underline"
                            >
                                Logout
                            </button>
                        )}

                    </div>
                </SheetContent>
            </Sheet>
            <Link className="hidden lg:flex mr-6 font-bold text-4xl" href={'/'}>reKrutor</Link>
            <nav className="ml-auto hidden lg:flex gap-6">
                {
                    menuItems.map((menuItem) => menuItem.show ? (
                        <Link key={menuItem.label} href={menuItem.path} onClick={()=> sessionStorage.removeItem("filterParams")}
                            className="group inline-flex h-9 w-max items-center rounded-md bg-white px-4 py-2 text-sm font-medium">
                            {menuItem.label}
                        </Link>
                    ) : null
                    )
                }
                <UserButton afterSignOutUrl="/sign-in" signOutForceRedirectUrl="/sign-in"/>
            </nav>

        </header>
    </div>
    )
}

export default Header;