import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Cube, 
  Zap, 
  Brain, 
  RotateCcw,
  Play,
  Pause,
  Eye,
  EyeOff,
  Settings,
  Target,
  Activity
} from 'lucide-react';

interface QuantumGate {
  id: string;
  name: string;
  type: 'H' | 'X' | 'Y' | 'Z' | 'CNOT' | 'SWAP';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  color: string;
}

interface QuantumState {
  qubits: number;
  state: string;
  probability: number;
  phase: number;
}

const QuantumVisualization3D: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCircuit, setShowCircuit] = useState(true);
  const [showState, setShowState] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [quantumGates, setQuantumGates] = useState<QuantumGate[]>([
    {
      id: '1',
      name: 'Hadamard',
      type: 'H',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      color: '#3B82F6'
    },
    {
      id: '2',
      name: 'CNOT',
      type: 'CNOT',
      position: { x: 2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      color: '#EF4444'
    },
    {
      id: '3',
      name: 'Pauli-X',
      type: 'X',
      position: { x: 4, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      color: '#10B981'
    }
  ]);

  const [quantumStates, setQuantumStates] = useState<QuantumState[]>([
    { qubits: 1, state: '|0⟩', probability: 0.5, phase: 0 },
    { qubits: 1, state: '|1⟩', probability: 0.5, phase: Math.PI }
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw quantum circuit
      if (showCircuit) {
        drawQuantumCircuit(ctx);
      }

      // Draw quantum states
      if (showState) {
        drawQuantumStates(ctx);
      }

      // Animate gates
      if (isPlaying) {
        animateQuantumGates();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, showCircuit, showState, currentStep]);

  const drawQuantumCircuit = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.translate(50, 100);

    // Draw circuit background
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(0, 0, 700, 200);

    // Draw quantum gates
    quantumGates.forEach((gate, index) => {
      const x = 50 + index * 200;
      const y = 100;

      // Gate background
      ctx.fillStyle = gate.color;
      ctx.fillRect(x - 30, y - 30, 60, 60);

      // Gate symbol
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(gate.type, x, y + 8);

      // Gate name
      ctx.font = '12px Arial';
      ctx.fillText(gate.name, x, y + 40);

      // Connection lines
      if (index > 0) {
        ctx.strokeStyle = '#6B7280';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 80, y);
        ctx.lineTo(x - 30, y);
        ctx.stroke();
      }
    });

    // Draw qubit lines
    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 100 + i * 20);
      ctx.lineTo(700, 100 + i * 20);
      ctx.stroke();
    }

    ctx.restore();
  };

  const drawQuantumStates = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.translate(50, 350);

    // Draw Bloch sphere representation
    const centerX = 150;
    const centerY = 100;
    const radius = 80;

    // Bloch sphere
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw quantum states
    quantumStates.forEach((state, index) => {
      const angle = state.phase;
      const x = centerX + Math.cos(angle) * radius * state.probability;
      const y = centerY + Math.sin(angle) * radius * state.probability;

      // State point
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fill();

      // State label
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(state.state, x, y - 15);
    });

    // Draw probability bars
    ctx.translate(350, 0);
    quantumStates.forEach((state, index) => {
      const barHeight = 20;
      const barWidth = state.probability * 200;
      const y = index * 30;

      // Bar background
      ctx.fillStyle = '#374151';
      ctx.fillRect(0, y, 200, barHeight);

      // Bar fill
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(0, y, barWidth, barHeight);

      // Label
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${state.state}: ${(state.probability * 100).toFixed(1)}%`, 210, y + 15);
    });

    ctx.restore();
  };

  const animateQuantumGates = () => {
    setQuantumGates(prev => prev.map(gate => ({
      ...gate,
      rotation: {
        x: gate.rotation.x + 0.02,
        y: gate.rotation.y + 0.01,
        z: gate.rotation.z + 0.03
      }
    })));
  };

  const addQuantumGate = () => {
    const newGate: QuantumGate = {
      id: Date.now().toString(),
      name: 'New Gate',
      type: 'H',
      position: { x: quantumGates.length * 2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    };
    setQuantumGates(prev => [...prev, newGate]);
  };

  const resetVisualization = () => {
    setCurrentStep(0);
    setQuantumGates([
      {
        id: '1',
        name: 'Hadamard',
        type: 'H',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        color: '#3B82F6'
      },
      {
        id: '2',
        name: 'CNOT',
        type: 'CNOT',
        position: { x: 2, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        color: '#EF4444'
      },
      {
        id: '3',
        name: 'Pauli-X',
        type: 'X',
        position: { x: 4, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        color: '#10B981'
      }
    ]);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔬 3D Quantum Visualization
        </h1>
        <p className="text-gray-600">
          Real-time quantum circuit and state visualization
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cube className="h-5 w-5" />
            Visualization Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className={isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Animation
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Animation
                </>
              )}
            </Button>

            <Button
              onClick={resetVisualization}
              variant="outline"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>

            <Button
              onClick={addQuantumGate}
              variant="outline"
            >
              <Target className="h-4 w-4 mr-2" />
              Add Gate
            </Button>

            <Button
              onClick={() => setShowCircuit(!showCircuit)}
              variant="outline"
            >
              {showCircuit ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showCircuit ? 'Hide' : 'Show'} Circuit
            </Button>

            <Button
              onClick={() => setShowState(!showState)}
              variant="outline"
            >
              {showState ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showState ? 'Hide' : 'Show'} States
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3D Visualization Canvas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Quantum Circuit & States
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-96 bg-gray-900"
              style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)' }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quantum Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Circuit Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quantum Circuit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quantumGates.map((gate) => (
                <div key={gate.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: gate.color }}
                    />
                    <div>
                      <h3 className="font-medium">{gate.name}</h3>
                      <p className="text-sm text-gray-600">Type: {gate.type}</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    Active
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* State Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quantum States
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quantumStates.map((state, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{state.state}</h3>
                    <p className="text-sm text-gray-600">
                      Probability: {(state.probability * 100).toFixed(1)}%
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {state.qubits} Qubit{state.qubits > 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quantum Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {quantumGates.length}
              </div>
              <div className="text-sm text-gray-600">Quantum Gates</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {quantumStates.length}
              </div>
              <div className="text-sm text-gray-600">Quantum States</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {isPlaying ? 'Active' : 'Paused'}
              </div>
              <div className="text-sm text-gray-600">Animation</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {currentStep}
              </div>
              <div className="text-sm text-gray-600">Current Step</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>🔬 3D Quantum Visualization - Real-time quantum circuit and state representation</p>
        <p>Gates: {quantumGates.length} | States: {quantumStates.length} | Animation: {isPlaying ? 'Active' : 'Paused'}</p>
      </div>
    </div>
  );
};

export default QuantumVisualization3D; 