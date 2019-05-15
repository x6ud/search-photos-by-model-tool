export function quaternion(yaw, pitch, roll) {
    const cy = Math.cos(yaw * 0.5);
    const sy = Math.sin(yaw * 0.5);
    const cp = Math.cos(pitch * 0.5);
    const sp = Math.sin(pitch * 0.5);
    const cr = Math.cos(roll * 0.5);
    const sr = Math.sin(roll * 0.5);
    return {
        x: cy * cp * cr + sy * sp * sr,
        y: cy * cp * sr - sy * sp * cr,
        z: sy * cp * sr + cy * sp * cr,
        w: sy * cp * cr - cy * sp * sr
    };
}

const DEG_2_RAD = 1 / 180 * Math.PI;

export function angEulerToQuaternion(x, y, z) {
    return quaternion(z * DEG_2_RAD, y * DEG_2_RAD, x * DEG_2_RAD);
}

export function distance(q1, q2) {
    const prod = q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;
    return 1 - prod * prod;
}
