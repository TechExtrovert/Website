import { useState } from 'react';
import {
  Flame, TrendingUp, Zap, HeartPulse, Droplets, Sparkles,
  ArrowRight, ArrowLeft, Check, RotateCcw,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { navigate } from '../lib/router';
import { useCart } from '../lib/cart';
import type { Product } from '../lib/types';
import { formatNaira } from '../lib/types';

const QUESTIONS = [
  {
    question: 'What\'s your primary fitness goal?',
    options: [
      { label: 'Lose fat & get lean', goal: 'fat-loss', icon: Flame },
      { label: 'Gain weight & build muscle', goal: 'weight-gain', icon: TrendingUp },
      { label: 'Boost energy & performance', goal: 'energy', icon: Zap },
      { label: 'Recover faster from workouts', goal: 'recovery', icon: HeartPulse },
      { label: 'Stay hydrated all day', goal: 'hydration', icon: Droplets },
      { label: 'Improve overall wellness & glow', goal: 'wellness', icon: Sparkles },
    ],
  },
  {
    question: 'How active is your lifestyle?',
    options: [
      { label: 'Sedentary — I work at a desk', goal: 'wellness' },
      { label: 'Lightly active — I walk & move', goal: 'hydration' },
      { label: 'Active — I train 3-4x/week', goal: 'energy' },
      { label: 'Very active — I train daily', goal: 'recovery' },
      { label: 'Athlete — I train 2x/day', goal: 'recovery' },
    ],
  },
  {
    question: 'What\'s your biggest challenge?',
    options: [
      { label: 'Low energy & fatigue', goal: 'energy' },
      { label: 'Slow metabolism', goal: 'fat-loss' },
      { label: 'Hard to gain weight', goal: 'weight-gain' },
      { label: 'Muscle soreness', goal: 'recovery' },
      { label: 'Dehydration', goal: 'hydration' },
      { label: 'Dull skin & low vitality', goal: 'wellness' },
    ],
  },
];

export function FindBlendPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();

  const selectAnswer = (goal: string) => {
    const newAnswers = [...answers, goal];
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      getResults(newAnswers);
    }
  };

  const getResults = async (allAnswers: string[]) => {
    setLoading(true);
    setStep(QUESTIONS.length);
    const goalCount: Record<string, number> = {};
    allAnswers.forEach((g) => {
      goalCount[g] = (goalCount[g] || 0) + 1;
    });
    const topGoal = Object.entries(goalCount).sort((a, b) => b[1] - a[1])[0][0];
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('goal', topGoal)
      .limit(3);
    setResults(data || []);
    setLoading(false);
  };

  const restart = () => {
    setStep(0);
    setAnswers([]);
    setResults([]);
  };

  const progress = ((step + (results.length > 0 ? 1 : 0)) / (QUESTIONS.length + 1)) * 100;

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-b from-primary-50/30 to-white dark:from-dark-600 dark:to-dark-700">
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 py-16">
        <div className="container-x text-center">
          <span className="badge bg-white/20 text-white mb-4">Personalized</span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white mb-4">
            Find Your Blend
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Answer a few questions and we'll recommend the perfect blends for your
            fitness journey.
          </p>
        </div>
      </section>

      <section className="container-x py-12">
        {step < QUESTIONS.length && !loading && (
          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-200 dark:text-dark-300">
                  Question {step + 1} of {QUESTIONS.length}
                </span>
                <span className="text-sm text-dark-200 dark:text-dark-300">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-dark-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div key={step} className="animate-fade-in-up">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-dark-600 dark:text-dark-100 mb-8 text-center">
                {QUESTIONS[step].question}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {QUESTIONS[step].options.map((option, i) => {
                  const Icon = option.icon || Sparkles;
                  return (
                    <button
                      key={i}
                      onClick={() => selectAnswer(option.goal)}
                      className="card card-hover p-6 text-left flex items-center gap-4 group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6 text-primary-500" />
                      </div>
                      <span className="font-medium text-dark-600 dark:text-dark-100 flex-1">{option.label}</span>
                      <ArrowRight className="h-5 w-5 text-dark-200 dark:text-dark-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                    </button>
                  );
                })}
              </div>

              {step > 0 && (
                <button
                  onClick={() => {
                    setAnswers(answers.slice(0, -1));
                    setStep(step - 1);
                  }}
                  className="flex items-center gap-2 mt-8 text-dark-200 dark:text-dark-300 hover:text-dark-600 dark:text-dark-100 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            <p className="text-dark-200 dark:text-dark-300 mt-4">Finding your perfect blend...</p>
          </div>
        )}

        {results.length > 0 && !loading && (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="text-center mb-12">
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-primary-600" />
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-dark-600 dark:text-dark-100 mb-3">
                Your Perfect Blends
              </h2>
              <p className="text-dark-200 dark:text-dark-300 text-lg">
                Based on your answers, we recommend these blends tailored to your goals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {results.map((product) => (
                <div key={product.id} className="card overflow-hidden group">
                  <div className="aspect-square overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50">
                    <img
                      src={product.image_url || ''}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading font-bold text-lg text-dark-600 dark:text-dark-100 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-dark-200 dark:text-dark-300 mb-3">{product.tagline}</p>
                    <p className="font-heading font-bold text-primary-600 mb-4">
                      {formatNaira(product.price)}
                    </p>
                    <button
                      onClick={() => {
                        addItem({
                          id: product.id,
                          name: product.name,
                          slug: product.slug,
                          price: product.price,
                          image_url: product.image_url,
                          type: 'product',
                        });
                        navigate('/cart');
                      }}
                      className="btn-primary w-full text-sm"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={restart} className="btn-outline">
                <RotateCcw className="h-4 w-4" /> Retake Quiz
              </button>
              <button onClick={() => navigate('/shop')} className="btn-primary">
                Browse All Blends <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
