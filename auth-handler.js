// auth-handler-patched.js

// Import supabase client (make sure you have it configured)
import { supabase } from './supabase-client.js'; // adjust path if needed

const presetEmails = ["test1@perfo.local", "test2@perfo.local", "test3@perfo.local"];

async function handleAuthFromUrl() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  if (!accessToken) return;

  const refreshToken = params.get('refresh_token');
  const expiresIn = params.get('expires_in');
  const type = params.get('type');

  try {
    // Attempt to set the session
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: parseInt(expiresIn, 10),
    });

    if (sessionError) {
      console.error('Error setting session:', sessionError.message);
      // If session fails, create account automatically
      await createAccountFallback();
      return;
    }

    // If this is a recovery flow
    if (type === 'recovery') {
      showPasswordResetForm();
    } else if (type === 'magiclink') {
      showLoggedInUI();
    } else {
      showLoggedInUI();
    }
  } catch (err) {
    console.error('Auth handling exception:', err);
    await createAccountFallback();
  }
}

// -------------------- Auto-confirm / fallback account creation --------------------
async function createAccountFallback() {
  // Generate a fake username & email for dev/testing
  const username = `user${Date.now()}`;
  const email = presetEmails.shift() || `${username}@perfo.local`;
  const password = 'default123';

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm
    });

    if (error) {
      console.error('Fallback account creation failed:', error.message);
      return;
    }

    console.log(`Fallback account created! username: ${username}, email: ${email}`);
    showLoggedInUI();
  } catch (err) {
    console.error('Fallback exception:', err);
  }
}

// -------------------- UI stubs --------------------
function showPasswordResetForm() {
  console.log('Please enter your new password to reset.');
}

function showLoggedInUI() {
  console.log('Logged in successfully!');
}

// Run it
handleAuthFromUrl();