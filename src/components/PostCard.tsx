
import React from 'react';
import { Calendar, TrendingUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../services/api';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleClick = () => {
    navigate(`/post/${post.slug}`);
  };

  // Check if post was updated after publication
  const wasUpdated = new Date(post.updated_at) > new Date(post.published_at);

  return (
    <article 
      onClick={handleClick}
      className="group p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {post.title}
        </h2>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            {wasUpdated ? (
              <>
                <Clock className="w-3.5 h-3.5" />
                <time dateTime={post.updated_at}>
                  Atualizado em {formatDate(post.updated_at)}
                </time>
              </>
            ) : (
              <>
                <Calendar className="w-3.5 h-3.5" />
                <time dateTime={post.published_at}>
                  Publicado em {formatDate(post.published_at)}
                </time>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
            {post.tabcoins > 6 && <TrendingUp className="w-3.5 h-3.5" />}
            <span className="font-medium">{post.tabcoins} tabcoins</span>
          </div>
          
          {post.children_deep_count > 0 && (
            <span className="text-gray-500 dark:text-gray-400">
              {post.children_deep_count} comentário{post.children_deep_count !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default PostCard;
