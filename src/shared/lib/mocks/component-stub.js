const React = require('react');

// 一个通用的空组件
const Stub = (props) => React.createElement('div', props);

// 创建一个万能代理对象
// 无论代码请求什么属性（如 DollarSign, CheckIcon 等），都返回这个 Stub 组件
const proxy = new Proxy(Stub, {
  get: (target, prop) => {
    if (prop === '__esModule') return true;
    if (prop === 'default') return Stub;
    return Stub;
  }
});

module.exports = proxy;
