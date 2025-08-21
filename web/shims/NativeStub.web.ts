const noop = () => {};
export const NativeModuleStub = new Proxy({}, { get: () => noop });
export default NativeModuleStub;
