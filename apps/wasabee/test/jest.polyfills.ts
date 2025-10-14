import { TextEncoder, TextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
  (global as any).TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  (global as any).TextDecoder = TextDecoder as any;
}

// Polyfill for structuredClone
if (typeof global.structuredClone === 'undefined') {
  (global as any).structuredClone = (obj: any) => {
    return JSON.parse(JSON.stringify(obj));
  };
}
