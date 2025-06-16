
export interface Post {
  id: string;
  owner_id: string;
  parent_id: string | null;
  slug: string;
  title: string;
  status: string;
  type: string;
  source_url: string | null;
  created_at: string;
  updated_at: string;
  published_at: string;
  deleted_at: string | null;
  owner_username: string;
  tabcoins: number;
  tabcoins_credit: number;
  tabcoins_debit: number;
  children_deep_count: number;
  body?: string;
}

// Input validation utilities
const validateSlug = (slug: string): boolean => {
  if (!slug || typeof slug !== 'string') return false;
  // Allow only alphanumeric characters, hyphens, and underscores
  const slugRegex = /^[a-zA-Z0-9\-_]+$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 200;
};

const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  // Remove potentially dangerous characters
  return input.replace(/[<>'"&]/g, '');
};

const validatePost = (post: any): post is Post => {
  return (
    typeof post === 'object' &&
    post !== null &&
    typeof post.id === 'string' &&
    typeof post.title === 'string' &&
    typeof post.slug === 'string' &&
    typeof post.owner_username === 'string' &&
    typeof post.tabcoins === 'number' &&
    typeof post.published_at === 'string'
  );
};

// Enhanced rate limiting implementation
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 10;
  private readonly timeWindow = 60000; // 1 minute
  private blockedUntil: number = 0;

  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Check if still blocked
    if (now < this.blockedUntil) {
      const remainingTime = Math.ceil((this.blockedUntil - now) / 1000);
      console.warn(`Rate limit exceeded. Blocked for ${remainingTime} more seconds.`);
      return false;
    }
    
    // Remove old requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      // Block for 5 minutes on rate limit exceeded
      this.blockedUntil = now + 300000;
      console.warn('Rate limit exceeded. Blocked for 5 minutes.');
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    return Math.max(0, this.maxRequests - this.requests.length);
  }
}

const rateLimiter = new RateLimiter();

const makeSecureRequest = async (url: string): Promise<Response> => {
  if (!rateLimiter.canMakeRequest()) {
    throw new Error(`Rate limit exceeded. ${rateLimiter.getRemainingRequests()} requests remaining.`);
  }

  // Validate URL
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'https:') {
      throw new Error('Only HTTPS URLs are allowed');
    }
    if (!urlObj.hostname.includes('tabnews.com.br')) {
      throw new Error('Only TabNews API URLs are allowed');
    }
  } catch (error) {
    console.error('Invalid URL:', error);
    throw new Error('Invalid URL provided');
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    // Add timeout and other security options
    signal: AbortSignal.timeout(10000), // 10 second timeout
  });

  return response;
};

export const fetchPosts = async (filter: 'recent' | 'top', page: number = 1): Promise<Post[]> => {
  // Validate inputs
  if (!['recent', 'top'].includes(filter)) {
    throw new Error('Invalid filter parameter');
  }
  
  if (!Number.isInteger(page) || page < 1 || page > 100) {
    throw new Error('Invalid page parameter');
  }

  const url = `https://www.tabnews.com.br/api/v1/contents/JeielMiranda?with_children=false`;
  
  console.log(`Fetching posts: ${filter}, page ${page}`);
  
  try {
    const response = await makeSecureRequest(url);
    
    if (!response.ok) {
      console.error(`API request failed: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate response is an array
    if (!Array.isArray(data)) {
      console.error('API response is not an array:', data);
      throw new Error('Invalid API response format');
    }
    
    // Validate and filter posts
    const validPosts = data.filter(validatePost);
    console.log(`Fetched ${validPosts.length} valid posts out of ${data.length} total`);
    
    // Aplicar filtro localmente
    let posts = validPosts;
    if (filter === 'top') {
      posts = posts.sort((a, b) => b.tabcoins - a.tabcoins);
    } else {
      posts = posts.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    }
    
    // Simular paginação local já que a API não suporta paginação para este endpoint
    const startIndex = (page - 1) * 10;
    const endIndex = startIndex + 10;
    
    return posts.slice(startIndex, endIndex);
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const fetchPostDetail = async (slug: string): Promise<Post> => {
  // Validate slug before making request
  if (!validateSlug(slug)) {
    throw new Error('Invalid slug parameter');
  }

  const sanitizedSlug = sanitizeInput(slug);
  const url = `https://www.tabnews.com.br/api/v1/contents/JeielMiranda/${encodeURIComponent(sanitizedSlug)}`;
  
  console.log(`Fetching post detail: ${sanitizedSlug}`);
  
  try {
    const response = await makeSecureRequest(url);
    
    if (!response.ok) {
      console.error(`API request failed: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch post detail: ${response.statusText}`);
    }
    
    const post = await response.json();
    
    // Validate post data
    if (!validatePost(post)) {
      console.error('Invalid post data received:', post);
      throw new Error('Invalid post data received from API');
    }
    
    console.log(`Fetched post detail: ${post.title}`);
    
    return post;
  } catch (error) {
    console.error('Error fetching post detail:', error);
    throw error;
  }
};
