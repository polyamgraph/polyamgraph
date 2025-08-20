# PolyamGraph

A social visualization tool for polycules - helping polyamorous individuals map and understand their relationship networks.

## Features

- **Network Visualization**: Interactive graph showing relationship connections
- **Privacy Controls**: Configurable privacy settings (public, friends, private)
- **Connection Management**: Send and manage connection requests
- **Profile Management**: Customizable user profiles with avatars and bios
- **Relationship Types**: Support for different relationship types (partner, friend, meta, other)

## Self-Hosting Setup

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd polyamgraph
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to find your project URL and anon key
3. Copy the database schema from `supabase/migrations/` to set up your tables

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_APP_NAME=PolyamGraph
   ```

### 4. Set Up Database Schema

Run the migration file in your Supabase SQL editor:

```sql
-- Copy and paste the contents of supabase/migrations/20250820194726_5c07d8d6-7a4a-4422-8e50-e9a53ff08dce.sql
-- This will create the necessary tables, policies, and functions
```

### 5. Configure Supabase Authentication

In your Supabase dashboard:

1. Go to Authentication > Settings
2. Enable email authentication
3. Configure any additional auth providers you want (Google, GitHub, etc.)
4. Set up email templates if desired

### 6. Run the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm run preview
```

The application will be available at `http://localhost:8080`

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_NAME`
3. Deploy

### Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy

### Docker (Optional)

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 8080
CMD ["npm", "run", "preview"]
```

## Configuration

### Privacy Settings

Users can set their profile visibility to:
- **Public**: Visible to everyone
- **Friends**: Visible to connected users only
- **Private**: Visible to user only

### Relationship Types

The application supports these relationship types:
- **Partner**: Romantic/sexual relationships
- **Friend**: Platonic friendships
- **Meta**: Metamours (partner's partners)
- **Other**: Custom relationship types

## Development

### Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── lib/               # Utility functions
└── pages/             # Page components

supabase/
├── config.toml        # Supabase configuration
└── migrations/        # Database migrations
```

### Key Technologies

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, Radix UI, Shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Visualization**: React Flow (@xyflow/react)
- **State Management**: React Query (@tanstack/react-query)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license here]

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review Supabase docs for database-related questions
