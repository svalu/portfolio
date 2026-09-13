/* global React */
const { useEffect, useState } = React;

function TweaksPanel({ tweaks, setTweak, visible, onClose }) {
  if (!visible) return null;
  const Group = ({ label, keyName, options }) => (
    <div className="tweaks-row">
      <label>{label}</label>
      <div className="tweaks-opts">
        {options.map(o => (
          <button key={o.v} className={tweaks[keyName]===o.v?'sel':''} onClick={() => setTweak(keyName, o.v)}>{o.l}</button>
        ))}
      </div>
    </div>
  );
  const colors = ['#0078D4','#8B5CF6','#1A9D4A','#E44A4A','#F7B32B','#22B8CF'];
  return (
    <div className="tweaks-panel">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
        <h4 style={{margin:0}}>Tweaks</h4>
        <button onClick={onClose} style={{border:0, background:'transparent', cursor:'pointer', fontSize:16, color:'var(--text-dim)'}}>×</button>
      </div>
      <Group label="Theme" keyName="theme" options={[
        {v:'bloom',l:'Bloom'},{v:'midnight',l:'Midnight'},{v:'graphite',l:'Graphite'},{v:'dawn',l:'Dawn'},{v:'ocean',l:'Ocean'},
      ]} />
      <Group label="Icons" keyName="iconStyle" options={[{v:'fluent',l:'Fluent'},{v:'flat',l:'Flat'},{v:'mono',l:'Mono'}]} />
      <Group label="Windows" keyName="windowStyle" options={[{v:'mica',l:'Mica'},{v:'solid',l:'Solid'},{v:'glass',l:'Glass'}]} />
      <Group label="Start menu" keyName="startMenuLayout" options={[{v:'grid',l:'Grid'},{v:'list',l:'List'}]} />
      <div className="tweaks-row">
        <label>Accent</label>
        <div className="tweaks-color-row">
          {colors.map(c => (
            <button key={c} className={tweaks.accent===c?'sel':''} style={{background:c}} onClick={() => setTweak('accent', c)}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function useEditMode(tweaks, setTweaks) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const onMsg = (e) => {
      if (!e.data) return;
      if (e.data.type === '__activate_edit_mode') setActive(true);
      if (e.data.type === '__deactivate_edit_mode') setActive(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const setTweak = (k, v) => {
    setTweaks((prev) => ({ ...prev, [k]: v }));
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
  };
  return { active, setActive, setTweak };
}

Object.assign(window, { TweaksPanel, useEditMode });
