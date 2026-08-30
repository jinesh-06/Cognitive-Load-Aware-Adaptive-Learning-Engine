import express from 'express';
import {
  OAUTH_PROVIDERS,
  buildAuthUrl,
  exchangeCodeForUser,
  getAppBaseUrl
} from '../auth/oauthService.js';

export const authRouter = express.Router();

// 1. Get OAuth Configuration Status
authRouter.get('/status', (req, res) => {
  const providersStatus = {};
  for (const [key, provider] of Object.entries(OAUTH_PROVIDERS)) {
    providersStatus[key] = {
      name: provider.name,
      configured: provider.isConfigured(),
      clientIdConfigured: Boolean(provider.getClientId()),
      secretConfigured: Boolean(provider.getClientSecret())
    };
  }
  res.json({ providers: providersStatus });
});

// 2. Initiate OAuth Login Flow
authRouter.get('/:provider/login', (req, res) => {
  try {
    const { provider } = req.params;
    const baseUrl = getAppBaseUrl(req);
    const authUrlResult = buildAuthUrl(provider, baseUrl);

    // Redirect user to Google, GitHub, or LinkedIn authorization screen
    res.redirect(authUrlResult.url);
  } catch (err) {
    console.error('OAuth initiation error:', err);
    res.status(400).send(`OAuth Initiation Error: ${err.message}`);
  }
});

// 3. OAuth Callback Handler
authRouter.get('/:provider/callback', async (req, res) => {
  try {
    const { provider } = req.params;
    const { code, error, error_description } = req.query;

    if (error) {
      console.warn(`OAuth error from ${provider}:`, error, error_description);
      return res.redirect(`/?auth_error=${encodeURIComponent(error_description || error)}`);
    }

    if (!code) {
      return res.redirect('/?auth_error=No_authorization_code_received');
    }

    const baseUrl = getAppBaseUrl(req);

    // Exchange code for verified user identity
    const profile = await exchangeCodeForUser(provider, code, baseUrl);

    // Determine admin status
    const isEmailAdmin =
      profile.email.toLowerCase().includes('admin') ||
      profile.email.toLowerCase() === 'sarah.chen@stanford.edu';

    const authenticatedUser = {
      name: profile.name,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      role: isEmailAdmin ? 'Admin' : 'Learner',
      isAdmin: isEmailAdmin,
      provider: profile.provider,
      providerId: profile.providerId,
      id: isEmailAdmin ? 'ADM-001' : `usr-${Date.now().toString().slice(-4)}`,
      isAuthenticated: true,
      loginTime: new Date().toISOString(),
      isSandbox: profile.isSandbox || false
    };

    // Redirect to frontend root with authenticated user data
    const userPayload = encodeURIComponent(JSON.stringify(authenticatedUser));
    res.redirect(`/?auth_success=true&userData=${userPayload}`);
  } catch (err) {
    console.error(`OAuth callback error for ${req.params.provider}:`, err);
    res.redirect(`/?auth_error=${encodeURIComponent(err.message || 'OAuth authentication failed')}`);
  }
});
