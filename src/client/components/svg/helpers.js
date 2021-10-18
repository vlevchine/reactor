export function getMousePosition(ev, svg) {
  var CTM = svg.getScreenCTM();
  return {
    x: (ev.clientX - CTM.e) / CTM.a,
    y: (ev.clientY - CTM.f) / CTM.d,
  };
}
