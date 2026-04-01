import * as WebBrowser from "expo-web-browser";
import * as Crypto from "expo-crypto";
import { GithubAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { makeRedirectUri } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

export const signInWithGitHub = async () => {
  const redirectUri = makeRedirectUri();
  
  // What GitHub redirects to:
  const backendProxyUrl = "https://smart-skill-backend-3mlz.onrender.com/github/callback";

  const clientId = "Ov23liMvEnepKAAqxe0F";

  const csrf = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    Math.random().toString()
  );

  // We hide the Expo redirect link inside the state parameter 
  const stateObj = encodeURIComponent(JSON.stringify({ csrf, redirectUri }));

  const authUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(backendProxyUrl)}` +
    `&scope=user%20user:email` +
    `&state=${stateObj}`;

  // Tell Expo to listen for the deep link, even though we initially give GitHub the backend proxy
  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type !== "success") return;

  const url = result.url;
  const match = url.match(/[?&]code=([^&]+)/);
  if (!match) return;
  const code = match[1];

  // 🔥 Call your Render backend
  const res = await fetch("https://smart-skill-backend-3mlz.onrender.com/github-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  const data = await res.json();

  const credential = GithubAuthProvider.credential(data.access_token);

  return await signInWithCredential(auth, credential);
};