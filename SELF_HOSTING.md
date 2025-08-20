# Self-Hosting Guide for PolyamGraph

This guide provides detailed instructions for self-hosting PolyamGraph with your own Supabase instance.

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd polyamgraph
   npm install
   ```

2. **Set up Supabase Project**
   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and anon key

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Set up Database**
   - Run the migration SQL in your Supabase dashboard
   - Configure authentication settings

5. **Run Application**
   ```bash
   npm run dev
   ```

## Detailed Setup Instructions

### 1. Supabase Project Setup

#### Create Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose organization and enter project details
4. Select a region close to your users
5. Set a strong database password
6. Wait for project to be created (2-3 minutes)

#### Get Project Credentials
1. Go to Settings > API
2. Copy your project URL (looks like `https://xxxxx.supabase.co`)
3. Copy your anon/public key (starts with `eyJ...`)

### 2. Database Schema Setup

#### Option A: Using Supabase Dashboard
1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/migrations/20250820194726_5c07d8d6-7a4a-4422-8e50-e9a53ff08dce.sql`
3. Paste and run the SQL

#### Option B: Using Supabase CLI (Advanced)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Push migrations
supabase db push
```

### 3. Authentication Configuration

#### Email Authentication
1. Go to Authentication > Settings in Supabase dashboard
2. Ensure "Enable email confirmations" is configured as desired
3. Set up email templates under Authentication > Templates

#### OAuth Providers (Optional)
1. Go to Authentication > Providers
2. Enable desired providers (Google, GitHub, etc.)
3. Configure OAuth credentials for each provider

#### Site URL Configuration
1. Go to Authentication > URL Configuration
2. Add your domain(s) to "Site URL"
3. Add redirect URLs for production deployment

### 4. Environment Configuration

Create `.env` file with your credentials:

```env
# Required: Your Supabase project details
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: Customize app name
VITE_APP_NAME=PolyamGraph
```

**Security Note**: Never commit your `.env` file to version control. The `.gitignore` file already excludes it.

### 5. Row Level Security (RLS) Policies

The migration automatically sets up RLS policies, but here's what they do:

#### Profiles Table
- Users can view public profiles
- Users can view friends' profiles if connected
- Users can only edit their own profile

#### Connections Table
- Users can only see connections they're part of
- Users can create connection requests
- Users can update connections they're involved in
- Users can delete their own connection requests

### 6. Testing Your Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:8080`

3. Test user registration and login

4. Verify profile creation and connection features

## Deployment Options

### Vercel (Recommended)

1. **Connect Repository**
   - Connect your GitHub repo to Vercel
   - Import the project

2. **Environment Variables**
   Add these in Vercel dashboard:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_APP_NAME=PolyamGraph
   ```

3. **Deploy**
   - Vercel will automatically build and deploy
   - Update Supabase auth settings with your new domain

### Netlify

1. **Connect Repository**
   - Connect your GitHub repo to Netlify

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   Add the same environment variables as above

4. **Deploy**
   - Netlify will build and deploy automatically

### Docker Deployment

1. **Build Image**
   ```bash
   docker build -t polyamgraph .
   ```

2. **Run Container**
   ```bash
   docker run -p 80:80 \
     -e VITE_SUPABASE_URL=https://your-project-ref.supabase.co \
     -e VITE_SUPABASE_ANON_KEY=your-supabase-anon-key \
     polyamgraph
   ```

3. **Using Docker Compose**
   ```bash
   # Edit .env with your credentials
   docker-compose up -d
   ```

### VPS/Server Deployment

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Serve Static Files**
   Use nginx, Apache, or any static file server to serve the `dist` directory

3. **Example Nginx Config**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/polyamgraph/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

## Security Considerations

### Environment Variables
- Never expose your Supabase service role key in frontend code
- Use only the anon/public key in the frontend
- Keep your database password secure

### Supabase Security
- Review and understand RLS policies
- Enable email confirmations for production
- Set up proper CORS origins
- Monitor authentication logs

### HTTPS
- Always use HTTPS in production
- Update Supabase auth settings with HTTPS URLs
- Consider using a CDN for better performance

## Troubleshooting

### Common Issues

#### "Missing environment variables" error
- Ensure `.env` file exists and contains required variables
- Restart development server after adding environment variables
- Check variable names match exactly (including `VITE_` prefix)

#### Authentication not working
- Verify Supabase project URL and anon key are correct
- Check Site URL configuration in Supabase dashboard
- Ensure email confirmations are configured properly

#### Database connection errors
- Verify your Supabase project is active
- Check if database migrations were applied correctly
- Review RLS policies in Supabase dashboard

#### Build failures
- Ensure all environment variables are set in deployment platform
- Check Node.js version compatibility
- Verify all dependencies are installed

### Getting Help

1. Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
2. Review application logs in your deployment platform
3. Check browser console for frontend errors
4. Create an issue on the project repository

## Maintenance

### Regular Tasks
- Monitor Supabase usage and billing
- Keep dependencies updated
- Review authentication logs
- Backup your database regularly

### Updates
- Pull latest changes from the repository
- Review migration files for database changes
- Test in development before deploying to production
- Update environment variables if needed

## Performance Optimization

### Database
- Monitor query performance in Supabase dashboard
- Add indexes for frequently queried columns
- Consider database connection pooling for high traffic

### Frontend
- Enable gzip compression (included in nginx config)
- Use a CDN for static assets
- Monitor Core Web Vitals
- Consider implementing service workers for offline support

### Supabase
- Monitor API usage and rate limits
- Optimize RLS policies for performance
- Use Supabase Edge Functions for complex operations
- Consider upgrading to Pro plan for production use