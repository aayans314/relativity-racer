'use client'

import { Canvas } from '@react-three/fiber'
import { Tunnel } from './Tunnel'
import { useState } from 'react'
import * as THREE from 'three'

export default function RelativityGame() {
    const [speed, setSpeed] = useState(0)

    return (
        <div className="w-full h-screen bg-black">
            {/* HUD */}
            <div className="absolute top-4 left-4 z-10 text-white font-mono">
                <h1 className="text-2xl font-bold italic">RELATIVITY RACER</h1>
                <div className="mt-4 bg-slate-900/50 p-4 border border-cyan-500 rounded">
                    <p>Velocity: {(speed).toFixed(4)} c</p>
                    <p>Gamma: {(1 / Math.sqrt(1 - speed * speed)).toFixed(2)}</p>
                    <input
                        type="range"
                        className="mt-2 w-64 accent-cyan-500"
                        min="0" max="0.99" step="0.001"
                        value={speed}
                        onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    />
                </div>
            </div>

            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <color attach="background" args={['#000010']} />
                <fog attach="fog" args={['#000010', 5, 50]} />

                <ambientLight intensity={0.5} />

                {/* The Tunnel Component manages the world movement relative to speed */}
                <Tunnel speed={speed} />

                {/* We need to rotate the default cylinder geometry in the Tunnel, or rotate the camera?
            Tunnel uses cylinder which is Y-up.
            We should wrap Tunnel meshes in a group or rotate geometry inside.
            Let's rotate the whole Tunnel group -Math.PI/2 on X to align Y with Z?
            Actually let's fix it inside Tunnel.tsx 
        */}
            </Canvas>
        </div>
    )
}
