import React, { useState, useEffect } from 'react';
import { CreatePostForm } from '../components/CreatePostForm';
import { PostCard } from '../components/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { Post } from '../types';

export function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    // Load posts from localStorage on component mount
    const savedPosts = localStorage.getItem('forum_posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
  }, []);

  const handleCreatePost = (title: string, content: string) => {
    if (!user) return;

    const newPost: Post = {
      id: Date.now().toString(),
      title,
      content,
      author: user,
      createdAt: new Date(),
      comments: []
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('forum_posts', JSON.stringify(updatedPosts));
  };

  const handleDeletePost = (postId: string) => {
    const updatedPosts = posts.filter(post => post.id !== postId);
    setPosts(updatedPosts);
    localStorage.setItem('forum_posts', JSON.stringify(updatedPosts));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {user && <CreatePostForm onSubmit={handleCreatePost} />}
        
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onDelete={handleDeletePost}
            />
          ))}
          
          {posts.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl text-gray-600">No posts yet</h3>
              {user ? (
                <p className="text-gray-500">Be the first to share something!</p>
              ) : (
                <p className="text-gray-500">Login to start sharing your thoughts</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}