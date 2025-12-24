export const C = 1.0; // We normalize speed of light to 1.0 for the simulation

/**
 * Handles Special Relativity calculations.
 * Uses "Rapidity" (theta) internally to naturally prevent exceeding C.
 * Rapidity ranges from -Infinity to +Infinity.
 * Velocity (beta) ranges from -1 to 1.
 */
export class RelativisticPhysics {
  /**
   * Converts spatial Velocity (beta = v/c) to Rapidity (theta).
   */
  static velocityToRapidity(beta: number): number {
    // Clamp to avoid NaN at exactly C
    const safeBeta = Math.max(-0.99999, Math.min(0.99999, beta));
    return Math.atanh(safeBeta);
  }

  /**
   * Converts Rapidity (theta) to spatial Velocity (beta).
   */
  static rapidityToVelocity(theta: number): number {
    return Math.tanh(theta);
  }

  /**
   * Calculates the Lorentz Factor (Gamma) from Velocity (beta).
   * Gamma explodes as beta -> 1.
   */
  static getGamma(beta: number): number {
    return 1 / Math.sqrt(1 - beta * beta);
  }

  /**
   * Relativistic Velocity Addition.
   * Naive addition: v = v1 + v2 (WRONG at high speeds)
   * Rapidity addition: theta = theta1 + theta2 (CORRECT)
   */
  static addVelocities(v1: number, v2: number): number {
    const theta1 = this.velocityToRapidity(v1);
    const theta2 = this.velocityToRapidity(v2);
    return this.rapidityToVelocity(theta1 + theta2);
  }

  /**
   * Calculates the Doppler Factor.
   * > 1 means Blue Shift (Moving towards)
   * < 1 means Red Shift (Moving away)
   * @param beta Velocity relative to observer (+ is towards, - is away usually, 
   * but standard formula: sqrt((1+v)/(1-v)) generally implies v is approach velocity)
   */
  static getDopplerFactor(beta: number): number {
    return Math.sqrt((1 + beta) / (1 - beta));
  }
}
