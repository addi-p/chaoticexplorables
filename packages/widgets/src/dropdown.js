// Lightweight dropdown widget (API mirrors slider/toggle style)
export default function dropdown() {
  let _id = 'dropdown';
  let _label = '';
  let _options = []; // array of {label, value} or strings
  let _value = undefined;
  let _onUpdate = null;

  // element is created in dropdownElement
  const api = {
    element: null,
    id(x){ if (!arguments.length) return _id; _id = String(x); return api; },
    label(x){ if (!arguments.length) return _label; _label = x ?? ''; return api; },
    options(arr){
      if (!arguments.length) return _options;
      _options = Array.from(arr || []).map(o => (typeof o === 'object' ? o : {label:String(o), value:o}));
      if (_options.length && _value === undefined) _value = _options[0].value;
      return api;
    },
    value(v){
      if (!arguments.length) return _value;
      _value = v;
      if (api.element) {
        const sel = api.element.querySelector('select');
        if (sel && sel.value !== String(v)) sel.value = String(v);
      }
      return api;
    },
    update(fn){ _onUpdate = fn; return api; },

    // internal hooks used by element factory
    _label(){ return _label; },
    _id(){ return _id; },
    _opts(){ return _options; },
    _notify(){
      if (_onUpdate) _onUpdate();
    }
  };
  return api;
}