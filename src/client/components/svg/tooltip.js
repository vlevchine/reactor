import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const tooltip_shiftX = 16,
  tooltip_x_margin = 20,
  tooltip_pad = 8,
  tooltip_line_height = 20,
  rd = 2;

export default function Tooltip({ lines = 0, title }) {
  const hoverOver = useRef(),
    tooltip = useRef(),
    height = tooltip_pad + tooltip_line_height * lines,
    hide = () => {
      if (hoverOver.current) hoverOver.current = undefined;
      tooltip.current.setAttributeNS(null, 'visibility', 'hidden');
    },
    show = ({ detail }) => {
      const { content, mousePos, posInBox } = detail,
        tip = tooltip.current;

      if (!hoverOver.current) {
        const text = tip.lastChild,
          txt_lines = [...text.childNodes],
          under = tip.firstChild,
          over = under.nextSibling;
        if (title) txt_lines[0].classList.add('title');
        content.forEach((e, i) => (txt_lines[i].firstChild.data = e));
        hoverOver.current =
          Math.max(
            ...txt_lines.map((e) => e.getComputedTextLength())
          ) + tooltip_x_margin;
        under.setAttributeNS(null, 'width', hoverOver.current);
        over.setAttributeNS(null, 'width', hoverOver.current - 2);
        tip.setAttributeNS(null, 'visibility', 'visible');
      }

      const { x, y } = mousePos,
        tooltip_totalY = height + tooltip_line_height,
        tooltip_totalX = hoverOver.current + tooltip_line_height,
        shiftY =
          posInBox.y < tooltip_totalY
            ? -tooltip_totalY
            : tooltip_line_height,
        shiftX =
          posInBox.x < tooltip_totalX
            ? -tooltip_totalX
            : tooltip_shiftX;

      tip.setAttributeNS(
        null,
        'transform',
        `translate(${x + shiftX} ${y + shiftY})`
      );
      // tooltip.current.setAttributeNS(null, 'x', x+ 16 );
      // tooltip.current.setAttributeNS(null, 'y', y + 20);
      // hideTooltip = () => {
      //   tooltip.current.setAttributeNS(null, 'visibility', 'hidden');
    };

  useEffect(() => {
    document.addEventListener('showTooltip', show);
    document.addEventListener('hideTooltip', hide);
    return () => {
      document.removeEventListener('showTooltip', show);
      document.removeEventListener('hideTooltip', hide);
    };
  });
  return (
    <g
      ref={tooltip}
      transform="translate(0 0)"
      className="svg-tip"
      visibility="hidden">
      <rect
        width={height}
        height={height}
        fill="black"
        opacity="0.4"
        rx={rd}
        ry={rd}
      />
      <rect
        x="1"
        y="1"
        width={height - 2}
        height={height - 2}
        fill="white"
        rx={rd}
        ry={rd}
      />
      <text y={tooltip_pad - tooltip_line_height}>
        {[
          [...Array(lines)].map((e, i) => (
            <tspan key={i} x={tooltip_pad} dy={tooltip_line_height}>
              {'t' + i}
            </tspan>
          )),
        ]}
      </text>
    </g>
  );
}

Tooltip.propTypes = {
  enable: PropTypes.bool,
  start: PropTypes.instanceOf(Date),
  locale: PropTypes.string,
  title: PropTypes.bool,
  lines: PropTypes.number,
  content: PropTypes.func,
};

// function placeTri(x, y, width = 10, up) {
//   return (
//     <polygon
//       points={`${x},${y},${x + width},${y},${x + width / 2},${
//         up ? y - width : y + width
//       }`}
//       className="edge"></polygon>
//   );
// }
// tr = tip.transform.baseVal.getItem(0);

// Ensure the first transform is a translate transform
// if (
//   transforms.length === 0 ||
//   transforms.getItem(0).type !==
//     SVGTransform.SVG_TRANSFORM_TRANSLATE
// ) {
//   // Create an transform that translates by (0, 0)
//   var translate = svg.createSVGTransform();
//   translate.setTranslate(0, 0);
//   // Add the translation to the front of the transforms list
//   tip.transform.baseVal.insertItemBefore(translate, 0);
// }
