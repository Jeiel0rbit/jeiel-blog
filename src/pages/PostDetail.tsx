import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, TrendingUp, MessageCircle, Share } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { fetchPostDetail } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import { useToast } from '../components/ui/use-toast';
import { useTheme } from '../contexts/ThemeContext';

const PostDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDark } = useTheme();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post-detail', slug],
    queryFn: () => fetchPostDetail(slug!),
    enabled: !!slug,
    retry: 2,
  });

  // Handle errors with useEffect instead of onError callback
  useEffect(() => {
    if (error) {
      console.error('Erro ao carregar post:', error);
      toast({
        title: "Erro ao carregar post",
        description: "Não foi possível carregar as informações do post. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: post?.title || 'Post do TabNews',
      text: `Confira este post: ${post?.title}`,
      url: window.location.href
    };

    // Detecta se é mobile/tablet ou desktop
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile && navigator.share) {
      // Para mobile: usa share intent nativo
      try {
        await navigator.share(shareData);
        console.log('Post compartilhado com sucesso via share intent');
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Erro ao compartilhar:', error);
          toast({
            title: "Erro ao compartilhar",
            description: "Não foi possível abrir o menu de compartilhamento.",
            variant: "destructive",
          });
        }
      }
    } else {
      // Para desktop: copia para área de transferência
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast({
        title: "Link copiado!",
        description: "O link do post foi copiado para a área de transferência.",
      });
    }).catch(() => {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link. Tente novamente.",
        variant: "destructive",
      });
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando post...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="p-6 text-center">
              <p className="text-red-500 dark:text-red-400 mb-4">
                {error ? 'Erro ao carregar o post. Verifique sua conexão e tente novamente.' : 'Post não encontrado.'}
              </p>
              <Button 
                onClick={() => navigate('/')} 
                variant="outline"
              >
                Voltar ao início
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para posts
        </Button>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight flex-1">
                {post.title}
              </h1>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Compartilhar post</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.published_at}>
                  {formatDate(post.published_at)}
                </time>
              </div>
              
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                {post.tabcoins > 7 && <TrendingUp className="w-4 h-4" />}
                <span className="font-medium">{post.tabcoins} tabcoins</span>
              </div>
              
              {post.children_deep_count > 0 && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.children_deep_count} comentário{post.children_deep_count !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-4 sm:px-6">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({...props}) => <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 mt-6 sm:mt-10" {...props} />,
                  h2: ({...props}) => <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8" {...props} />,
                  h3: ({...props}) => <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 mt-4 sm:mt-6" {...props} />,
                  p: ({...props}) => <p className="mb-4 text-sm sm:text-base leading-relaxed" {...props} />,
                  a: ({...props}) => (
                    <a 
                      className="text-blue-600 dark:text-blue-400 hover:underline break-words" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      {...props} 
                    />
                  ),
                  code: ({className, children, ...props}) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    
                    if (language) {
                      return (
                        <SyntaxHighlighter
                          style={isDark ? tomorrow : prism}
                          language={language}
                          PreTag="div"
                          className="rounded-lg text-sm overflow-x-auto"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      );
                    }
                    
                    return (
                      <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs sm:text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                  ul: ({...props}) => <ul className="list-disc pl-4 sm:pl-6 mb-4 space-y-1" {...props} />,
                  ol: ({...props}) => <ol className="list-decimal pl-4 sm:pl-6 mb-4 space-y-1" {...props} />,
                  li: ({...props}) => <li className="mb-1 text-sm sm:text-base" {...props} />,
                  img: ({...props}) => <img className="max-w-full h-auto rounded-lg my-4" {...props} />,
                  blockquote: ({...props}) => (
                    <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 my-4 italic bg-gray-50 dark:bg-gray-800/50 rounded-r" {...props} />
                  ),
                }}
              >
                {post.body || 'Conteúdo não disponível.'}
              </ReactMarkdown>
            </div>
            
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-800">
              <a
                href={`https://www.tabnews.com.br/${post.owner_username}/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors text-sm sm:text-base"
              >
                Ver post original no TabNews
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostDetail;
