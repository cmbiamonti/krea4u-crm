# Krea4U CRM

**Free CRM for art professionals** — manage your artist database, organize exhibitions, track budgets, and communicate with your contacts through a single, intuitive platform.

Krea4U is open source and free to use. If it helps your work, consider [supporting the project](#support-the-project) with a donation.

---

## Features

- 🎨 **Artist & Contact Database** — store and manage profiles, bios, and artwork metadata
- 🖼️ **Image Management** — upload and organize artwork images linked to artist records
- 📍 **Map Integration** — visualize contacts and venues on an interactive map (Google Maps)
- 📊 **Budget Tools** — create budgets, track expenses, and export PDF reports
- 📥 **Import / Export** — import and export data in CSV and PDF formats
- 📧 **Email Campaigns** — send newsletters and communications via your own SMTP (Hostinger or any provider)
- 📈 **Analytics** — optional Google Analytics integration for usage insights
- 🔒 **GDPR-ready** — privacy-compliant data handling for EU users

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) |
| Maps | Google Maps JavaScript API |
| Email | SMTP via Hostinger (or any provider) |
| Analytics | Google Analytics (optional) |

---

## Prerequisites

Before running Krea4U locally, make sure you have:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- A [Supabase](https://supabase.com/) account (free tier is sufficient)
- A [Google Cloud](https://console.cloud.google.com/) account with Maps JavaScript API enabled
- An SMTP email account (e.g. Hostinger Business Email or any provider)
- *(Optional)* A [Google Analytics](https://analytics.google.com/) property

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/krea4u-crm.git
cd krea4u-crm
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

Open `.env` and replace each placeholder with your actual credentials.
See [Environment Variables](#environment-variables) below for details on each value.

### 4. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com/)
2. Go to **Project Settings → API** and copy your Project URL and Anon Key into `.env`
3. In the **SQL Editor**, run the migration files found in `/supabase/migrations/` in order
4. Enable **Row Level Security (RLS)** on all tables (migration scripts include RLS policies)
5. In **Storage**, create a bucket named `artworks` (or as defined in your `.env`)

### 5. Configure Google Maps

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Maps JavaScript API**
3. Create an API key and restrict it to your domain
4. Add the key to `.env` as `VITE_GOOGLE_MAPS_API_KEY`

### 6. Configure email (SMTP)

Krea4U sends emails via SMTP. Use any provider (Hostinger, Gmail, SendGrid, etc.).
Add your SMTP credentials to `.env` — see the email section in `.env.example`.

> **Note:** SMTP credentials are used server-side only (Supabase Edge Functions or your own backend).
> Never expose SMTP passwords in frontend code.

### 7. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Environment Variables

All configuration is managed via the `.env` file. See `.env.example` for the full list with descriptions.

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase public anon key |
| `VITE_GOOGLE_MAPS_API_KEY` | ✅ | Google Maps JavaScript API key |
| `VITE_GA_MEASUREMENT_ID` | ⬜ | Google Analytics measurement ID |
| `SMTP_HOST` | ✅ | SMTP server hostname |
| `SMTP_PORT` | ✅ | SMTP server port |
| `SMTP_USER` | ✅ | SMTP username / email address |
| `SMTP_PASSWORD` | ✅ | SMTP password (never commit this) |
| `SMTP_FROM_NAME` | ✅ | Sender display name |

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore`. Only `.env.example` belongs in the repository.

---

## Project Structure

```
krea4u-crm/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page-level components
│   ├── lib/              # Supabase client, utilities
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   └── main.tsx          # App entry point
├── supabase/
│   └── migrations/       # SQL migration files
├── .env.example          # Environment variable template
├── .gitignore
├── vite.config.ts
└── package.json
```

---

## Building for Production

```bash
npm run build
```

Output is generated in the `dist/` folder. Deploy to any static hosting provider (Netlify, Vercel, Cloudflare Pages, etc.) or your own server.

---

## Security Notes

- The **Supabase Anon Key** is safe to expose in frontend code — it is designed to be public. Security is enforced by **Row Level Security (RLS)** policies at the database level.
- The **Supabase Service Role Key** must **never** be used in frontend code. If you use it in Edge Functions, keep it in server-side environment variables only.
- **SMTP credentials** are server-side only. Never include them in frontend bundles.
- **Google Maps API Key** should be restricted to your specific domain in Google Cloud Console.

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add: description of change'`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please open an issue first for major changes so we can discuss the approach.

---

## Support the Project

Krea4U is free and will remain free. If it saves you time and helps your work with art, consider supporting its development:

👉 [Make a donation](https://your-donation-link.com)

Every contribution, however small, helps keep the project alive and growing.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

You are free to use, copy, modify, merge, publish, distribute, sublicense, and sell copies of the software, provided the original copyright notice is included.

---

## About

Krea4U was created to give art professionals — galleries, curators, independent artists, and cultural associations — a free, modern tool to manage their work without the cost of commercial CRM platforms.

It is developed with ❤️ in Italy.
