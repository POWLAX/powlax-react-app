# Page snapshot

```yaml
- text: Welcome to POWLAX Enter your email to receive a magic link Email Address
- textbox "Email Address"
- button "Send Magic Link":
  - img
  - text: Send Magic Link
- paragraph: We'll send you a secure link to sign in instantly. No password needed!
- paragraph:
  - text: Don't have an account?
  - link "Sign up on POWLAX.com":
    - /url: https://powlax.com/register
- region "Notifications alt+T"
- alert
```