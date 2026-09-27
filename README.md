# Nexa

> Turn every conversation into revenue.

Nexa is a polished AI customer-support experience built around one idea: give teams a faster, clearer way to understand customer intent and take the right action. The product combines an intelligent inbox, conversation insights, and human-friendly workflows in one focused workspace.

## What is inside

- **AI reply workspace** for drafting and refining customer responses
- **Conversation inbox** for reviewing support activity and customer context
- **Nexa product demo** with the core interaction patterns and visual language
- **Responsive editorial UI** with motion, layered product surfaces, and accessible controls
- **Server-side data layer** prepared with TanStack Start, Drizzle, and Supabase integrations

## Tech stack

- React 19 and TypeScript
- TanStack Start and TanStack Router
- Vite
- Tailwind CSS 4
- Motion for interface animation
- Radix UI primitives and Lucide icons
- Drizzle ORM with PostgreSQL
- Supabase authentication and client integrations

## Getting started

### Requirements

- Node.js 20 or newer
- A package manager that supports the lockfile in this repository
- A Supabase project for authentication and workspace data

### Install

```bash
npm install
```

Create a `.env` file in the project root for server-side features. Keep credentials out of source control.

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
LOVABLE_API_KEY=your-lovable-api-key
```

For browser-side Supabase access, the client also accepts `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Never expose the service role key in a `VITE_` variable or commit it to the repository.

### Run locally

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

### Production preview

Build the application and preview the generated output locally:

```bash
npm run build
npm run preview
```

## Commands

| Command             | Purpose                              |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the development server         |
| `npm run build`     | Create a production build            |
| `npm run build:dev` | Build using the development mode     |
| `npm run preview`   | Preview the production build locally |
| `npm run lint`      | Check the codebase with ESLint       |
| `npm run format`    | Format files with Prettier           |

## Project structure

```text
src/
├── components/       Reusable UI and Nexa product surfaces
├── integrations/     Supabase client and auth helpers
├── lib/              Server functions, data access, and utilities
├── routes/           TanStack Router route definitions
├── router.tsx        Router configuration
└── styles.css        Global styles and design tokens

drizzle/              Database schema and migrations
public/               Static assets
supabase/             Local Supabase configuration
```

## Product and design brief

Nexa is positioned as an AI customer-support workspace for teams that want to turn conversations into faster resolutions, stronger relationships, and revenue. The primary experience is a single intelligent inbox where AI can understand intent, suggest or send a response, surface customer context, and leave people in control of the final interaction.

The visual direction is calm, editorial, and product-led rather than a generic SaaS dashboard:

- Warm neutral surfaces with restrained lavender accents for actions and AI states
- Large, confident typography and generous whitespace
- Layered product compositions that show the inbox, conversation, and customer context together
- Subtle entrance, typing, pulse, and scroll transitions that communicate state
- Responsive layouts that preserve clarity on smaller screens

The product language should feel premium and focused. Avoid repetitive feature grids, decorative gradients, and motion that distracts from the conversation.

## Development notes

- Keep product-facing copy concise and action-oriented.
- Prefer existing UI primitives in `src/components/ui` before introducing new patterns.
- Keep database changes in Drizzle migrations.
- Run `npm run lint` and `npm run build` before opening a pull request.

## License

This project is private and intended for internal development.
