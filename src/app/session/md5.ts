export function md5(message: string): string {
    const data = new TextEncoder().encode(message);
    const bitLength = data.length * 8;
    const padLength = (data.length % 64 < 56) ? 56 - (data.length % 64) : 120 - (data.length % 64);
    const padded = new Uint8Array(data.length + padLength + 8);
    padded.set(data);
    padded[data.length] = 0x80;
    const view = new DataView(padded.buffer);
    view.setUint32(padded.length - 8, bitLength >>> 0, true);
    view.setUint32(padded.length - 4, Math.floor(bitLength / 0x100000000), true);

    let a0 = 0x67452301;
    let b0 = 0xefcdab89;
    let c0 = 0x98badcfe;
    let d0 = 0x10325476;
    const shift = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
    const k = Array.from({ length: 64 }, (_, index) => Math.floor(Math.abs(Math.sin(index + 1)) * 0x100000000));

    for (let offset = 0; offset < padded.length; offset += 64) {
        const words = new Uint32Array(16);
        for (let index = 0; index < 16; index++) {
            words[index] = view.getUint32(offset + index * 4, true);
        }
        let a = a0;
        let b = b0;
        let c = c0;
        let d = d0;
        for (let index = 0; index < 64; index++) {
            let mixed = 0;
            let source = 0;
            if (index < 16) {
                mixed = (b & c) | (~b & d);
                source = index;
            } else if (index < 32) {
                mixed = (d & b) | (~d & c);
                source = (5 * index + 1) % 16;
            } else if (index < 48) {
                mixed = b ^ c ^ d;
                source = (3 * index + 5) % 16;
            } else {
                mixed = c ^ (b | ~d);
                source = (7 * index) % 16;
            }
            const amount = shift[(index >>> 4) * 4 + (index % 4)];
            const sum = (mixed + a + k[index] + words[source]) >>> 0;
            const rotated = ((sum << amount) | (sum >>> (32 - amount))) >>> 0;
            a = d;
            d = c;
            c = b;
            b = (b + rotated) >>> 0;
        }
        a0 = (a0 + a) >>> 0;
        b0 = (b0 + b) >>> 0;
        c0 = (c0 + c) >>> 0;
        d0 = (d0 + d) >>> 0;
    }

    const out = new Uint8Array(16);
    const result = new DataView(out.buffer);
    result.setUint32(0, a0, true);
    result.setUint32(4, b0, true);
    result.setUint32(8, c0, true);
    result.setUint32(12, d0, true);
    return [...out].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function empreinteMotDePasse(value: string): string {
    return /^[a-f0-9]{32}$/.test(value) ? value : md5(value);
}
