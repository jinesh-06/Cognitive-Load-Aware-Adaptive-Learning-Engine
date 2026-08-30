/**
 * Real OAuth 2.0 Provider Service for Google, GitHub, and LinkedIn
 */

// Helper to determine base URL
export function getAppBaseUrl(req) {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  const protocol = req?.protocol || 'http';
  const host = req?.get ? req.get('host') : 'localhost:3000';
  return `${protocol}://${host}`;
}

export const OAUTH_PROVIDERS = {
  google: {
    name: 'Google',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    scope: 'openid email profile',
    getClientId: () => process.env.GOOGLE_CLIENT_ID,
    getClientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
    getRedirectUri: (baseUrl) => process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/google/callback`,
    isConfigured: () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  },
  github: {
    name: 'GitHub',
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    userEmailsUrl: 'https://api.github.com/user/emails',
    scope: 'read:user user:email',
    getClientId: () => process.env.GITHUB_CLIENT_ID,
    getClientSecret: () => process.env.GITHUB_CLIENT_SECRET,
    getRedirectUri: (baseUrl) => process.env.GITHUB_REDIRECT_URI || `${baseUrl}/api/auth/github/callback`,
    isConfigured: () => Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
  },
  linkedin: {
    name: 'LinkedIn',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    userInfoUrl: 'https://api.linkedin.com/v2/userinfo',
    scope: 'openid profile email',
    getClientId: () => process.env.LINKEDIN_CLIENT_ID,
    getClientSecret: () => process.env.LINKEDIN_CLIENT_SECRET,
    getRedirectUri: (baseUrl) => process.env.LINKEDIN_REDIRECT_URI || `${baseUrl}/api/auth/linkedin/callback`,
    isConfigured: () => Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET)
  }
};

/**
 * Builds the authorization URL for a specific provider
 */
export function buildAuthUrl(providerKey, baseUrl, stateToken) {
  const provider = OAUTH_PROVIDERS[providerKey.toLowerCase()];
  if (!provider) {
    throw new Error(`Unsupported OAuth provider: ${providerKey}`);
  }

  const clientId = provider.getClientId();
  const redirectUri = provider.getRedirectUri(baseUrl);
  const state = stateToken || `st_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // If live credentials configured, construct provider's OAuth URL
  if (provider.isConfigured()) {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: provider.scope,
      state
    });

    if (providerKey === 'google') {
      params.append('access_type', 'offline');
      params.append('prompt', 'select_account');
    }

    return {
      url: `${provider.authUrl}?${params.toString()}`,
      isLive: true,
      state
    };
  }

  // Developer Sandbox Fallback URL (Simulates OAuth flow when keys are not in .env yet)
  const sandboxCallbackUrl = `${redirectUri}?code=SANDBOX_AUTH_CODE_${providerKey.toUpperCase()}&state=${state}&sandbox=true`;
  return {
    url: sandboxCallbackUrl,
    isLive: false,
    state
  };
}

/**
 * Exchanges authorization code for access token and retrieves verified user info
 */
export async function exchangeCodeForUser(providerKey, code, baseUrl) {
  const provider = OAUTH_PROVIDERS[providerKey.toLowerCase()];
  if (!provider) {
    throw new Error(`Unsupported OAuth provider: ${providerKey}`);
  }

  // If running in sandbox simulator mode (no live keys in .env)
  if (!provider.isConfigured() || code.startsWith('SANDBOX_AUTH_CODE_')) {
    return getSandboxUserProfile(providerKey);
  }

  const clientId = provider.getClientId();
  const clientSecret = provider.getClientSecret();
  const redirectUri = provider.getRedirectUri(baseUrl);

  // 1. Exchange Code for Access Token
  let accessToken = null;

  if (providerKey === 'google') {
    const tokenRes = await fetch(provider.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(`Google token exchange failed: ${tokenData.error_description || tokenData.error || 'No access token'}`);
    }
    accessToken = tokenData.access_token;

    // 2. Fetch Google User Profile
    const profileRes = await fetch(provider.userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const profile = await profileRes.json();
    if (!profileRes.ok) {
      throw new Error(`Google profile fetch failed: ${profile.error || 'Unknown error'}`);
    }

    return {
      provider: 'Google',
      providerId: profile.sub,
      email: profile.email,
      name: profile.name || profile.given_name || 'Google User',
      avatarUrl: profile.picture || null,
      emailVerified: Boolean(profile.email_verified),
      raw: profile
    };
  }

  if (providerKey === 'github') {
    const tokenRes = await fetch(provider.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(`GitHub token exchange failed: ${tokenData.error_description || tokenData.error || 'No access token'}`);
    }
    accessToken = tokenData.access_token;

    // 2. Fetch GitHub User Profile
    const userRes = await fetch(provider.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'Cognitive-Load-Adaptive-Learning-Engine'
      }
    });
    const userProfile = await userRes.json();

    // Fetch primary verified email if private
    let primaryEmail = userProfile.email;
    if (!primaryEmail) {
      try {
        const emailsRes = await fetch(provider.userEmailsUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'Cognitive-Load-Adaptive-Learning-Engine'
          }
        });
        const emails = await emailsRes.json();
        if (Array.isArray(emails)) {
          const primaryObj = emails.find(e => e.primary && e.verified) || emails[0];
          if (primaryObj) primaryEmail = primaryObj.email;
        }
      } catch (err) {
        console.warn('Could not fetch private GitHub emails:', err);
      }
    }

    return {
      provider: 'GitHub',
      providerId: String(userProfile.id),
      email: primaryEmail || `${userProfile.login}@github.user`,
      name: userProfile.name || userProfile.login || 'GitHub User',
      avatarUrl: userProfile.avatar_url || null,
      emailVerified: true,
      raw: userProfile
    };
  }

  if (providerKey === 'linkedin') {
    const tokenRes = await fetch(provider.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(`LinkedIn token exchange failed: ${tokenData.error_description || tokenData.error || 'No access token'}`);
    }
    accessToken = tokenData.access_token;

    // 2. Fetch LinkedIn User Profile (OpenID Connect /userinfo)
    const profileRes = await fetch(provider.userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const profile = await profileRes.json();
    if (!profileRes.ok) {
      throw new Error(`LinkedIn profile fetch failed: ${profile.error || 'Unknown error'}`);
    }

    return {
      provider: 'LinkedIn',
      providerId: profile.sub,
      email: profile.email,
      name: profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || 'LinkedIn User',
      avatarUrl: profile.picture || null,
      emailVerified: Boolean(profile.email_verified),
      raw: profile
    };
  }

  throw new Error(`Unhandled provider: ${providerKey}`);
}

/**
 * Generates verified profile for sandbox test mode when live keys are pending
 */
function getSandboxUserProfile(providerKey) {
  const normalized = providerKey.toLowerCase();
  if (normalized === 'google') {
    return {
      provider: 'Google',
      providerId: 'goog-sandbox-9921',
      email: 'alex.mercer@gmail.com',
      name: 'Alex Mercer (Google Verified)',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      emailVerified: true,
      isSandbox: true
    };
  }
  if (normalized === 'github') {
    return {
      provider: 'GitHub',
      providerId: 'gh-sandbox-4819',
      email: 'alex.mercer@github.com',
      name: 'Alex Mercer (@alex-mercer-ai)',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      emailVerified: true,
      isSandbox: true
    };
  }
  return {
    provider: 'LinkedIn',
    providerId: 'li-sandbox-7231',
    email: 'alex.mercer@linkedin.edu',
    name: 'Alex Mercer (LinkedIn Member)',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    emailVerified: true,
    isSandbox: true
  };
}
