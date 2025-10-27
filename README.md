# Stupid Web Tricks

A collection of web effects and animations I've been experimenting with. Built with Astro and React.

## What's Inside

- **Modern Design**: Glass morphism effects, gradients, and smooth animations
- **Interactive Demos**: Working examples of HTML, CSS, JavaScript, SVG, Canvas, and WebGL tricks
- **Fast Performance**: Astro's static site generation keeps things fast
- **Mobile Friendly**: Responsive design that works everywhere
- **Accessible**: Proper semantic HTML and accessibility features

## Tech Stack

- **Astro** - Static site generator that's really fast
- **Tailwind CSS** - Utility-first CSS (because writing custom CSS is tedious)
- **GSAP** - For the fancy animations
- **Lucide React** - Clean icons
- **Cloudflare Pages** - Free hosting that actually works

## Project Structure

```
src/
├── layouts/
│   └── Layout.astro          # Main layout with nav
├── pages/
│   ├── index.astro          # Homepage with category cards
│   ├── html.astro           # HTML tricks
│   ├── css.astro            # CSS effects
│   ├── javascript.astro     # JavaScript demos
│   ├── svg-canvas.astro     # SVG and Canvas stuff
│   └── webgl.astro          # WebGL experiments
└── styles/
    └── global.css           # Global styles
```

## Categories

### HTML Tricks
- Semantic HTML patterns
- Accessibility improvements
- Form validation tricks
- Meta tag optimizations
- Data attributes
- Microdata & Schema

### CSS Effects
- Glass morphism
- Animated gradients
- 3D transforms
- Text reveal animations
- Floating elements
- Advanced animations

### JavaScript
- Interactive counters
- Dynamic color pickers
- Typing animations
- Drag & drop functionality
- Async/await patterns
- Event delegation

### SVG & Canvas
- SVG path animations
- Interactive drawing
- Shape morphing
- Particle systems
- Custom filters
- Image processing

### WebGL
- Basic 3D graphics
- Rotating objects
- Custom shaders
- Particle systems
- Texture mapping
- Lighting effects

## Getting Started

You'll need Node.js 18+ and npm.

```bash
# Clone the repo
git clone https://github.com/richlewis007/stupid-web-tricks.git
cd stupid-web-tricks

# Install dependencies
npm install

# Start the dev server
npm run dev
```

### Available Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Deployment

This project supports deployment to both Cloudflare Pages and GitHub Pages:

### Cloudflare Pages

1. **Framework**: Astro
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`

### GitHub Pages

1. **Framework**: Astro
2. **Build Command**: `npm run build:github`
3. **Output Directory**: `dist`
4. **Base URL**: `/stupid-web-tricks`
5. **Custom Domain**: `https://richlewis007.com`

### Manual Build

```bash
# For Cloudflare Pages
npm run build

# For GitHub Pages
npm run build:github

# The dist/ folder has your static files
```

## Design System

### Colors
- **Primary**: Purple to Blue gradient (`#667eea` to `#764ba2`)
- **Secondary**: Pink to Red gradient (`#f093fb` to `#f5576c`)
- **Accent**: Blue to Cyan gradient (`#4facfe` to `#00f2fe`)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800, 900

### Animations
- **Duration**: 0.3s for interactions, 0.6s for page transitions
- **Easing**: ease-out for natural feel
- **Effects**: Float, glow, slide-up, fade-scale

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

Feel free to submit a PR if you have ideas for new tricks!

1. Fork the repo
2. Create your branch (`git checkout -b feature/your-idea`)
3. Commit your changes (`git commit -m 'Add your idea'`)
4. Push to the branch (`git push origin feature/your-idea`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

- [Astro](https://astro.build/) - The static site generator
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [GSAP](https://greensock.com/gsap/) - Animation library
- [Cloudflare](https://cloudflare.com/) - Hosting

## Contact

Rich Lewis - [@richlewis007](https://github.com/richlewis007)

Project: [https://github.com/richlewis007/stupid-web-tricks](https://github.com/richlewis007/stupid-web-tricks)

---

⭐ Star this repo if you found it useful!