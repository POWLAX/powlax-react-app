# Page snapshot

```yaml
- text: Welcome to POWLAX Sign in with your POWLAX account Username
- textbox "Username"
- text: Password
- textbox "Password"
- button "Sign In"
- link "Forgot your password?":
  - /url: https://powlax.com/wp-login.php?action=lostpassword
- paragraph:
  - text: Don't have an account?
  - link "Sign up on POWLAX.com":
    - /url: https://powlax.com/register
- region "Notifications alt+T"
- alert
```