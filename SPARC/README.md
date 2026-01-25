# SPARC

A modern React website built with Next.js and shadcn/ui.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- ⚡ Next.js 16 with App Router
- 🎨 Tailwind CSS
- 🧩 shadcn/ui components
- 📱 Fully responsive
- 🌙 Dark mode support (ready to implement)
- 🔧 TypeScript

## Adding shadcn/ui Components

To add new shadcn/ui components, run:

```bash
npx shadcn@latest add [component-name]
```

For example:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
```

## Project Structure

```
sparc/
├── app/              # Next.js app directory
│   ├── globals.css   # Global styles
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Home page
├── components/       # React components
│   └── ui/          # shadcn/ui components
├── lib/             # Utility functions
└── public/          # Static assets
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
