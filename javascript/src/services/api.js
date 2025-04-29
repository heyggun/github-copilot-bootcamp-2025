const API_BASE_URL = 'http://localhost:8000/api';

// Posts
export const getPosts = async () => {
  const response = await fetch(`${API_BASE_URL}/posts`);
  if (!response.ok) throw new Error('Failed to fetch posts');
  return response.json();
};

export const createPost = async (postData) => {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  });
  if (!response.ok) throw new Error('Failed to create post');
  return response.json();
};

export const deletePost = async (postId) => {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete post');
  return null;
};

// Comments
export const getComments = async (postId) => {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
  if (!response.ok) throw new Error('Failed to fetch comments');
  return response.json();
};

export const createComment = async (postId, commentData) => {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(commentData),
  });
  if (!response.ok) throw new Error('Failed to create comment');
  return response.json();
};

// Likes
export const likePost = async (postId, userName) => {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/likes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName }),
  });
  if (!response.ok) throw new Error('Failed to like post');
  return null;
};

export const unlikePost = async (postId) => {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/likes`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to unlike post');
  return null;
};