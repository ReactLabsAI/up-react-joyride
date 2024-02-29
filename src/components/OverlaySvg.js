import React from 'react';
import PropTypes from 'prop-types';

function _getScrollParent(element) {
  if (!element) {
    return null;
  }

  const isHtmlElement = element instanceof HTMLElement;
  const overflowY = isHtmlElement && window.getComputedStyle(element).overflowY;
  const isScrollable = overflowY !== 'hidden' && overflowY !== 'visible';

  if (isScrollable && element.scrollHeight >= element.clientHeight) {
    return element;
  }

  return _getScrollParent(element.parentElement);
}

function _getVisibleHeight(element, scrollParent) {
  const elementRect = element.getBoundingClientRect();
  let top = elementRect.y || elementRect.top;
  let bottom = elementRect.bottom || top + elementRect.height;

  if (scrollParent) {
    const scrollRect = scrollParent.getBoundingClientRect();
    const scrollTop = scrollRect.y || scrollRect.top;
    const scrollBottom = scrollRect.bottom || scrollTop + scrollRect.height;

    top = Math.max(top, scrollTop);
    bottom = Math.min(bottom, scrollBottom);
  }

  const height = Math.max(bottom - top, 0); // Default to 0 if height is negative

  return { y: top, height };
}

function getOpeningProperties(
  targetElement,
  modalOverlayOpeningPadding = 0,
  modalOverlayOpeningXOffset = 0,
  modalOverlayOpeningYOffset = 0,
  modalOverlayOpeningRadius = 0,
) {
  const scrollParent = _getScrollParent(targetElement);
  const { y, height } = _getVisibleHeight(targetElement, scrollParent);
  const { x, width, left } = targetElement.getBoundingClientRect();

  // getBoundingClientRect is not consistent. Some browsers use x and y, while others use left and top
  const openingProperties = {
    width: width + modalOverlayOpeningPadding * 2,
    height: height + modalOverlayOpeningPadding * 2,
    x: (x || left) + modalOverlayOpeningXOffset - modalOverlayOpeningPadding,
    y: y + modalOverlayOpeningYOffset - modalOverlayOpeningPadding,
    r: modalOverlayOpeningRadius,
  };

  return openingProperties;
}

function generateSvg(pathDefinition) {
  return `<svg><path d="${pathDefinition}" /></svg>`;
}

function getOverlay(element) {
  const targetElement = document.querySelector(element);
  const openingProperties = getOpeningProperties(targetElement);
  const pathDefinition = makeOverlayPath(openingProperties);
  const svg = generateSvg(pathDefinition);

  return svg;
}

function makeOverlayPath({ width, height, x = 0, y = 0, r = 0 }) {
  const { innerWidth: w, innerHeight: h } = window;
  const {
    topLeft = 0,
    topRight = 0,
    bottomRight = 0,
    bottomLeft = 0,
  } = typeof r === 'number' ? { topLeft: r, topRight: r, bottomRight: r, bottomLeft: r } : r;

  return `M${w},${h}\
    H0\
    V0\
    H${w}\
    V${h}\
    Z\
    M${x + topLeft},${y}\
    a${topLeft},${topLeft},0,0,0-${topLeft},${topLeft}\
    V${height + y - bottomLeft}\
    a${bottomLeft},${bottomLeft},0,0,0,${bottomLeft},${bottomLeft}\
    H${width + x - bottomRight}\
    a${bottomRight},${bottomRight},0,0,0,${bottomRight}-${bottomRight}\
    V${y + topRight}\
    a${topRight},${topRight},0,0,0-${topRight}-${topRight}\
    Z`;
}

function OverlaySvg({ width, height, x, y, r, styles, pstyles }) {
  console.log({ type: 'OverlaySvg props', width, height, x, y, r, styles, pstyles });
  const pathDefinition = React.useMemo(
    () => makeOverlayPath({ width, height, x, y, r }),
    [width, height, x, y, r],
  );
  return (
    <svg style={styles}>
      <path style={pstyles} d={pathDefinition} />
    </svg>
  );
}

OverlaySvg.propTypes = {
  height: PropTypes.number,
  pstyles: PropTypes.object,
  r: PropTypes.number,
  styles: PropTypes.object,
  width: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
};

export default OverlaySvg;
