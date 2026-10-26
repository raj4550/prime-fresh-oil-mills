# Prime Fresh Oil Mills: website

Static site. Plain HTML, CSS and JavaScript. No build step, no dependencies.

## Deploy (GitHub + Vercel)
1. Create an empty GitHub repo and push this folder to `main`.
2. Vercel: Add New > Project > import the repo.
3. Framework Preset: **Other**. Leave Build Command, Output Directory and Install Command empty. Deploy.

Run locally: `python3 -m http.server 4173` in this folder, then open http://localhost:4173

## Placeholders the client must confirm
- Mill address (index.html, search "Address to be added"). Not provided by the owner.
- Yellow mustard oil and sesame oil have no product photo. They use an original droplet
  illustration labelled "Illustration". Drop real photos into /img and set `img` in js/app.js.
- No certifications, capacities, prices or specifications are claimed anywhere.

## Files
- index.html: page structure
- css/styles.css: design tokens at the top (colours come from the logo)
- js/app.js: product data, filters, enquiry sheet, WhatsApp / email handoff
- img, video: optimised assets (emblem cut from the logo with the text removed)
