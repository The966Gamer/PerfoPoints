// src/lib/user-system.js

// ================= CONFIG =================
let PROTECTION_ENABLED = true;
let ADMIN_OVERRIDE_PASSWORD = "supersecret123"; // admin can change
const PROTECTED_USERS = ["mum", "dad"];

export function setAdminPassword(newPass) {
  ADMIN_OVERRIDE_PASSWORD = newPass;
}

export function toggleProtection(value) {
  PROTECTION_ENABLED = value;
}


// ================= CREATE USER =================
export async function createUser(supabase, inputUsername, inputPassword) {

  const usernameLower = inputUsername.toLowerCase();
  const displayName = inputUsername;

  // 🔍 get ALL matches ignoring case
  const { data: matches, error } = await supabase
    .from('users')
    .select('*')
    .ilike('username', usernameLower);

  if (error) throw new Error("DB error");

  const exists = matches.length > 0;

  // ================= DUPLICATE CHECK =================
  if (matches.length > 1) {
    throw new Error("⚠️ Multiple users exist. Type exact username.");
  }

  // ================= PROTECTED USERS =================
  if (PROTECTION_ENABLED && PROTECTED_USERS.includes(usernameLower)) {

    if (exists) {
      if (inputPassword === ADMIN_OVERRIDE_PASSWORD) {
        await supabase
          .from('users')
          .delete()
          .eq('username', usernameLower);

        console.log("🗑️ Protected user replaced");
      } else {
        throw new Error("🔒 Username protected");
      }
    } else {
      if (inputPassword !== ADMIN_OVERRIDE_PASSWORD) {
        throw new Error("🔒 Username protected");
      }
    }
  }

  // ================= NORMAL DUPES =================
  if (exists && !PROTECTED_USERS.includes(usernameLower)) {
    throw new Error("Username already exists ❌");
  }

  // ================= CREATE =================
  const { error: insertError } = await supabase
    .from('users')
    .insert({
      username: usernameLower,
      display_name: displayName,
      password: inputPassword,
      points: 0
    });

  if (insertError) throw new Error("Failed to create user");

  console.log(`✅ Created ${displayName}`);
}


// ================= LOGIN =================
export async function loginUser(supabase, inputUsername, inputPassword) {

  const usernameLower = inputUsername.toLowerCase();

  // 🔍 find all matches ignoring case
  const { data: matches, error } = await supabase
    .from('users')
    .select('*')
    .ilike('username', usernameLower);

  if (error) throw new Error("DB error");

  // 🚨 MULTIPLE USERS FOUND
  if (matches.length > 1) {
    throw new Error("⚠️ Multiple users found. Type exact username.");
  }

  if (matches.length === 0) {
    throw new Error("User not found ❌");
  }

  const user = matches[0];

  // password check
  if (user.password !== inputPassword) {
    throw new Error("Wrong password ❌");
  }

  console.log(`✅ Logged in as ${user.display_name}`);
  return user;
}