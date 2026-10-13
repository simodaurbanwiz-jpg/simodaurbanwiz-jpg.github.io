# Simor Uphills Portfolio

Open `index.html` to preview. **For live editing, open `index.html?edit`** (or press Ctrl+Shift+E).

## Live editor tabs
Style (looks, fonts, effects) · Background · Orbit (sizes, speed, photo upload) · Icons (resize, animate, reorder, add) · Projects · Text (click text on the page to edit) · Save.
Changes show instantly and are remembered in your browser. To make them permanent: **Save → Download config.js → replace js/config.js** (and save the new photo as images/profile.jpg).

## Files
| What | Where |
|---|---|
| All settings, projects, resume, music, contact | `js/config.js` |
| Page text and links | `index.html` |
| Your CSS overrides | `css/custom.css` |
| Photo, logos, project images | `images/` |
| CV (PDF) | `files/` then set `resume.cvFile` |
| Songs (mp3) | `audio/` then add to `music.tracks` |

## Before you go public (checklist)
1. Replace the placeholder projects and resume entries (marked dashed or faded).
2. Add your CV PDF and set `resume.cvFile`.
3. Contact form: create a free form at formspree.io and paste the URL in `contact.formspree`.
4. Replace `YOUR-DOMAIN.com` in `sitemap.xml` and `robots.txt`; for link previews set the `og:image` in `index.html` to the full URL (e.g. https://yourdomain.com/images/og.jpg).
5. Optional: add `analytics.plausibleDomain` or `googleId`.
6. Verify the social links.
7. Deploy: drag the folder to netlify.com/drop, or use GitHub Pages. `404.html` is picked up automatically.

## Weather and fire effects
In the live editor, Background tab, pick **Weather / effect**: glitter, snow, rain (with splashes), storm (rain + lightning), sun (changing rays), electric (strikes) or fire. In config.js use `background.effect` and `effectAmount`.

## Typing roles
Edit them in the live editor (Text tab) or in `roles` and `rolePrefix` in config.js.

## Coder-world animations
More options in **Background animation**: `math` (floating equations and sums), `fourier` (epicycles drawing a wave), `dsa` (bubble sort, binary tree BFS and Big-O labels), `music` (floating notes), `code` (snippets typing themselves in Python, JS, C++, Go, Rust, SQL, Bash and more).

## Photo cropping
Live editor, Orbit tab, choose a photo: a crop window opens. Drag to position, zoom with the slider or wheel, and the bright circle shows exactly what visitors will see.

## Photo gallery
Put pictures in `images/gallery/`, then add them in the live editor (Gallery tab) or in `gallery` in config.js. Click a photo to open a full-screen viewer with next, previous and close. The section and its menu link stay hidden while the gallery is empty.
