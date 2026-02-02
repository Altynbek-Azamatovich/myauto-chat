import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Story {
  id: number;
  image: string;
  title: string;
  preview: string;
  icon?: string;
  color?: string;
}

interface StoriesCarouselProps {
  stories: Story[];
}

// Infinite marquee text component
const MarqueeText = ({ text, color }: { text: string; color: string }) => {
  const repeatedText = Array(8).fill(text).join(' • ');
  
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
      <div 
        className="whitespace-nowrap text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
        style={{
          animation: 'story-marquee 6s linear infinite',
        }}
      >
        {repeatedText}
      </div>
    </div>
  );
};

// Spinning gradient border component
const SpinningBorder = () => {
  return (
    <div 
      className="absolute inset-0 rounded-full"
      style={{
        background: 'conic-gradient(from 0deg, #833ab4, #fd1d1d, #fcb045, #833ab4)',
        animation: 'spin-border 2s linear infinite',
      }}
    />
  );
};

// Story colors
const storyColors: Record<string, string> = {
  'Новости': 'from-blue-500 via-blue-600 to-indigo-700',
  'Акции': 'from-rose-500 via-pink-500 to-fuchsia-600',
  'Советы': 'from-emerald-500 via-green-500 to-teal-600',
  'Обзоры': 'from-amber-500 via-orange-500 to-red-500',
  'News': 'from-blue-500 via-blue-600 to-indigo-700',
  'Promo': 'from-rose-500 via-pink-500 to-fuchsia-600',
  'Tips': 'from-emerald-500 via-green-500 to-teal-600',
  'Reviews': 'from-amber-500 via-orange-500 to-red-500',
};

export const StoriesCarousel = ({ stories }: StoriesCarouselProps) => {
  const [selectedStory, setSelectedStory] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startXRef = useRef<number>(0);

  useEffect(() => {
    if (selectedStory === null) return;

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + (100 / 150); // 15 seconds = 150 * 100ms
      });
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedStory]);

  const handleNext = () => {
    if (selectedStory !== null && selectedStory < stories.length - 1) {
      setSelectedStory(selectedStory + 1);
      setProgress(0);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (selectedStory !== null && selectedStory > 0) {
      setSelectedStory(selectedStory - 1);
      setProgress(0);
    }
  };

  const handleClose = () => {
    setSelectedStory(null);
    setProgress(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startXRef.current - endX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const getColorClass = (title: string) => {
    return storyColors[title] || 'from-primary via-accent to-secondary';
  };

  return (
    <>
      <style>{`
        @keyframes story-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes spin-border {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div className="flex gap-4 overflow-x-auto pb-2 px-4 scrollbar-hide">
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => {
              setSelectedStory(story.id);
              setProgress(0);
            }}
            className="flex-shrink-0 flex flex-col items-center"
          >
            {/* Spinning Instagram-style border */}
            <div className="relative w-[72px] h-[72px]">
              <SpinningBorder />
              {/* Inner circle with gradient background and marquee text */}
              <div className="absolute inset-[3px] rounded-full bg-background">
                <div className={cn(
                  "absolute inset-[2px] rounded-full bg-gradient-to-br overflow-hidden",
                  getColorClass(story.title)
                )}>
                  <MarqueeText text={story.title} color={getColorClass(story.title)} />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedStory !== null && (
        <div
          className="fixed inset-0 bg-black z-[100] flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            if (x < rect.width / 2) {
              handlePrev();
            } else {
              handleNext();
            }
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="absolute top-4 right-4 z-10 text-white"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="absolute top-4 left-4 right-16 flex gap-1 z-10">
            {stories.map((_, index) => (
              <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                {index === selectedStory && (
                  <div
                    className="h-full bg-white transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                )}
                {index < selectedStory && <div className="h-full bg-white w-full" />}
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {selectedStory > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {selectedStory < stories.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Story Content */}
          <div className="relative w-full h-full max-w-md mx-auto">
            <div className={cn(
              "w-full h-full flex flex-col items-center justify-center bg-gradient-to-br p-8",
              getColorClass(stories[selectedStory].title)
            )}>
              <div className="text-center space-y-4">
                <h3 className="text-white text-3xl font-bold drop-shadow-lg">
                  {stories[selectedStory].title}
                </h3>
                <p className="text-white/90 text-lg">
                  Скоро здесь появятся интересные истории и обновления!
                </p>
                <div className="mt-8 text-white/70 text-sm">
                  Следите за новостями 👀
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
