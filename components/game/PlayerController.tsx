'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'

interface PlayerControllerProps {
    onVelocityChange: (velocity: THREE.Vector3) => void
}

export function PlayerController({ onVelocityChange }: PlayerControllerProps) {
    // Velocity is a 3-vector (vx, vy, vz) normalized to c=1
    const velocity = useRef(new THREE.Vector3(0, 0, 0))
    const position = useRef(new THREE.Vector3(0, 0, 0))

    // Input state
    const keys = useRef<{ [key: string]: boolean }>({})

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true }
        const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    useFrame((state, delta) => {
        // Physics Constants
        // Previous bug: Fixed drag (0.98) per frame killed speed at 0.4c.
        // Fix: Use time-based damping.

        const ACCEL = 1.5 * delta; // Faster acceleration
        const DRAG_FACTOR = 0.5; // Damping factor per second.
        // Damping multiplier = 1.0 - (DRAG_FACTOR * delta)
        const damping = Math.pow(0.5, delta); // Decays to 50% every second if no input? 
        // Let's use simple linear damping approximation for game feel:
        // v *= (1 - drag * dt)

        // Steering
        // The user wants "Spinning". Let's simply add X velocity but rely on the lower drag to keep it.
        const STEER_ACCEL = 3.0 * delta;

        // 4. Relativistic Clamp & Inertia
        // Beta = v/c. Magnitude must be < 1.0
        const speed = velocity.current.length();
        const gamma = 1.0 / Math.sqrt(1.0 - Math.min(speed * speed, 0.999));

        // Relativistic Inertia: The faster you go, the harder it is to accelerate.
        // F = ma. In relativity, "m" increases by gamma^3 (longitudinal) or gamma (transverse).
        // For game feel, we'll just divide Input Acceleration by Gamma.
        // This makes it smooth to start but hard to reach 0.99c.

        const RELATIVISTIC_ACCEL = ACCEL / gamma;

        // 1. Handle Input (Thrust Z)
        if (keys.current['KeyW'] || keys.current['ArrowUp']) {
            velocity.current.z += RELATIVISTIC_ACCEL;
        }
        if (keys.current['KeyS'] || keys.current['ArrowDown']) {
            velocity.current.z -= RELATIVISTIC_ACCEL;
        }

        // 2. Handle Steering (X / Y)
        if (keys.current['KeyA'] || keys.current['ArrowLeft']) {
            velocity.current.x -= STEER_ACCEL;
        }
        if (keys.current['KeyD'] || keys.current['ArrowRight']) {
            velocity.current.x += STEER_ACCEL;
        }

        // 3. Apply Physics (Drag)
        // We dampen X and Z differently?
        // Damping Z allows max speed.
        // Max Speed = Accel / DragOffset.
        // If we want Max Speed ~ 1.0 (c).
        // Accel ~ 1.5 * dt. Drag * v ~ 1.5 * dt.
        // Let's just dampen X more for control, and Z less.

        velocity.current.x *= (1 - 2.0 * delta); // Stronger lateral drag for "grippy" turning
        velocity.current.z *= (1 - 0.5 * delta); // Low drag for high speed

        // 4. Relativistic Clamp (The Speed Limit)
        // Beta = v/c. Magnitude must be < 1.0 (actually < 0.999 for stability)
        // 'speed' is already calculated above for Gamma.
        const currentSpeed = velocity.current.length();
        const MAX_SPEED = 0.995;

        if (currentSpeed > MAX_SPEED) {
            velocity.current.setLength(MAX_SPEED);
        }

        // Update Parent
        onVelocityChange(velocity.current.clone());

        // 5. Visual "Camera Swerve" (Optional)
        // When you steer left, camera tilts left? (Bank)
        const camera = state.camera;
        // Simple Lerp for camera banking
        camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, -velocity.current.x * 0.5, 0.1);

        // Camera position shouldn't move in Z (Tunnel moves).
        // But X/Y position might move slightly to show strafing?
        // Actually, in the Tunnel logic, the tunnel itself creates the motion.
        // So the camera stays at 0,0,0 usually.
    })

    return null // Controller is logic-only, no mesh
}
