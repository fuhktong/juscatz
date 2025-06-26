-- Sample Data for JusCatz Database
-- Run this after creating the database schema

USE juscatz;

-- Insert test users
INSERT INTO users (
    username, 
    email, 
    password_hash, 
    first_name, 
    last_name, 
    bio,
    is_verified,
    email_verified
) VALUES 
(
    'admin',
    'admin@juscatz.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'Admin',
    'User',
    'Official JusCatz admin account 🐱👑',
    TRUE,
    TRUE
),
(
    'testuser',
    'test@example.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'Test',
    'User',
    'Just a test user for development purposes 🐱',
    FALSE,
    TRUE
),
(
    'catmom2024',
    'catmom@example.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'Sarah',
    'Johnson',
    'Proud cat mom of 3 adorable felines 😻 #CatLife #Rescue',
    FALSE,
    TRUE
),
(
    'whiskers_photographer',
    'photographer@example.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'Mike',
    'Chen',
    'Professional pet photographer 📸 Capturing your feline friends since 2019',
    TRUE,
    TRUE
);

-- Insert sample hashtags
INSERT INTO hashtags (name, usage_count) VALUES 
('#catsofinstagram', 150),
('#cute', 200),
('#kitten', 120),
('#catstagram', 180),
('#meow', 90),
('#catlife', 160),
('#fluffy', 85),
('#rescue', 70),
('#tabby', 65),
('#persian', 45);

-- Insert sample posts
INSERT INTO posts (
    user_id, 
    caption, 
    image_url, 
    hashtags,
    like_count,
    comment_count,
    view_count,
    visibility,
    is_ai_verified,
    ai_confidence_score
) VALUES 
(
    2, -- testuser
    'Look at this adorable little furball! Just adopted from the local shelter 😍',
    'https://example.com/images/cute-kitten-1.jpg',
    JSON_ARRAY('#rescue', '#cute', '#kitten'),
    25,
    5,
    150,
    'public',
    TRUE,
    0.95
),
(
    3, -- catmom2024
    'My three babies enjoying their afternoon nap together 💤',
    'https://example.com/images/three-cats-sleeping.jpg',
    JSON_ARRAY('#catlife', '#naptime', '#cute'),
    42,
    8,
    230,
    'public',
    TRUE,
    0.88
),
(
    4, -- whiskers_photographer
    'Professional pet portrait session. This beautiful Persian stole the show! 📸',
    'https://example.com/images/persian-portrait.jpg',
    JSON_ARRAY('#persian', '#photography', '#professional'),
    78,
    12,
    450,
    'public',
    TRUE,
    0.92
),
(
    1, -- admin
    'Welcome to JusCatz! Share your amazing cat photos with our community 🎉',
    'https://example.com/images/welcome-banner.jpg',
    JSON_ARRAY('#welcome', '#community', '#juscatz'),
    156,
    25,
    1200,
    'public',
    TRUE,
    0.99
);

-- Insert sample likes
INSERT INTO likes (user_id, post_id) VALUES 
(1, 2), (1, 3), (1, 4),
(2, 1), (2, 3), (2, 4),
(3, 1), (3, 2), (3, 4),
(4, 1), (4, 2), (4, 3);

-- Insert sample comments
INSERT INTO comments (user_id, post_id, content) VALUES 
(3, 1, 'So adorable! Welcome to the cat parent club! 🐱'),
(4, 1, 'Beautiful shot! The lighting is perfect.'),
(1, 2, 'Three cats = three times the love! ❤️'),
(2, 3, 'Wow, that\'s a stunning portrait! Professional quality 👏'),
(1, 4, 'Thank you all for joining our community!');

-- Insert sample follows
INSERT INTO follows (follower_id, following_id, status) VALUES 
(2, 1, 'accepted'), -- testuser follows admin
(2, 3, 'accepted'), -- testuser follows catmom2024
(2, 4, 'accepted'), -- testuser follows whiskers_photographer
(3, 1, 'accepted'), -- catmom2024 follows admin
(3, 4, 'accepted'), -- catmom2024 follows whiskers_photographer
(4, 1, 'accepted'), -- whiskers_photographer follows admin
(1, 2, 'accepted'), -- admin follows testuser
(1, 3, 'accepted'), -- admin follows catmom2024
(1, 4, 'accepted'); -- admin follows whiskers_photographer

-- Update user counts
UPDATE users SET 
    follower_count = (SELECT COUNT(*) FROM follows WHERE following_id = users.id AND status = 'accepted'),
    following_count = (SELECT COUNT(*) FROM follows WHERE follower_id = users.id AND status = 'accepted'),
    post_count = (SELECT COUNT(*) FROM posts WHERE user_id = users.id AND is_deleted = FALSE);

-- Insert sample notifications
INSERT INTO notifications (user_id, type, title, message, related_user_id, related_post_id, is_read) VALUES 
(2, 'like', 'New like on your post', 'catmom2024 liked your post', 3, 1, FALSE),
(2, 'comment', 'New comment on your post', 'catmom2024 commented on your post', 3, 1, FALSE),
(3, 'follow', 'New follower', 'testuser started following you', 2, NULL, FALSE),
(4, 'like', 'New like on your post', 'admin liked your post', 1, 3, TRUE);