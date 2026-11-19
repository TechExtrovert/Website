import { useEffect, useState } from 'react';
import { Calendar, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { navigate } from '../lib/router';
import type { BlogPost } from '../lib/types';

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });
      setPosts(data || []);
      setLoading(false);
    })();
  }, []);

  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))] as string[];
  const filtered = activeCategory
    ? posts.filter((p) => p.category === activeCategory)
    : posts;
  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="pt-20 min-h-screen">
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 py-16">
        <div className="container-x text-center">
          <span className="badge bg-white/20 text-white mb-4">Zarachills Blog</span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white mb-4">
            Health, Fitness & Wellness
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Expert insights on nutrition, training, recovery, and living your
            healthiest life with natural fruit blends.
          </p>
        </div>
      </section>

      <section className="container-x py-12">
        {/* Category filter */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide mb-10">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              !activeCategory ? 'bg-primary-500 text-white' : 'bg-gray-100 text-dark-600 hover:bg-gray-200'
            }`}
          >
            All Articles
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat ? 'bg-primary-500 text-white' : 'bg-gray-100 text-dark-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <div
                onClick={() => navigate(`/blog/${featured.slug}`)}
                className="card card-hover cursor-pointer overflow-hidden mb-12 group"
              >
                <div className="grid md:grid-cols-2">
                  <div className="aspect-video md:aspect-auto overflow-hidden">
                    <img
                      src={featured.image_url || ''}
                      alt={featured.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <span className="badge bg-primary-50 text-primary-600 mb-4 self-start">
                      Featured · {featured.category}
                    </span>
                    <h2 className="font-heading text-2xl md:text-3xl font-bold text-dark-600 mb-4 group-hover:text-primary-600 transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-dark-200 mb-6">{featured.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-dark-200">
                      <span>{featured.author}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {featured.read_time}
                      </span>
                    </div>
                    <span className="flex items-center gap-2 text-primary-600 font-semibold mt-4 group-hover:gap-3 transition-all">
                      Read Article <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rest.map((post, i) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  className="card card-hover cursor-pointer overflow-hidden group animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.image_url || ''}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <span className="badge bg-secondary-100 text-secondary-700 mb-3">
                      {post.category}
                    </span>
                    <h3 className="font-heading font-bold text-lg text-dark-600 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-dark-200 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-dark-200">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.published_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {post.read_time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export function BlogPostPage({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      setPost(data as BlogPost | null);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen container-x py-20">
        <div className="h-8 bg-gray-100 rounded animate-pulse w-3/4 mb-4" />
        <div className="h-64 bg-gray-100 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-heading font-bold text-dark-600 mb-4">Article not found</p>
          <button onClick={() => navigate('/blog')} className="btn-primary">Back to Blog</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      <article className="container-x py-12 max-w-3xl">
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-dark-200 hover:text-primary-600 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </button>

        <span className="badge bg-primary-50 text-primary-600 mb-4">{post.category}</span>
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-dark-600 mb-4 text-balance">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-dark-200 mb-8">
          <span>{post.author}</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(post.published_at).toLocaleDateString('en-NG', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {post.read_time}
          </span>
        </div>

        <div className="aspect-video rounded-3xl overflow-hidden mb-8">
          <img src={post.image_url || ''} alt={post.title} className="w-full h-full object-cover" />
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-dark-600 leading-relaxed mb-6 font-medium">{post.excerpt}</p>
          <p className="text-dark-600 leading-relaxed mb-4">{post.content}</p>
          <p className="text-dark-600 leading-relaxed mb-4">
            At Zarachills, we believe that what you put into your body matters.
            Every blend we create is designed with intention — to support your
            fitness goals, enhance your recovery, and fuel your lifestyle naturally.
          </p>
          <p className="text-dark-600 leading-relaxed mb-4">
            Our commitment to quality means we source only the finest organic
            ingredients, test every batch for purity, and deliver freshness you
            can taste in every sip.
          </p>
          <p className="text-dark-600 leading-relaxed">
            Ready to experience the difference? Explore our range of functional
            blends and find the one that matches your goals.
          </p>
        </div>

        <div className="mt-12 p-8 card bg-gradient-to-br from-primary-50 to-secondary-50 text-center">
          <h3 className="font-heading text-xl font-bold text-dark-600 mb-3">
            Experience the Zarachills Difference
          </h3>
          <p className="text-dark-200 mb-6">Find your perfect blend today.</p>
          <button onClick={() => navigate('/shop')} className="btn-primary">
            Shop Now <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </article>
    </div>
  );
}
