# INT/AME 264 – History and Culture of Video Games

**A retro-themed React site built from JSON data**

This site is a course companion for **INT/AME 264: The History and Culture of Video Games**. The site features a retro gamer aesthetic with neon highlights, CRT scanlines, and pixel-art fonts. All content is driven by JSON files extracted from a markdown document.

---

## Features

- **Learning Outcomes Page**: Browse the eight course learning outcomes with links to view resources associated with each outcome.
- **Modules Page**: Weekly modules listing with titles, topics, and placeholder overviews.
- **Module Detail Page**: Shows required and optional resources for each week, with LO tags displayed as tooltips.
- **Resource Tooltips**: Hover over `LO X` badges to see the full learning outcome text.
- **Retro Theme**: Styled with Press Start 2P and VT323 fonts, CRT scanlines, and neon color accents.

---

## Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** (comes with Node.js)

### Installation

1. Clone or open this repository:
   ```bash
   cd int-ame-264
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Generate JSON Data

The site reads from JSON files in the `data/` directory. To extract data from `starting-document.md`:

```bash
npm run extract
```

This creates:
- `data/learningOutcomes.json` – The 8 learning outcomes from the markdown file.
- `data/modules.json` – Weekly modules parsed from H2 headings containing "Week".
- `data/resources.json` – All required and optional resources, tagged with learning outcomes.

### Run Development Server

Start the Vite dev server:

```bash
npm run dev
```

Open your browser to [http://localhost:5173](http://localhost:5173) to view the site.

### Build for Production

Create an optimized production build:

```bash
npm run build
```

The output will be in the `dist/` folder. You can serve it with:

```bash
npm run preview
```

---

## Updating Content

1. Edit `starting-document.md` with any changes to learning outcomes, modules, or resources.
2. Run `npm run extract` to regenerate the JSON files.
3. The site will automatically pick up the changes on next load.

---

## Folder Structure

```
int-ame-264/
├─ data/               # Generated JSON files
├─ scripts/            # extraction script
│  └─ extract-course-data.mjs
├─ src/
│  ├─ components/      # React components (Navbar, Footer, Tooltip, ResourceItem)
│  ├─ pages/           # Pages (Home, LearningOutcomes, OutcomeResources, Modules, Module)
│  ├─ App.jsx          # Root layout with Outlet
│  ├─ main.jsx         # React entrypoint + routing
│  └─ styles.css       # Global CSS with retro theme
├─ index.html          # HTML entry point
├─ vite.config.js      # Vite configuration
├─ package.json        # npm scripts and dependencies
└─ starting-document.md # Source markdown with course content
```

---

## Technologies Used

- **React 18** – component-based UI
- **React Router 6** – client-side routing
- **Vite** – fast bundler and dev server
- **Google Fonts** – Press Start 2P + VT323 for retro styling
- **Node.js** – extraction script for parsing markdown

---

## License

This project is for educational use with the INT/AME 264 course.

---

## Questions?

See the [starting-document.md](./starting-document.md) for the full course outline, or reach out to the course instructor.
