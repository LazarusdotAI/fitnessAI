import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

function ExerciseFigure({ exercise }: { exercise: string }) {
  return (
    <group>
      {/* Head */}
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.4, 0.6, 0.2]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* Arms */}
      <mesh position={[0.3, 1.4, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <mesh position={[-0.3, 1.4, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* Legs */}
      <mesh position={[0.1, 0.8, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.6]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <mesh position={[-0.1, 0.8, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.6]} />
        <meshStandardMaterial color="#666" />
      </mesh>
    </group>
  );
}

function Scene({ exercise }: { exercise: string }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <Suspense fallback={null}>
        <ExerciseFigure exercise={exercise} />
      </Suspense>
      <OrbitControls
        makeDefault
        minDistance={2}
        maxDistance={5}
        enablePan={false}
      />
    </>
  );
}

interface ExerciseDemoProps {
  exercise: string;
  description: string;
}

export default function ExerciseDemo({ exercise, description }: ExerciseDemoProps) {
  const [showAI, setShowAI] = useState(true);

  const { data: imageData, isLoading: isImageLoading } = useQuery({
    queryKey: ['/api/generate-exercise-image', exercise],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/generate-exercise-image', {
        exercise,
        style: 'realistic'
      });
      const data = await response.json();
      return data as { url: string; revisedPrompt?: string; };
    },
    enabled: showAI,
    staleTime: Infinity,
  });

  return (
    <div className="w-full space-y-4">
      <div className="h-[400px] relative rounded-lg overflow-hidden border border-zinc-800">
        <ErrorBoundary fallback={<SimplifiedView description={description} />}>
          {showAI && imageData?.url ? (
            <div className="h-full w-full relative bg-black/50">
              <img
                src={imageData.url}
                alt={`AI-generated demonstration of ${exercise}`}
                className="w-full h-full object-contain"
              />
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>
          ) : (
            <Canvas camera={{ position: [0, 2, 4], fov: 50 }}>
              <Scene exercise={exercise} />
            </Canvas>
          )}
        </ErrorBoundary>

        <button
          onClick={() => setShowAI(!showAI)}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/80 text-white hover:bg-black transition-colors"
          title={showAI ? "Switch to 3D View" : "Switch to AI Generated View"}
        >
          <ImageIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 rounded-lg border border-zinc-800 bg-black/50">
        <h3 className="text-lg font-semibold text-white mb-2 capitalize">
          {exercise}
        </h3>
        <p className="text-white/80">{description}</p>
      </div>
    </div>
  );
}

function ErrorBoundary({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return fallback;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full bg-black/50">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function SimplifiedView({ description }: { description: string }) {
  return (
    <div className="h-full flex items-center justify-center p-8 bg-black/50">
      <div className="text-center">
        <p className="text-white/80 mb-4">
          3D view is temporarily unavailable. Here's a text description:
        </p>
        <p className="text-white/90">{description}</p>
      </div>
    </div>
  );
}