'use client'

import { Canvas } from '@react-three/fiber'
import { Tunnel } from './Tunnel'
import { useState } from 'react'
import * as THREE from 'three'
import { PlayerController } from './PlayerController'

export default function RelativityGame() {
    const [velocity, setVelocity] = useState(new THREE.Vector3(0, 0, 0))

    return (
        <div className="w-full h-screen bg-black">
            {/* HUD */}
            <div className="absolute top-4 left-4 z-10 text-white font-mono pointer-events-none">
                <h1 className="text-2xl font-bold italic">RELATIVITY RACER</h1>
                <div className="mt-4 bg-slate-900/50 p-4 border border-cyan-500 rounded">
                    <p>Velocity Z: {velocity.z.toFixed(4)} c</p>
                    <p>Velocity X: {velocity.x.toFixed(4)} c</p>
                    <p>Gamma: {(1 / Math.sqrt(1 - Math.min(velocity.lengthSq(), 0.999))).toFixed(2)}</p>
                    <div className="text-xs text-gray-400 mt-2">
                        CONTROLS: W/S (Thrust), A/D (Steer)
                    </div>
                </div>
            </div>

            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <color attach="background" args={['#000010']} />
                <fog attach="fog" args={['#000010', 5, 50]} />

                <ambientLight intensity={0.5} />

                {/* Logic */}
                <PlayerController onVelocityChange={setVelocity} />

                {/* The Tunnel Component manages the world movement relative to speed */}
                <Tunnel speed={velocity.z} />

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
