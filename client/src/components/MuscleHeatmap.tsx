import { useRef, useState, Suspense } from 'react';
import { Brain } from 'lucide-react';

interface MuscleGroup {
  name: string;
  intensity: number;
  position: [number, number, number];
}

const muscleGroups: MuscleGroup[] = [
  { name: "chest", intensity: 0, position: [0, 1.4, 0.2] },
  { name: "biceps", intensity: 0, position: [0.4, 1.2, 0] },
  { name: "triceps", intensity: 0, position: [-0.4, 1.2, 0] },
  { name: "shoulders", intensity: 0, position: [0, 1.6, 0] },
  { name: "abs", intensity: 0, position: [0, 1, 0.1] },
  { name: "quads", intensity: 0, position: [0.2, 0.5, 0.1] },
  { name: "hamstrings", intensity: 0, position: [0.2, 0.5, -0.1] },
  { name: "calves", intensity: 0, position: [0.2, 0.2, -0.1] },
];

function SimpleMuscleView() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {muscleGroups.map((group) => (
        <div 
          key={group.name}
          className="flex items-center gap-2 p-3 bg-black/20 rounded-lg border border-zinc-800"
        >
          <Brain className="h-5 w-5 text-primary" />
          <div>
            <div className="font-medium text-white capitalize">{group.name}</div>
            <div className="text-sm text-white/60">
              Intensity: {Math.round(group.intensity * 100)}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MuscleHeatmap() {
  return (
    <div className="w-full">
      <div className="text-white/80 text-sm mb-4 px-4">
        Note: Using simplified view for compatibility
      </div>
      <SimpleMuscleView />
    </div>
  );
}