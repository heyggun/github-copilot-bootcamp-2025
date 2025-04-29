import { useState, useEffect } from 'react';
import { getPosts } from './services/api';
import NewPostForm from './components/NewPostForm';
import PostCard from './components/PostCard';

function App() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await getPosts();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserNameSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('userName', userName);
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Simple SNS
          </h1>
          {!userName ? (
            <form onSubmit={handleUserNameSubmit} className="max-w-sm mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="사용자 이름을 입력하세요"
                  className="w-full px-4 py-3 pr-24 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity duration-200"
                >
                  시작하기
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-3 bg-white p-4 rounded-xl shadow-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {userName[0].toUpperCase()}
              </div>
              <p className="text-gray-700 font-medium">안녕하세요, {userName}님!</p>
              <button
                onClick={() => {
                  setUserName('');
                  localStorage.removeItem('userName');
                }}
                className="ml-2 text-sm text-red-500 hover:text-red-600 transition-colors duration-200"
              >
                로그아웃
              </button>
            </div>
          )}
        </header>

        {/* 새 포스트 작성 폼 */}
        {userName && <NewPostForm onPostCreated={handlePostCreated} />}

        {/* 포스트 목록 */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-r-transparent"></div>
              <p className="mt-4 text-gray-500">포스트를 불러오는 중...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">아직 포스트가 없습니다.</p>
              {userName && (
                <p className="text-gray-400 mt-2">첫 번째 포스트를 작성해보세요!</p>
              )}
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                userName={userName}
                onPostUpdated={loadPosts}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App