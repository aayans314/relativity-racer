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
      
      // 1. Calculate Gamma
      float betaSq = dot(velocity, velocity);
      betaSq = min(betaSq, 0.999);
      float gamma = 1.0 / sqrt(1.0 - betaSq);

      // 2. Transfrom to WORLD SPACE first
      // We want to contract the entire world, not just the local mesh.
      vec4 worldPosEx = modelMatrix * vec4(position, 1.0);
      vec3 worldPos = worldPosEx.xyz;
      
      // 3. Perform Lorentz Contraction (in World Space)
      float vMag = length(velocity);
      if (vMag > 0.001) {
          vec3 n = normalize(velocity);
          
          // Project world position onto velocity vector
          float pParallelMag = dot(worldPos, n);
          vec3 pParallel = pParallelMag * n;
          vec3 pPerp = worldPos - pParallel;
          
          // Contract
          worldPos = pPerp + (pParallel / gamma);
          
          // Aberration (Scale X/Y in World Space)
          // We must be careful. If we warp World Space X/Y towards 0, 
          // we are warping towards World Origin (0,0,0).
          // This assumes the camera is at 0,0,0.
          // Since our Camera IS at 0,0,0 in this game (tunnel moves), this works!
          
          // Apply inverse gamma scale to perpendicular components relative to view direction?
          // Approximate with standard XYZ scaling
          // Actually, since we aligned 'n' with Z-axis mostly:
          // We can just find the component perpendicular to n and scale it?
          // We already have pPerp.
          
          // Simple Aberration: Expand pPerp by gamma? 
          // No, shrink it by gamma?
          // Earlier we did pos.x /= gamma.
          // Let's modify pPerp directly.
          
          // Note: pPerp contains the world X and Y coordinates (if v is Z).
          // So scaling pPerp scales the tunnel radius.
           worldPos = (pPerp / gamma) + (pParallel / gamma);
      }

      // 4. Output position (Use View and Projection on the Modified World Pos)
      gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
      
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
          shiftedColor.r /= vDopplerFactor; 
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
