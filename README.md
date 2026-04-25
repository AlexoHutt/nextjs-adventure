# Next.js Adventure

A browser-based choose-your-own-adventure game engine with a built-in visual story editor. Players navigate branching narratives by making choices; authors build and edit the story graph through a drag-and-drop admin interface — no code required.

## Features

- **Game view** — read scenes, make choices, track inventory/stats/flags, restart anytime
- **Visual editor** — drag-and-drop graph canvas to create scenes, write text, connect choices, and reposition nodes
- **Persistent storage** — SQLite database with auto-migration and seed data on first run
- **Extensible** — choice conditions and effects support stat-based branching and inventory mechanics

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Graph editor | XYFlow (React Flow) 12 |
| State | Zustand 5 |
| Database | SQLite via better-sqlite3 |
| ORM | Drizzle ORM + Drizzle Kit |
| Language | TypeScript 5 |

## Getting Started

```bash
npm install
npm run dev
```

- **Game:** http://localhost:3000
- **Editor:** http://localhost:3000/admin

The database is created automatically on first run and seeded with a sample fantasy adventure.

## Project Structure

```
app/
  page.tsx              # Game page (server component, fetches scenes)
  admin/page.tsx        # Admin editor page
  api/
    scenes/route.ts     # GET all scenes, PATCH save all scenes
    positions/route.ts  # PATCH save node position
components/
  GameClient.tsx        # Game UI — renders current scene and choices
  AdminPage.tsx         # ReactFlow canvas editor
  AdminSceneNode.tsx    # Editable node card (title, text, choices)
stores/
  game.ts               # Player state (current scene, inventory, stats, flags, history)
  admin.ts              # Editor state (scenes, positions, CRUD operations)
hooks/
  useAdminGraph.ts      # BFS layout algorithm, builds nodes/edges for ReactFlow
lib/db/
  index.ts              # DB connection, auto-migration on init
  schema.ts             # Drizzle schema (scenes, nodePositions, users)
  seed.ts               # Seeds DB from data/scenes.json if empty
  migrations/           # Drizzle migration history
data/
  scenes.json           # Initial story content
```

## Data Model

**Scene**
```ts
{
  id: string            // unique slug, e.g. "crossroads"
  title: string
  text: string          // narrative prose shown to the player
  choices: Choice[]
}
```

**Choice**
```ts
{
  text: string          // button label
  nextScene: string     // target scene id
  condition?: () => boolean   // hide/show choice conditionally
  effect?: () => void         // run on selection (modify stats, inventory, flags)
}
```

Scenes and node positions are stored in SQLite. The editor saves layout separately so story data stays clean.

## API Routes

| Method | Path | Description |
|---|---|---|
| GET | `/api/scenes` | Fetch all scenes and node positions |
| PATCH | `/api/scenes` | Save (upsert) all scenes, delete removed ones |
| PATCH | `/api/positions` | Update a single node's canvas position |

## Editor Usage

1. Navigate to `/admin`
2. **Edit a scene** — click the title or text area on any node and type
3. **Add a choice** — click `+ Add Choice` on a node
4. **Connect a choice to a scene** — drag from the choice's right handle to another node's left handle
5. **Add a scene** — click `Add Scene` in the top bar
6. **Reposition nodes** — drag any node by its header
7. **Save** — click `Save` to persist all changes to the database

## npm Scripts

```bash
npm run dev         # Start dev server
npm run build       # Production build
npm start           # Run production build
npm run db:push     # Apply schema migrations to SQLite
npm run db:studio   # Open Drizzle Studio (visual DB browser)
```

## Database

SQLite file is stored at `.data/scenes.sqlite`. WAL mode is enabled. Migrations run automatically on startup — no manual setup needed.

To browse the database visually:
```bash
npm run db:studio
```
