import { useStoryStore } from '@/store/storyStore';
import { cn } from '@/lib/utils';

export function SegmentedStoryRing({ stories = [], sizePx = 56, children, className }) {
  const { viewedStoryIds } = useStoryStore();

  const count = stories.length;
  if (count === 0) return <>{children}</>;

  const strokeWidth = 3;
  const padding = 2;
  const svgSize = sizePx + (strokeWidth + padding) * 2;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const r = sizePx / 2 + padding + strokeWidth / 2;

  // Single story ring
  if (count === 1) {
    const story = stories[0];
    const isViewed = story?.isViewed || viewedStoryIds.has(story?.id);

    return (
      <div
        className={cn('relative flex items-center justify-center flex-shrink-0', className)}
        style={{ width: `${svgSize}px`, height: `${svgSize}px` }}
      >
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="absolute inset-0 pointer-events-none -rotate-90"
        >
          <defs>
            <linearGradient id="storyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            strokeWidth={strokeWidth}
            stroke={isViewed ? 'rgba(156, 163, 175, 0.35)' : 'url(#storyGrad)'}
            fill="none"
          />
        </svg>
        <div className="relative z-10 flex items-center justify-center">{children}</div>
      </div>
    );
  }

  // Segmented multi-story ring
  const gapAngle = Math.min(18, 360 / count / 3);
  const segAngle = (360 - count * gapAngle) / count;

  const arcs = stories.map((story, i) => {
    const startAngle = -90 + i * (segAngle + gapAngle) + gapAngle / 2;
    const endAngle = startAngle + segAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArcFlag = segAngle > 180 ? 1 : 0;
    const pathD = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

    const isViewed = story?.isViewed || viewedStoryIds.has(story?.id);

    return {
      id: story.id || i,
      d: pathD,
      isViewed,
    };
  });

  return (
    <div
      className={cn('relative flex items-center justify-center flex-shrink-0', className)}
      style={{ width: `${svgSize}px`, height: `${svgSize}px` }}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="absolute inset-0 pointer-events-none"
      >
        <defs>
          <linearGradient id="storyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        {arcs.map((arc) => (
          <path
            key={arc.id}
            d={arc.d}
            strokeWidth={strokeWidth}
            stroke={arc.isViewed ? 'rgba(156, 163, 175, 0.35)' : 'url(#storyGrad)'}
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </svg>
      <div className="relative z-10 flex items-center justify-center">{children}</div>
    </div>
  );
}
