import { useEffect, useCallback, useState } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const isGoogleConfigured = () =>
  GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID';

export const useGoogleAuth = () => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const [tokenClient, setTokenClient] = useState(null);

  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google?.accounts?.oauth2 && isGoogleConfigured()) {
        try {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'email profile',
            callback: () => {}
          });
          setTokenClient(client);
        } catch (err) {
          console.error('Failed to initialize Google token client:', err);
        }
      }
    };

    if (window.google?.accounts) {
      setIsGoogleLoaded(true);
      initializeGoogle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsGoogleLoaded(true);
      initializeGoogle();
    };
    script.onerror = () => console.error('Failed to load Google Identity Services');
    document.head.appendChild(script);
  }, []);

  const signInWithGoogle = useCallback(async (onSuccess, onError) => {
    if (isRequestInProgress) return;

    if (!isGoogleConfigured()) {
      onError?.(new Error('Google OAuth not configured'));
      return;
    }

    if (!isGoogleLoaded || !window.google?.accounts?.oauth2) {
      onError?.(new Error('Google OAuth not loaded'));
      return;
    }

    setIsLoading(true);
    setIsRequestInProgress(true);

    const timeoutId = setTimeout(() => {
      setIsRequestInProgress(false);
      setIsLoading(false);
    }, 30000);

    try {
      let client = tokenClient;
      if (!client) {
        client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile',
          callback: () => {}
        });
        setTokenClient(client);
      }

      client.callback = async (tokenResponse) => {
        try {
          if (tokenResponse.error) throw new Error(tokenResponse.error);

          const userInfoRes = await fetch(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
          );
          const userInfo = await userInfoRes.json();

          onSuccess?.({
            googleToken: tokenResponse.access_token,
            userInfo: {
              email: userInfo.email,
              name: userInfo.name,
              given_name: userInfo.given_name,
              family_name: userInfo.family_name,
              picture: userInfo.picture,
              email_verified: userInfo.email_verified,
              sub: userInfo.sub
            },
            isAccessToken: true
          });
        } catch (err) {
          onError?.(err);
        } finally {
          clearTimeout(timeoutId);
          setIsLoading(false);
          setIsRequestInProgress(false);
        }
      };

      client.requestAccessToken();
    } catch (err) {
      onError?.(err);
      clearTimeout(timeoutId);
      setIsLoading(false);
      setIsRequestInProgress(false);
    }
  }, [isGoogleLoaded, isRequestInProgress, tokenClient]);

  return { isGoogleLoaded, isLoading: isLoading || isRequestInProgress, signInWithGoogle, isConfigured: isGoogleConfigured() };
};

export default useGoogleAuth;
