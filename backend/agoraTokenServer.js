/**
 * Agora Token Server (production-style).
 *
 * Install deps:
 *   npm install express agora-token dotenv
 *
 * Run:
 *   node agoraTokenServer.js
 *
 * backend/.env example:
 *   APP_ID=           # 🔑 ADD YOUR KEY HERE
 *   APP_CERTIFICATE=  # 🔑 ADD YOUR KEY HERE
 *   PORT=8080
 */

import dotenv from 'dotenv';
import express from 'express';
import {RtcRole, RtcTokenBuilder} from 'agora-token';

dotenv.config();

const app = express();

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.get('/health', (_req, res) => {
  res.json({status: 'ok'});
});

app.get('/agora-token', (req, res) => {
  const appId = process.env.APP_ID; // 🔑 ADD YOUR KEY HERE
  const appCertificate = process.env.APP_CERTIFICATE; // 🔑 ADD YOUR KEY HERE

  if (!appId || !appCertificate) {
    return res.status(500).json({
      error: 'Missing APP_ID / APP_CERTIFICATE',
    });
  }

  const channelName = String(req.query.channelName || '').trim();
  if (!channelName) {
    return res.status(400).json({error: 'channelName is required'});
  }

  const uidRaw = req.query.uid;
  const uid = uidRaw == null || uidRaw === '' ? 0 : Number(uidRaw) || 0;

  const expiresIn = 3600;
  const now = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = now + expiresIn;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    RtcRole.PUBLISHER,
    privilegeExpiredTs,
  );

  return res.json({
    token,
    channelName,
    uid,
    appId,
    expiresIn,
  });
});

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => {
  console.log(`[agoraTokenServer] listening on port ${PORT}`);
});

