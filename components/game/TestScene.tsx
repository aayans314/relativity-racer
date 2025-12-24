'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { useState, useRef } from 'react'
import * as THREE from 'three'
import { RelativisticShaderMaterial } from '@/components/shaders/RelativisticMaterial'

function RelativisticBox({ velocity }: { velocity: THREE.Vector3 }) {
    // We need to type the material because it's a custom shader material
    const materialRef = useRef<any>(null)

    useFrame((state) => {
        if (materialRef.current) {
            // Update global time if needed
            materialRef.current.time = state.clock.elapsedTime
            // Update velocity uniform
            materialRef.current.velocity = velocity
        }
    })

    // We use a BoxGeometry.
    // Lorentz Contraction happens in vertex shader.
    return (
        <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2, 2, 2, 32, 32, 32]} />
            {/* High segment count (32) is needed for smooth vertex shader deformation */}
            <relativisticShaderMaterial
                ref={materialRef}
                color={new THREE.Color("orange")}
                transparent
            />
        </mesh>
    )
}

export default function TestScene() {
    const [speed, setSpeed] = useState(0)

    // Velocity vector along Z axis for testing
    const velocity = new THREE.Vector3(0, 0, speed)

    // Calculate Gamma for display
    const gamma = 1 / Math.sqrt(1 - speed * speed)

    return (
        <div className="w-full h-screen bg-black relative">
            {/* HUD Controls */}
            <div className="absolute top-4 left-4 z-10 text-white bg-slate-800 p-4 rounded bg-opacity-80">
                <h2 className="font-bold mb-2">Relativity Lab</h2>
                <div className="flex flex-col gap-2">
                    <label>
                        Speed (beta): {speed.toFixed(3)} c
                        <input
                            type="range"
                            min="-0.99"
                            max="0.99"
                            step="0.01"
                            value={speed}
                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            className="w-full"
                        />
                    </label>
                    <div className="text-sm font-mono text-green-400">
                        <div>Gamma: {Math.min(gamma, 100).toFixed(2)}</div>
                        <div>Length Contraction: {(1 / gamma).toFixed(2)}x</div>
                        <div>Doppler Factor: {Math.sqrt((1 + speed) / (1 - speed)).toFixed(2)}</div>
                    </div>
                </div>
            </div>

            <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Grid args={[20, 20]} cellColor="white" sectionColor="gray" fadeDistance={20} />

                <RelativisticBox velocity={velocity} />

                <OrbitControls />
            </Canvas>
        </div>
    )
}
