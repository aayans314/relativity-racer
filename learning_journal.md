# Relativity Racer - Learning Journal

## Entry 1: The Foundation (Coordinate Systems & WebGL)
**Date**: 2025-12-24

### 1. The "What": Why WebGL?
We are building a simulation that requires manipulating light and geometry at the speed of light. Normal animations (CSS/2D Canvas) aren't fast enough.
*   **WebGL**: Allows us to talk directly to the GPU (Graphics Card).
*   **Shaders**: Small programs that run on the GPU. We will need these to "squash" our 3D models (Lorentz Contraction) millions of times per second.

### 2. The "How": Tech Stack
We picked **React Three Fiber (R3F)**.
*   It lets us write 3D scenes like HTML components: `<Mesh />`.
*   It exposes the raw `Three.js` power we need for custom shaders.

### 3. The "Why": Coordinate Systems
In Special Relativity, "Where you are" depends on "When you are".
Most games use a 3D vector: `(x, y, z)`.
We will need to implement a **4-Vector**: `(ct, x, y, z)`.
*   `ct`: Light-seconds (Time scaled by speed of light).
*   `x, y, z`: Spatial coordinates.

We are starting now!

## Entry 2: Bending Light (The Shaders)
**Date**: 2025-12-24

### 1. The "What": Visualizing $c$
We implemented the **Lorentz Contraction** and **Doppler Shift**.
*   **Contraction**: As $v \to c$, things look squashed.
*   **Doppler**: Moving towards = Blue, Moving away = Red.

### 2. The "How": GLSL Shaders
We wrote a custom shader `RelativisticShaderMaterial.tsx`.
*   **Vertex Shader**: We take the vertex position `p` and calculate `p_new = p_parallel / gamma`. This physically moves the mesh points on the GPU.
*   **Fragment Shader**: We calculate `vDopplerFactor` based on velocity direction. If `factor > 1`, we boost the Blue channel. If `< 1`, we boost Red.

### 3. The "Why": Performance
Doing this on CPU (Javascript) would require looping over 10,000 vertices every frame (60fps). That kills the browser.
Doing it on GPU (Shader) is free. It happens parallel to the drawing process.

### 2. The Result
All tests passed. We now have a "Green Build".
This is critical for the "Startup" quality the user requested. No serious deep-tech product ships without automated tests.

## Entry 4: The Need for Speed (Player Controller)
**Date**: 2025-12-24

### 1. The "What": Input Handling
We built a `PlayerController` that acts as the "Driver" of our relativistic ship.
*   **Thrust (W/S)**: Increases `velocity.z`.
*   **Steer (A/D)**: Changes `velocity.x`.

### 2. The "How": Physics
We implemented a simple drag/acceleration model.
*   `accel = 0.5 * dt`
*   `drag = 0.98`
Critical: We **Clamp** the velocity at `0.995c`.
If we let `v >= c`, the Gamma factor (`1/sqrt(1-v^2)`) divides by zero (or negative), crashing the shader.

### 3. The Tunnel Connection
The Controller doesn't move the *Camera*. It tells the *Tunnel* how fast to move backwards.
This is the **Theory of Relativity** in action: "Am I moving forward, or is the universe moving backward?" Mathematically, it's identical.

**Date**: 2025-12-24

### 1. The "What": Testing Physics
We can't just "look" at the screen and know if the math is right. A 1% error in Velocity addition leads to FTL (Faster Than Light) bugs quickly.
We added **Jest** and wrote tests for:
*   `addVelocities(0.9c, 0.9c) -> 0.994c` (Correct) vs `1.8c` (Newtonian/Wrong).
*   `getGamma(0.99c) -> ~7.0`.

### 2. The Result
All tests passed. We now have a "Green Build".
This is critical for the "Startup" quality the user requested. No serious deep-tech product ships without automated tests.

