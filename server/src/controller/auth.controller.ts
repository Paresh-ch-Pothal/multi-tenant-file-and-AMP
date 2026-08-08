import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { TenantUser } from '../models/tenantUser';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function googleLogin(req: Request, res: Response) {
  try {
    const { credential } = req.body; // Google ID token from the client

    if (!credential) {
      return res.status(400).json({ error: 'credential (Google ID token) is required' });
    }

    // 1. Verify the token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(401).json({ error: 'invalid Google token' });
    }

    const { sub: googleId, email } = payload;

    // 2. Try to find an existing user by google_id (returning user)
    let user = await TenantUser.findOne({ google_id: googleId });

    // 3. If not found, check if they were invited by email but haven't logged in yet
    if (!user) {
      user = await TenantUser.findOne({ email: email.toLowerCase(), status: 'invited' });

      if (!user) {
        // no invite exists for this email in any tenant — reject
        return res.status(403).json({ error: 'no account found for this email — ask your admin for an invite' });
      }

      // first login: backfill google_id and activate the account
      user.google_id = googleId;
      user.status = 'active';
      await user.save();
    }

    // 4. Issue our own session JWT
    const token = jwt.sign(
      { userId: user._id.toString(), clientId: user.client_id.toString() },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role_id: user.role_id,
        client_id: user.client_id,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Google authentication failed' });
  }
}