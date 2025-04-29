import { useState } from 'react';
import CommentSection from './CommentSection';
import Button from './Button';
import { likePost, unlikePost } from '../services/api';

const PostCard = ({ post, userName, onPostDeleted }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);

  const handleLikeClick = async () => {
    if (!userName) return;
    
    try {
      if (isLiked) {
        await unlikePost(post.id);
        setLikeCount(prev => prev - 1);
      } else {
        await likePost(post.id, userName);
        setLikeCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Failed to handle like:', error);
    }
  };

  // 시간 형식 포매팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-200 hover:shadow-xl border border-gray-100">
      {/* 포스트 헤더 */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {post.userName[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{post.userName}</h2>
              <p className="text-sm text-gray-500">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* 포스트 내용 */}
        <div className="mb-6">
          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* 상호작용 버튼 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLikeClick}
              disabled={!userName}
              className={`flex items-center space-x-2 transition-colors duration-200 ${
                userName ? 'hover:text-blue-600' : 'cursor-not-allowed opacity-50'
              } ${isLiked ? 'text-blue-600' : 'text-gray-600'}`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span className="text-sm font-medium">{likeCount}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{post.commentCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 댓글 섹션 */}
      {showComments && (
        <div className="border-t border-gray-100 bg-gray-50 p-6">
          <CommentSection postId={post.id} />
        </div>
      )}
    </div>
  );
};

export default PostCard;