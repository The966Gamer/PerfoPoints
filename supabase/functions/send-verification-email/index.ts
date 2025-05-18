
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// This edge function sends a custom verification email
// It can be triggered via a webhook when a new user registers

Deno.serve(async (req) => {
  try {
    // Set up CORS headers for cross-origin requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Content-Type': 'application/json'
    };

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, email } = await req.json();
    
    // Check if we have either user_id or email
    if (!user_id && !email) {
      return new Response(JSON.stringify({ error: 'Missing user_id or email parameter' }), {
        status: 400,
        headers: { ...corsHeaders }
      });
    }

    let userEmail = email;
    
    // If we have user_id but no email, fetch the email from the database
    if (user_id && !email) {
      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user_id)
        .single();

      if (userError || !userData) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { ...corsHeaders }
        });
      }
      
      userEmail = userData.email;
    }
    
    if (!userEmail) {
      return new Response(JSON.stringify({ error: 'No email found for user' }), {
        status: 400,
        headers: { ...corsHeaders }
      });
    }

    // Generate email verification link
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: userEmail,
      options: {
        redirectTo: `${req.headers.get('origin') || 'https://qvfkazkgugonkrktiurw.supabase.co'}/auth/callback`,
      },
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders }
      });
    }

    // In a real implementation, you would send an email here
    // using a service like SendGrid, Mailgun, etc.
    console.log('Verification link generated:', data);

    // Update the email_verified field to false
    if (user_id) {
      await supabase
        .from('profiles')
        .update({ email_verified: false })
        .eq('id', user_id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification email sent',
        // Only include this in development for testing
        link: data.properties?.action_link
      }),
      {
        status: 200,
        headers: { ...corsHeaders }
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
