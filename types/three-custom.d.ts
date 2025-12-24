import { Object3DNode } from '@react-three/fiber'
import { RelativisticShaderMaterial } from '@/components/shaders/RelativisticMaterial'

declare module '@react-three/fiber' {
    interface ThreeElements {
        relativisticShaderMaterial: Object3DNode<THREE.ShaderMaterial, typeof RelativisticShaderMaterial>
    }
}
