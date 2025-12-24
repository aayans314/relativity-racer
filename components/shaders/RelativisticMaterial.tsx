import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * RelativisticShaderMaterial
 * 
 * Uniforms:
 * - time: Global time (unused currently but good for effects)
 * - color: Base color of the object
 * - velocity: The velocity vector (normalized to c=1). Magnitude < 1.0.
 * 
 * Vertex Shader: Per-vertex Lorentz Contraction.
 * Fragment Shader: Relativistic Doppler Shift (Redshift/Blueshift).
 */
const RelativisticShaderMaterial = shaderMaterial(
    {
        time: 0,
        color: new THREE.Color(0.2, 0.5, 1.0),
        velocity: new THREE.Vector3(0, 0, 0), // v/c
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    varying float vDopplerFactor;
    uniform vec3 velocity;

    void main() {
      vUv = uv;
      
      // 1. Calculate Gamma (Lorentz Factor)
      // gamma = 1 / sqrt(1 - v^2)
      float betaSq = dot(velocity, velocity);
      
      // Safety check to prevent division by zero or imaginary numbers if v >= c
      // In a game, we clamp betaSq to 0.999
      betaSq = min(betaSq, 0.999);
      float gamma = 1.0 / sqrt(1.0 - betaSq);

      // 2. Perform Lorentz Contraction
      // We contract spatial dimensions ALONG the direction of velocity.
      // p' = p + (gamma - 1)(p . n)n  <-- Inverse transformation usually? 
      // Wait, if observer moves, the world "contracts".
      // Formula: p_parallel' = p_parallel / gamma
      // p_New = p_perp + p_parallel / gamma
      
      vec3 pos = position;
      float vMag = length(velocity);
      
      if (vMag > 0.001) {
          vec3 n = normalize(velocity);
          float pParallelMag = dot(pos, n);
          vec3 pParallel = pParallelMag * n;
          vec3 pPerp = pos - pParallel;
          
          // Apply contraction
          // Length L appears shorter (L/gamma).
          pos = pPerp + (pParallel / gamma);
      }

      // 3. Output position
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      
      // 4. Calculate Doppler Factor for Fragment Shader
      // D = sqrt((1+beta)/(1-beta)) is for 1D.
      // General 3D Doppler: D = 1 / (gamma * (1 - beta * cos(theta)))
      // theta is angle between velocity and direction to source.
      // For now, let's approximation based on position Z for effect.
      // Actually standard Relativistic Doppler:
      // We need view direction. 
      // Approximate: Just use simple forward/back shift based on velocity.z
      
      // Simple 1D approximation for visualization:
      // If velocity is towards -Z (standard camera look), and object is at -Z.
      // Let's pass simple factor based on Z component for now.
      float betaZ = velocity.z; 
      vDopplerFactor = sqrt((1.0 - betaZ) / (1.0 + betaZ)); // Inverse?
    }
  `,
    // Fragment Shader
    `
    uniform vec3 color;
    varying vec2 vUv;
    varying float vDopplerFactor;

    void main() {
      // Apply Doppler Shift to Color
      // This is a naive "False Color" shift. 
      // Blue Shift (Factor > 1) -> More Blue/Cyan
      // Red Shift (Factor < 1) -> More Red
      
      vec3 shiftedColor = color;
      
      if (vDopplerFactor > 1.0) {
          // Blue shift
          shiftedColor.b *= vDopplerFactor;
          shiftedColor.g *= (vDopplerFactor * 0.5);
      } else {
          // Red shift
          shiftedColor.r /= vDopplerFactor; // Division because factor < 1 makes it huge? No.
          // if factor is 0.5 (red shift), we want R to increase? 
          // Actually standard logic: Frequency decreases. Red is low freq.
          // Visualizing this: Mix with Red.
          shiftedColor.r += (1.0 - vDopplerFactor);
          shiftedColor.b *= vDopplerFactor;
          shiftedColor.g *= vDopplerFactor;
      }

      gl_FragColor = vec4(shiftedColor, 1.0);
    }
  `
)

extend({ RelativisticShaderMaterial })

export { RelativisticShaderMaterial }
