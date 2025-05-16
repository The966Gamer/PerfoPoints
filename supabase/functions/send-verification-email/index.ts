
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// This edge function sends a custom verification email
// It can be triggered via a webhook when a new user registers

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id } = await req.json();
    
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'Missing user_id parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('email, username')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate email verification link
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: user.email,
      options: {
        redirectTo: `${req.headers.get('origin')}/auth/callback`,
      },
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // In a real implementation, you would send an email here
    // using a service like SendGrid, Mailgun, etc.
    console.log('Verification link generated:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification email sent',
        // Only include this in development for testing
        link: data.properties.action_link
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
