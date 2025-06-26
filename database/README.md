# JusCatz Database Setup

## Quick Setup for phpMyAdmin

### Step 1: Create the Database
1. Open phpMyAdmin in your browser
2. Click "SQL" tab at the top
3. Copy and paste the contents of `create_database.sql`
4. Click "Go" to execute

### Step 2: Create the Tables
1. Select the `juscatz` database from the left sidebar
2. Click "SQL" tab
3. Copy and paste the contents of `schema_mysql.sql`
4. Click "Go" to execute

### Step 3: Add Sample Data (Optional)
1. Still in the `juscatz` database
2. Click "SQL" tab
3. Copy and paste the contents of `sample_data.sql`
4. Click "Go" to execute

## Test Accounts

After running the sample data, you can login with:

- **Admin Account:**
  - Email: `admin@juscatz.com`
  - Password: `password`

- **Test User:**
  - Email: `test@example.com`
  - Password: `password`

- **Cat Mom:**
  - Email: `catmom@example.com`
  - Password: `password`

- **Photographer:**
  - Email: `photographer@example.com`
  - Password: `password`

## Database Structure

### Core Tables
- `users` - User accounts and profiles
- `posts` - Cat photos and posts
- `comments` - Comments on posts
- `likes` - Post likes
- `follows` - User following relationships

### Support Tables
- `hashtags` - Hashtag management
- `post_hashtags` - Post-hashtag relationships
- `user_blocks` - Blocked users
- `reports` - User/content reports
- `notifications` - User notifications
- `stories` - Temporary posts
- `user_sessions` - Authentication sessions
- `password_reset_tokens` - Password reset functionality
- `email_verification_tokens` - Email verification

## Database Configuration

### For Local Development
- Database Name: `juscatz`
- Default encoding: `utf8mb4_unicode_ci`
- Default port: `3306`

### Connection Details
Update your API configuration with:
```javascript
const dbConfig = {
    host: 'localhost',
    database: 'juscatz',
    username: 'your_username',
    password: 'your_password'
};
```

## Migration Files

The `migrations/` folder contains individual migration files for step-by-step database setup:

1. `001_create_users_table.sql`
2. `002_create_posts_table.sql`
3. `003_create_social_tables.sql`
4. `004_create_hashtags_and_support_tables.sql`
5. `005_create_stories_tables.sql`

## Next Steps

1. ✅ Create database and tables
2. ⏳ Set up backend API server (Node.js, PHP, etc.)
3. ⏳ Connect frontend to real API endpoints
4. ⏳ Implement file upload for images
5. ⏳ Add AI cat detection integration

## Troubleshooting

### Common Issues
- **UUID() function not found**: Use a different approach for generating UUIDs or remove the DEFAULT constraint
- **JSON column type not supported**: Use TEXT columns for older MySQL versions
- **Foreign key constraints fail**: Check that referenced tables exist and are created in order

### Compatibility
- Requires MySQL 5.7+ for JSON support
- Tested with phpMyAdmin 5.0+
- Compatible with MariaDB 10.2+