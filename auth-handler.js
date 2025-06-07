// auth-handler.js

async function handleAuthFromUrl() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  if (!accessToken) return;

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
    return;
  }

  if (type === 'recovery') {
    showPasswordResetForm();
  } else if (type === 'magiclink') {
    showLoggedInUI();
  }
}

function showPasswordResetForm() {
  // TODO: Show password input and reset button
  console.log('Please enter your new password to reset.');
}

function showLoggedInUI() {
  console.log('Logged in successfully!');
}

handleAuthFromUrl();
