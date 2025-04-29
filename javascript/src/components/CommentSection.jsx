import { useState, useEffect } from 'react';
import { getComments, createComment } from '../services/api';
import Button from './Button';

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const data = await getComments(postId);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const userName = localStorage.getItem('userName');
      const comment = await createComment(postId, {
        userName,
        content: newComment.trim()
      });
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">댓글</h3>
      
      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows="2"
          required
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} variant="secondary">
            {isSubmitting ? '게시 중...' : '댓글 작성'}
          </Button>
        </div>
      </form>

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-center text-gray-500">댓글을 불러오는 중...</p>
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-500">아직 댓글이 없습니다.</p>
        ) : (
          comments.map(comment => (
            <div
              key={comment.id}
              className="p-4 bg-gray-50 rounded-lg space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">{comment.userName}</span>
                <span className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-600">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;