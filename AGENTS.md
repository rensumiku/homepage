# SumiX Homepage

- This repository contains the public SumiX corporate website.
- The site is mostly static HTML/CSS/JS. `contact.php` is intended to run on Xserver and send mail to `info@sumix.jp`.
- Keep the repository as the source of truth. Avoid editing files directly on Xserver without syncing the same change back here.
- For local preview, serve this directory with a static server and open `index.html`.
- Before publishing, verify key pages: `/`, `/yurulabo/`, `/yurulabo/terms/`, `/yurulabo/privacy-policy/`, `/home/tokutei/`.
- Do not commit secrets, server credentials, API keys, or `.env` files.
