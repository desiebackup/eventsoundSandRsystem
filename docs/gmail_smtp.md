# Configure Gmail (App Password) for Laravel SMTP

This document shows how to configure a Gmail account to send mail from your Laravel application using an App Password (recommended when using 2FA). It also includes steps to test delivery using the development test-mail endpoint `GET /dev/send-test-mail`.

Important: For production apps you should prefer a dedicated transactional email provider (Mailgun/SendGrid/Postmark). Gmail is fine for testing or very small-scale sending.

## 1) Prepare the Gmail account

- Enable 2-Step Verification for the Google account you will use. You cannot create app passwords unless 2FA is enabled.
- Create an App Password:
  1. Go to https://myaccount.google.com/security
  2. Under "Signing in to Google" enable 2-Step Verification if not already enabled.
  3. Click "App passwords" and create a new app password for "Mail" on "Other (Custom name)" (e.g., "EventSoundApp").
  4. Copy the generated 16-character app password. This is the string you'll use in Laravel's `MAIL_PASSWORD`.

Notes:
- Google can block sign-in attempts from unknown locations; using an app password avoids many of these issues.
- If you cannot use app passwords (corporate Google Workspace restrictions), use an SMTP relay or a transactional provider.

## 2) Update your `.env`

Edit your local `.env` (do NOT commit secrets) and set these keys:

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"

If you prefer TLS on port 465, use `MAIL_PORT=465` and `MAIL_ENCRYPTION=ssl`.

## 3) Clear/refresh config cache

After changing `.env`, run:

```bash
php artisan config:clear
php artisan cache:clear
# optionally re-cache for performance
php artisan config:cache
```

## 4) Test sending a mail

1. Start your Laravel server (if not running):

```bash
php artisan serve
```

2. Use the development test-mail endpoint that was added to this project:

Open in a browser (or curl):

```text
http://127.0.0.1:8000/dev/send-test-mail?to=you@example.com
```

Replace `you@example.com` with your Gmail address (or any address you control). The endpoint returns JSON indicating success or an error.

3. Check your inbox. If Gmail accepted the smtp session your message should arrive shortly.

If you still don't receive the reset link when using the app's Forgot Password flow, try these debug steps:

- Check `storage/logs/laravel.log` for any exceptions.
- If your app uses queued mail (QUEUE_CONNECTION in `.env`), ensure a worker is running (php artisan queue:work).
- If you see authentication errors, double-check `MAIL_USERNAME` and the app password in `MAIL_PASSWORD`.

## 5) If Gmail blocks the connection

- Check the full error message returned by the `/dev/send-test-mail` endpoint. Common causes:
  - Authentication failed: wrong app password or username.
  - Network block: port 587 blocked by local firewall or host provider.

- If Gmail shows suspicious sign-in prevention, visit https://accounts.google.com/DisplayUnlockCaptcha and follow the steps, then retry.

## 6) Production recommendation

For production, use a dedicated transactional provider (Mailgun, SendGrid, Postmark). They provide higher deliverability, monitoring, and easier setup.

## 7) Want me to apply changes?

- I can edit your local `.env` if you want me to (I won't commit it). Alternatively I can update `config/mail.php` or `.env.example` with placeholders. Tell me which you'd prefer.
