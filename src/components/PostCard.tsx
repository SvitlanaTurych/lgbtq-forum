import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Heart, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Post, Comment } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, onDelete }: PostCardProps) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(post.comments);
  const [showComments, setShowComments] = useState(false);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      content: comment,
      author: user,
      createdAt: new Date()
    };

    setComments([...comments, newComment]);
    post.comments = [...comments, newComment];
    localStorage.setItem('forum_posts', JSON.stringify(
      JSON.parse(localStorage.getItem('forum_posts') || '[]').map((p: Post) => 
        p.id === post.id ? { ...p, comments: [...comments, newComment] } : p
      )
    ));
    setComment('');
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post.id);
    }
  };

  return (
    <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={post.author.avatar || 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=32&h=32'}
              alt={post.author.username}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-900">{post.author.username}</p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          {user && user.id === post.author.id && (
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 transition"
              title="Delete post"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {post.title}
        </h2>
        <p className="text-gray-600 mb-4">
          {post.content}
        </p>

        <div className="flex items-center space-x-4 text-gray-500 mb-4">
          <button className="flex items-center space-x-1 hover:text-purple-600 transition">
            <Heart className="h-5 w-5" />
            <span>42</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 hover:text-purple-600 transition"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{comments.length} comments</span>
          </button>
        </div>

        {showComments && (
          <div className="space-y-4">
            {user && (
              <form onSubmit={handleAddComment} className="space-y-2">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  rows={2}
                />
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Comment
                </button>
              </form>
            )}

            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3 border-l-2 border-gray-200 pl-4">
                  <img
                    src={comment.author.avatar || 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=32&h=32'}
                    alt={comment.author.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">{comment.author.username}</p>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-600">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}