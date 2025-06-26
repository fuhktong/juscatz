// Posts API
// API methods for post management

class PostsAPI {
    constructor() {
        this.client = typeof APIClient !== 'undefined' ? APIClient : new (require('./client.js'))();
        this.endpoints = this.client.config.endpoints.posts;
    }
    
    // Create a new post
    async createPost(postData) {
        try {
            const response = await this.client.post(this.endpoints.create, {
                caption: postData.caption || '',
                image_url: postData.imageUrl,
                location: postData.location || null,
                latitude: postData.latitude || null,
                longitude: postData.longitude || null,
                hashtags: postData.hashtags || [],
                mentions: postData.mentions || [],
                visibility: postData.visibility || 'public'
            });
            
            return {
                success: true,
                data: response,
                message: 'Post created successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to create post',
                errors: error.data?.errors || null
            };
        }
    }
    
    // Get user's feed
    async getFeed(page = 1, limit = 20) {
        try {
            const response = await this.client.get(`${this.endpoints.feed}?page=${page}&limit=${limit}`);
            
            return {
                success: true,
                data: response.posts || [],
                pagination: response.pagination || {},
                message: 'Feed retrieved successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to load feed'
            };
        }
    }
    
    // Get trending posts
    async getTrendingPosts(page = 1, limit = 20) {
        try {
            const response = await this.client.get(`${this.endpoints.trending}?page=${page}&limit=${limit}`);
            
            return {
                success: true,
                data: response.posts || [],
                pagination: response.pagination || {},
                message: 'Trending posts retrieved successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to load trending posts'
            };
        }
    }
    
    // Get posts by user
    async getPostsByUser(userId, page = 1, limit = 20) {
        try {
            const response = await this.client.get(`${this.endpoints.byUser}/${userId}?page=${page}&limit=${limit}`);
            
            return {
                success: true,
                data: response.posts || [],
                pagination: response.pagination || {},
                message: 'User posts retrieved successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to load user posts'
            };
        }
    }
    
    // Get single post
    async getPost(postId) {
        try {
            const response = await this.client.get(`${this.endpoints.get}/${postId}`);
            
            return {
                success: true,
                data: response,
                message: 'Post retrieved successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to load post'
            };
        }
    }
    
    // Update post
    async updatePost(postId, updateData) {
        try {
            const response = await this.client.put(`${this.endpoints.update}/${postId}`, {
                caption: updateData.caption,
                location: updateData.location || null,
                hashtags: updateData.hashtags || [],
                mentions: updateData.mentions || [],
                visibility: updateData.visibility
            });
            
            return {
                success: true,
                data: response,
                message: 'Post updated successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to update post'
            };
        }
    }
    
    // Delete post
    async deletePost(postId) {
        try {
            await this.client.delete(`${this.endpoints.delete}/${postId}`);
            
            return {
                success: true,
                message: 'Post deleted successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to delete post'
            };
        }
    }
    
    // Like a post
    async likePost(postId) {
        try {
            const response = await this.client.post(`${this.endpoints.like}/${postId}`);
            
            return {
                success: true,
                data: response,
                message: 'Post liked successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to like post'
            };
        }
    }
    
    // Unlike a post
    async unlikePost(postId) {
        try {
            const response = await this.client.delete(`${this.endpoints.unlike}/${postId}`);
            
            return {
                success: true,
                data: response,
                message: 'Post unliked successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to unlike post'
            };
        }
    }
    
    // Search posts
    async searchPosts(query, filters = {}) {
        try {
            const params = new URLSearchParams({
                q: query,
                page: filters.page || 1,
                limit: filters.limit || 20,
                ...filters
            });
            
            const response = await this.client.get(`${this.endpoints.search}?${params}`);
            
            return {
                success: true,
                data: response.posts || [],
                pagination: response.pagination || {},
                message: 'Search completed successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Search failed'
            };
        }
    }
    
    // Upload post image
    async uploadImage(file) {
        try {
            const response = await this.client.upload('/upload/image', file);
            
            return {
                success: true,
                data: response,
                message: 'Image uploaded successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to upload image'
            };
        }
    }
}

// Create global instance
const postsAPI = new PostsAPI();

// Export for use in other files
if (typeof window !== 'undefined') {
    window.PostsAPI = postsAPI;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PostsAPI;
}