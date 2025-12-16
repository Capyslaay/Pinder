---
description: Deploy Pinder to Vercel
---

# Deploy to Vercel

Since you are on Windows and likely want the easiest path, we will use the Vercel CLI.

1.  **Install Vercel CLI**
    Run this command in your terminal:
    ```powershell
    npm install -g vercel
    ```

2.  **Login**
    ```powershell
    vercel login
    ```
    Follow the instructions (it will open your browser).

3.  **Deploy**
    Run this command in the project folder:
    ```powershell
    vercel
    ```
    - Set up and deploy? [Y]
    - Which scope? [Select your account]
    - Link to existing project? [N]
    - Project name? [pinder]
    - In which directory? [./] (Just press Enter)
    - Want to modify settings? [N] (Vite defaults are usually correct)

4.  **Production Deployment**
    Once you are happy with the preview:
    ```powershell
    vercel --prod
    ```

This will give you a live URL (e.g., `https://pinder-app.vercel.app`) to share!
