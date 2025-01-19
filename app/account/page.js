'use client'
import { useState, useEffect } from 'react'
import AccountInfo from "@/components/account-info";
import { useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation'

export default function AccountPage() {
    const [profile, setProfile] = useState(null)
    const router = useRouter()
    const { user, isLoaded } = useUser()

    useEffect(() => {
        if (isLoaded) {
            if (user) {
                fetchProfile(user.id)
            } else {
                router.push("/onboard")
            }
        }
    }, [isLoaded, user])

    // Fetch profile
    async function fetchProfile(id) {
        try {
            const response = await fetch(`/api/profiles/${id}`)
            if (!response.ok) throw new Error('Failed to fetch profile')
            const data = await response.json()
            setProfile(data)
        } catch (error) {
            console.error('Error:', error)
        }
    }

    // Create profile
    async function createProfile(formData) {
        try {
            const response = await fetch('/api/profiles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            if (!response.ok) throw new Error('Failed to create profile')
            const data = await response.json()
            setProfile(data)
        } catch (error) {
            console.error('Error:', error)
        }
    }

    // Update profile
    async function updateProfile(id, formData) {
        try {
            const response = await fetch(`/api/profiles/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            if (!response.ok) throw new Error('Failed to update profile')
            const data = await response.json()
            setProfile(data)
        } catch (error) {
            console.error('Error:', error)
        }
    }

    if (!isLoaded) return <div>Loading...</div>

    return (
        <div>
            {profile && <AccountInfo profileInfo={profile}/>}
        </div>
    )
}