module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      ["@babel/preset-env", { targets: "defaults" }],
      ["@babel/preset-react", { runtime: "automatic" }],
      "@babel/preset-typescript"
    ],
    plugins: [
      'nativewind/babel',
      "@babel/plugin-transform-runtime"
    ],
  };
};
