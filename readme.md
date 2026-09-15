# IMD Programma

Curriculum overview tool for the Interactive Media Development program, plus a scraper used to produce its source data.

## Structure

- `nextjs-app/` — the web app (Next.js). This is what you run day to day.
- `server/` — Python/Streamlit scraper that generates the course data CSV.
- `static/` — legacy static HTML/CSS version of the site, kept for reference.
- `depr/` — deprecated code kept for reference.

## Web app (`nextjs-app/`)

Requires Node.js and npm.

```
cd nextjs-app
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000). On first load the app bootstraps its data from `public/data.csv` into `localStorage` automatically — no extra setup needed.

Other scripts: `npm run build` / `npm run start` for a production build.

## Scraper (`server/`)

Requires a stable Python (3.12/3.13 — an alpha/pre-release Python will fail to install some dependencies since prebuilt wheels don't exist for it yet). If you use [pyenv](https://github.com/pyenv-win/pyenv-win), the version is already pinned via `server/.python-version`.

```
cd server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
streamlit run app.py
```

This launches the ECTS scraper UI in your browser, where you can pick a study/academic year and export the scraped course data as CSV. To use that data in the web app, copy the exported CSV to `nextjs-app/public/data.csv`.
