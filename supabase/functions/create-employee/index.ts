import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Create a Supabase client with the Auth context of the logged in user
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        )

        // Check if the user making the request is an admin
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Verify admin role
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'admin') {
            return new Response(
                JSON.stringify({ error: 'Only admins can create employees' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get the new employee data from the request
        const {
            fullName,
            email,
            phone,
            idNumber,
            department,
            position,
            location,
            startDate,
            contractType,
            baseSalary,
            role,
            status,
            managerId
        } = await req.json()

        // Validate required fields
        if (!email || !fullName) {
            return new Response(
                JSON.stringify({ error: 'Email and full name are required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Use a fixed default password
        const tempPassword = "123456"

        // Create a Supabase Admin client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // Create the user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true, // Auto-confirm the email
            user_metadata: {
                full_name: fullName,
            }
        })

        if (authError || !authData.user) {
            console.error('Error creating auth user:', authError)
            return new Response(
                JSON.stringify({ error: `Failed to create user: ${authError?.message || 'Unknown error'}` }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Generate employee ID
        const year = new Date().getFullYear()
        const random = Math.floor(Math.random() * 900) + 100
        const employeeId = `EMP-${year}-${random}`

        // Create the profile
        const { data: profileData, error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                employee_id: employeeId,
                full_name: fullName,
                email,
                phone: phone || null,
                id_number: idNumber || null,
                department,
                position,
                location: location || null,
                start_date: startDate,
                contract_type: contractType || null,
                base_salary: baseSalary || 0,
                role: role || 'employee',
                status: status || 'active',
                manager_id: managerId || null,
            })
            .eq('id', authData.user.id)
            .select()
            .single()

        if (profileError) {
            console.error('Error creating profile:', profileError)
            // Try to clean up the auth user if profile creation fails
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            return new Response(
                JSON.stringify({ error: `Failed to create profile: ${profileError.message}` }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Add history entry
        await supabaseAdmin
            .from('employee_history')
            .insert({
                user_id: authData.user.id,
                type: 'created',
                description: 'Tạo hồ sơ nhân viên mới',
                performed_by: user.id,
                performed_by_name: profile?.full_name || 'Admin',
            })

        return new Response(
            JSON.stringify({
                success: true,
                user: profileData,
                tempPassword, // In production, you should send this via email instead
                message: `User created successfully. Temporary password: ${tempPassword}`
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Unexpected error:', error)
        return new Response(
            JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
