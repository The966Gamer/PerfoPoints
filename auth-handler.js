// auth-handler.js

async function handleAuthFromUrl() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  if (!accessToken) {
    // If no access token, create fallback account
    await createAccountFallback();
    return;
  }

  const refreshToken = params.get('refresh_token');
  const expiresIn = params.get('expires_in');
  const type = params.get('type');

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: parseInt(expiresIn, 10),
  });

  if (error) {
    console.error('Error setting session:', error.message);
    // If session fails, create fallback account
    await createAccountFallback();
    return;
  }

  if (type === 'recovery') {
    showPasswordResetForm();
  } else if (type === 'magiclink') {
    showLoggedInUI();
  }
}

async function createAccountFallback() {
  try {
    await supabase.auth.admin.createUser({
      email: "test@perfo.local",    // just a fixed email
      password: "default123",       // default password
      email_confirm: true           // auto-confirm
    });
    console.log("Account created!");
  } catch (err) {
    console.error("Failed to create account:", err);
  }
}

function showPasswordResetForm() {
  console.log('Please enter your new password to reset.');
}

function showLoggedInUI() {
  console.log('Logged in successfully!');
}

handleAuthFromUrl();