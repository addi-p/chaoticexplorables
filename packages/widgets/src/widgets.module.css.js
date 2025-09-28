// Bare-ESM shim for CSS Modules. Real CSS is linked elsewhere.
// styles.foo -> "foo"
const styles = new Proxy({}, { get: (_o, k) => String(k) });
export default styles;