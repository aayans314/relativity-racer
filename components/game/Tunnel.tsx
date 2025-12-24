'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RelativisticShaderMaterial } from '@/components/shaders/RelativisticMaterial'

const TUNNEL_LENGTH = 200
const SEGMENTS = 20
const SEGMENT_LENGTH = TUNNEL_LENGTH / SEGMENTS

/**
 * Procedural Tunnel.
 * Instead of generating new geometry, we recycle segments.
 * When a segment goes behind the camera (due to speed), we teleport it to the front.
 */
export function Tunnel({ speed }: { speed: number }) {
    // We use InstancedMesh for performance if we had many, but for segments 
    // with custom shader uniforms per segment? 
    // Actually, standard mesh is fine for 20 segments.
    // Let's use a group of standard meshes so the Shader Material acts uniformly on each?
    // Actually, vertex shader does the contraction based on world position.
    // So we just need to place them.

    const groupRef = useRef<THREE.Group>(null)

    // Create static positions for initial layout
    const initialPositions = useMemo(() => {
        return Array.from({ length: SEGMENTS }).map((_, i) => ({
            z: -i * SEGMENT_LENGTH,
            id: i
        }))
    }, [])

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Move the entire world towards the player (who is static at 0,0,0 usually)
        // OR move the tunnel.
        // In Relativity, "Velocity" is relative. 
        // If player has velocity +Z, the world moves -Z.

        // We update the 'velocity' uniform of EVERY child.
        groupRef.current.children.forEach((child: any) => {
            // 1. Update Uniforms
            if (child.material) {
                // Player moving +Z means velocity vector is +Z.
                // The visual shader needs the player's velocity Vector3(0, 0, speed).
                child.material.velocity = new THREE.Vector3(0, 0, speed)
                child.material.time = state.clock.elapsedTime
            }

            // 2. Infinite Scrolling Logic
            // Move child towards player (positive Z)
            // distance = speed * delta ? No, "speed" is fraction of c. 
            // In simulation units, let's say c = 100 units/sec.
            const C_UNITS = 20.0; // Simulated speed of light in world units
            const moveDist = speed * C_UNITS * delta

            child.position.z += moveDist

            // Recycle
            if (child.position.z > SEGMENT_LENGTH) {
                // If it passes the camera, move it to the back
                // We find the furthest back segment?
                // Simple ring buffer logic:
                // Current Back = (The one with lowest Z).
                // Actually, just subtract total length.
                child.position.z -= (TUNNEL_LENGTH)
            }
        })
    })

    return (
        <group ref={groupRef}>
            {initialPositions.map((pos) => (
                <mesh key={pos.id} position={[0, 0, pos.z]} rotation={[Math.PI / 2, 0, 0]}>
                    {/* Cylinder aligned to Z now */}
                    <cylinderGeometry args={[5, 5, SEGMENT_LENGTH, 16, 1, true]} />
                    <relativisticShaderMaterial
                        side={THREE.DoubleSide}
                        color={new THREE.Color(0.2, 0.2 + (pos.id / SEGMENTS) * 0.5, 0.8)} // Gradient color
                        key={RelativisticShaderMaterial.key}
                        wireframe={true} // Sci-fi look
                    />
                </mesh>
            ))}
        </group>
    )
}
