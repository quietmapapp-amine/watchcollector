// super-light in-memory store for web preview
const mem = new Map<string, string>();

const AsyncStorage = {
  async getItem(k: string) { return mem.has(k) ? mem.get(k)! : null; },
  async setItem(k: string, v: string) { mem.set(k, v); },
  async removeItem(k: string) { mem.delete(k); },
  async clear() { mem.clear(); }
};

export default AsyncStorage;
