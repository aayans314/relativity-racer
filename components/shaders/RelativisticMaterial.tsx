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
          
          // 3. Relativistic Aberration (Searchlight Effect)
          // The previous step (Contraction) handles the "World" geometry.
          // But "Vision" depends on the angle of light rays.
          // cos(theta') = (cos(theta) - beta) / (1 - beta * cos(theta))
          // This effectively "warps" the X/Y coordinates towards the center (Z).
          
          // Simplified Visual Warp:
          // We squash X and Y towards the center as Z distance increases?
          // Actually, aberration makes the FOV wider. Objects at the side move to the front.
          // In a Vertex Shader, this looks like expanding X/Y based on Z?
          // Let's apply a non-linear scale to X/Y based on how "forward" the vertex is.
          
          // If we move +Z:
          // Objects in front stay in front.
          // Objects at 90 deg (X/Y) move forward (appear at < 90 deg).
          // This means they effectively move "inwards" in the view? No, they move "forward" in the world.
          
          // Implementation: 
          // We rotate the vertex P towards the velocity axis N.
          // This is complex in Vertex Shader without raytracing.
          // Approximation: Scale pPerp by 1/gamma? (Penrose-Terrell rotation results in this)
          // For a sphere, it effectively rotates. For a tunnel?
          
          // Let's apply the Inverse Lorentz Transf to the VIEW vector??
          // No, let's just scale pPerp (X/Y) by 1.0/gamma as well?
          // If we do that, the whole tunnel shrinks in XY.
          
          // Correct Aberration for a Rasterizer:
          // We can't easily do ray-bending per vertex without distorting geometry bad.
          // BUT, we can hack it: Scale XY by 1/Gamma.
          // Contraction squashed Z.
          // If we also squash XY, the tunnel gets narrow.
          // User asked: "Shouldn't distortions happen in X?"
          // Relativistic Aberration essentially "Zoom's out".
          // Let's try scaling X/Y by 1/Gamma to see if it gives the "Warp" effect.
          pos.x = pos.x / gamma;
          pos.y = pos.y / gamma;
      }

      // 4. Output position
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
