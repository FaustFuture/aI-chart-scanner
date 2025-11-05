# Supabase Database Setup

This directory contains SQL migration files to set up the database schema for the trade setup knowledge base.

## Prerequisites

1. Create a Supabase project at https://supabase.com
2. Get your project URL and API keys from the Supabase dashboard
3. Enable the pgvector extension in your Supabase project

## Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Running Migrations

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run each migration file in order:
   - `001_enable_vector_extension.sql`
   - `002_create_trade_setups_table.sql`
   - `003_create_knowledge_table.sql`
   - `004_create_indexes.sql`

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

## Database Schema

### trade_setups Table

Stores structured trade setup data with analysis:

- `id`: UUID primary key
- `company_id`: Whop company ID
- `user_id`: Whop user ID
- `analysis`: Full markdown analysis text
- `trade_setup`: JSONB with structured trade setup data
- `quality_score`: Numeric quality score (1-10)
- `direction`: Trade direction (BUY/SELL/NO SETUP AVAILABLE)
- `image_url`: Optional image URL
- `created_at`: Timestamp
- `updated_at`: Timestamp

### knowledge Table

Stores vector embeddings for semantic search:

- `id`: UUID primary key
- `trade_setup_id`: Foreign key to trade_setups
- `company_id`: Whop company ID
- `content`: Combined text for embedding
- `embedding`: Vector embedding (1536 dimensions)
- `metadata`: JSONB with additional context
- `created_at`: Timestamp

## Vector Index

After inserting data into the `knowledge` table, you can create the vector index for faster similarity searches:

```sql
CREATE INDEX idx_knowledge_embedding ON knowledge 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);
```

Note: It's recommended to create this index after some data has been inserted for optimal performance.

## Verification

After running migrations, verify the tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('trade_setups', 'knowledge');
```

