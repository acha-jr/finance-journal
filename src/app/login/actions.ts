'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string

    if (!email) {
        return
    }

    const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
            // In production, set NEXT_PUBLIC_BASE_URL to your deployment URL
            emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    })

    if (error) {
        console.error('Login error:', error)
        redirect('/login?error=true')
    }

    revalidatePath('/', 'layout')
    redirect('/login?check_email=true')
}
