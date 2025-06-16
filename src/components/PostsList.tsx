
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { FilterType } from './BlogContent';
import { fetchPosts, Post } from '../services/api';
import PostCard from './PostCard';

interface PostsListProps {
  filter: FilterType;
}

const PostsList: React.FC<PostsListProps> = ({ filter }) => {
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  const { data: posts, isLoading, error, refetch } = useQuery({
    queryKey: ['posts', filter, page],
    queryFn: () => fetchPosts(filter, page),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Reset posts and page when filter changes
  useEffect(() => {
    console.log(`Filter changed to: ${filter}, resetting posts and page`);
    setPage(1);
    setAllPosts([]);
  }, [filter]);

  // Handle posts data updates
  useEffect(() => {
    if (posts) {
      console.log(`Received ${posts.length} posts for page ${page}, filter ${filter}`);
      if (page === 1) {
        // First page or filter change - replace all posts
        setAllPosts(posts);
      } else {
        // Additional pages - append to existing posts
        setAllPosts(prev => {
          const existingIds = new Set(prev.map(post => post.id));
          const newPosts = posts.filter(post => !existingIds.has(post.id));
          return [...prev, ...newPosts];
        });
      }
    }
  }, [posts, page, filter]);

  const loadMore = () => {
    console.log(`Loading more posts, current page: ${page}`);
    setPage(prev => prev + 1);
  };

  if (isLoading && page === 1) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando posts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400">Erro ao carregar posts. Tente novamente.</p>
      </div>
    );
  }

  const hasMorePosts = posts && posts.length === 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
        {filter === 'recent' ? (
          <Calendar className="w-4 h-4" />
        ) : (
          <TrendingUp className="w-4 h-4" />
        )}
        <span>
          {filter === 'recent' ? 'Posts mais recentes' : 'Posts mais populares'}
        </span>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allPosts.map((post, index) => (
          <PostCard key={`${post.id}-${index}`} post={post} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMorePosts && (
        <div className="pt-6">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            {isLoading ? 'Carregando...' : 'Carregar mais posts'}
          </button>
        </div>
      )}

      {!hasMorePosts && allPosts.length > 0 && (
        <div className="text-center py-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Todos os posts foram carregados
          </p>
        </div>
      )}
    </div>
  );
};

export default PostsList;
