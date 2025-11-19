import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Story {
  id: number;
  image: string;
  title: string;
  preview: string;
  icon?: string;
}

interface StoriesCarouselProps {
  stories: Story[];
}

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

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide">
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => {
              setSelectedStory(story.id);
              setProgress(0);
            }}
            className="flex-shrink-0 flex flex-col items-center gap-1"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary via-accent to-secondary p-[2px]">
              <div className="w-full h-full rounded-full bg-background p-[2px] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl">
                  {story.icon || '📱'}
                </div>
              </div>
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-[64px]">
              {story.title}
            </span>
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
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 p-8">
              <div className="text-center space-y-4">
                <div className="text-6xl mb-4">
                  {stories[selectedStory].icon || '📱'}
                </div>
                <h3 className="text-white text-2xl font-bold">
                  {stories[selectedStory].title}
                </h3>
                <p className="text-white/80 text-lg">
                  Скоро здесь появятся интересные истории и обновления!
                </p>
                <div className="mt-8 text-white/60 text-sm">
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
