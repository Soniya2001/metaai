import React from 'react';

interface WaveformVisualizerProps {
  waveform: number[];
  progress: number; // 0 to 1
  isPlaying: boolean;
  onSeek?: (ratio: number) => void;
  accentColor?: string;
  height?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  waveform,
  progress,
  isPlaying,
  onSeek,
  accentColor = '#16877A',
  height = 36,
}) => {
  const handleBarClick = (index: number) => {
    if (onSeek) {
      const ratio = (index + 0.5) / waveform.length;
      onSeek(Math.max(0, Math.min(1, ratio)));
    }
  };

  return (
    <div 
      className="flex items-center gap-[2.5px] w-full py-1 cursor-pointer select-none group"
      style={{ height: `${height}px` }}
    >
      {waveform.map((val, idx) => {
        const barRatio = idx / waveform.length;
        const isPassed = barRatio <= progress;
        // Jitter bar height slightly when playing
        const animatedHeight = isPlaying && isPassed ? Math.min(100, Math.max(15, val + (Math.sin(Date.now() / 150 + idx) * 10))) : val;
        
        return (
          <div
            key={idx}
            onClick={() => handleBarClick(idx)}
            className="flex-1 rounded-full transition-all duration-100 group-hover:opacity-90"
            style={{
              height: `${Math.max(18, animatedHeight)}%`,
              backgroundColor: isPassed ? accentColor : '#D4D8D2',
              transform: isPlaying && isPassed ? 'scaleY(1.05)' : 'scaleY(1)',
            }}
          />
        );
      })}
    </div>
  );
};

