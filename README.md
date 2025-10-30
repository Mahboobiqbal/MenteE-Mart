# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Dev tools & environment variables

• React DevTools: For a better development experience, install the React DevTools browser extension:

• GROQ API key (Vite): This project expects a GROQ API key to be available to the client via a Vite environment variable named `VITE_GROQ_API_KEY`.

```properties
# .env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

Note: Putting a secret API key in client-side env is inherently exposed to users. If you need to keep the key private, move server-related requests to an API route or backend where the plain `GROQ_API_KEY` can be kept secret.

• Secure image uploads (recommended for production):

```properties
# .env (local testing only, do NOT commit)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Server-side admin passcode for uploads

- If you use the client-side admin passcode (VITE_ADMIN_PASSCODE) to grant admin access in the browser, the secure upload endpoint (`/api/upload`) expects a matching server-side secret named `SUPABASE_ADMIN_PASSCODE` in your deployment environment. When an admin uses the client passcode, the client will forward `VITE_ADMIN_PASSCODE` to the server in an `x-admin-passcode` header and the server will validate it against `SUPABASE_ADMIN_PASSCODE` before performing uploads with the service role key.

- Set both secrets in your host's environment variables (do NOT commit them):

```properties
VITE_ADMIN_PASSCODE=dev-passcode-for-client
SUPABASE_ADMIN_PASSCODE=the-same-passcode-on-server
```

This keeps the privileged service role key on the server while allowing the client-side admin gate to perform uploads when a Supabase user session is not available. For stronger security, use Supabase auth and sign in as a privileged user instead of relying on passcodes.

- How it works:

  1.  The client converts selected image files to base64 and POSTs to `/api/upload` with the user's access token in the Authorization header.
  2.  The server verifies the user's token with Supabase, then uploads the file to the configured storage bucket using the service role key and returns a public URL.

- Deployment note: Add `SUPABASE_SERVICE_ROLE_KEY` and other keys to your hosting platform's secret env configuration (Vercel Environment Variables, Netlify Build environment, etc.).
