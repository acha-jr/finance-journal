'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string

    if (!email) {
        return
    }

    const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        console.error('Login error:', error)
        redirect('/login?error=true')
    }

    revalidatePath('/', 'layout')
    redirect('/login?check_email=true')
}
