import { RelativisticPhysics } from './Relativity';

describe('Relativistic Physics Engine', () => {

    test('Velocity Addition: Adding small velocities approximates Newtonian', () => {
        // 0.1c + 0.1c should be slightly less than 0.2c due to relativity, but close
        const v = RelativisticPhysics.addVelocities(0.1, 0.1);
        expect(v).toBeCloseTo(0.198, 3);
        // Exact: (0.1+0.1)/(1+0.01) = 0.2/1.01 = 0.1980198
    });

    test('Velocity Addition: Adding high velocities never exceeds C', () => {
        // 0.9c + 0.9c
        const v = RelativisticPhysics.addVelocities(0.9, 0.9);
        expect(v).toBeLessThan(1.0);
        expect(v).toBeGreaterThan(0.99);
        // Exact: 1.8 / 1.81 = 0.99447
    });

    test('Gamma Factor: Increases correctly', () => {
        expect(RelativisticPhysics.getGamma(0)).toBe(1);
        const gamma05 = RelativisticPhysics.getGamma(0.5); // 1 / sqrt(0.75) = 1.154
        expect(gamma05).toBeCloseTo(1.1547, 3);

        const gamma099 = RelativisticPhysics.getGamma(0.99); // 1 / sqrt(1 - 0.9801) = 1 / sqrt(0.0199) = 7.08
        expect(gamma099).toBeGreaterThan(7.0);
    });

    test('Doppler Factor: Blue Shift vs Red Shift', () => {
        // Approaching (Positive V in our model? Or wait, standard formula context)
        // Formula implemented: sqrt((1+beta)/(1-beta))
        // If beta > 0 => >1 (Blue)
        const blueShift = RelativisticPhysics.getDopplerFactor(0.5);
        expect(blueShift).toBeGreaterThan(1.0);
        expect(blueShift).toBeCloseTo(1.732, 3); // sqrt(1.5/0.5) = sqrt(3) = 1.732

        // Receding (Negative beta)
        const redShift = RelativisticPhysics.getDopplerFactor(-0.5);
        expect(redShift).toBeLessThan(1.0);
        expect(redShift).toBeCloseTo(0.577, 3); // sqrt(0.5/1.5) = sqrt(1/3) = 0.577
    });

});
