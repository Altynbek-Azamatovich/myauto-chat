import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Story {
  id: number;
  image: string;
  title: string;
  preview: string;
}

interface StoriesCarouselProps {
  stories: Story[];
}

export const StoriesCarousel = ({ stories }: StoriesCarouselProps) => {
  const [selectedStory, setSelectedStory] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startXRef = useRef<number>(0);

  useEffect(() => {
    if (selectedStory === null || isPaused) return;

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
  }, [selectedStory, isPaused]);

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
    setIsPaused(false);
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
              <div className="w-full h-full rounded-full bg-background p-[2px]">
                <img
                  src={story.preview}
                  alt={story.title}
                  className="w-full h-full rounded-full object-cover"
                />
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

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsPaused(!isPaused);
            }}
            className="absolute inset-0"
          />

          <img
            src={stories[selectedStory].image}
            alt={stories[selectedStory].title}
            className="max-w-full max-h-full object-contain"
          />

          <div className="absolute bottom-8 left-4 right-4 text-white">
            <h3 className="text-lg font-bold">{stories[selectedStory].title}</h3>
          </div>
        </div>
      )}
    </>
  );
};
