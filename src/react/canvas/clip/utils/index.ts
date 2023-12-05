type SelectPosi = {
  x: number;
  y: number;
  w: number;
  h: number;
};
export const getPixelRatio = (context: CanvasRenderingContext2D) => {
  const backingStore =
    context.backingStorePixelRatio ||
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    1;
  return (window.devicePixelRatio || 1) / backingStore;
};
export const getMousePosi = (x: number, y: number, w: number, h: number) => {
  return [
    // 左上 右上 右下 左下 四个点
    [x - 4, y - 4, 8, 8],
    [x + w - 4, y - 4, 8, 8],
    [x + w - 4, y + h - 4, 8, 8],
    [x - 4, y + h - 4, 8, 8],
    // 上 右 下 左 四条边
    [x - 4, y - 4, w + 4, 8],
    [x + w - 4, y - 4, 8, h + 4],
    [x - 4, y + h - 4, w + 4, 8],
    [x - 4, y - 4, 8, h + 4]
  ]
};
export const getAnewXY = (select: SelectPosi) => {
  return {
    x: select.x + (select.w < 0 ? select.w : 0),
    y: select.y + (select.h < 0 ? select.h : 0),
    w: Math.abs(select.w),
    h: Math.abs(select.h)
  };
};
export const handleMouseInfo = (
  i: number,
  select: SelectPosi,
  distance: Distance,
) => {
  const _select = { ...select };
  switch (i) {
    case 0:
      _select.x += distance.x;
      _select.y += distance.y;
      _select.w -= distance.x;
      _select.h -= distance.y;
      break;
    case 1:
      _select.y += distance.y;
      _select.w += distance.x;
      _select.h -= distance.y;
      break;
    case 2:
      _select.w += distance.x;
      _select.h += distance.y;
      break;
    case 3:
      _select.x += distance.x;
      _select.w -= distance.x;
      _select.h += distance.y;
      break;
    case 4:
      _select.y += distance.y;
      _select.h -= distance.y;
      break;
    case 5:
      _select.w += distance.x;
      break;
    case 6:
      _select.h += distance.y;
      break;
    case 7:
      _select.x += distance.x;
      _select.w -= distance.x;
      break;
    case 8:
      _select.x += distance.x;
      _select.y += distance.y;
      break;
    default:
      break;
  }

  return _select;
};
export const getCursorStyle = (i: number) => {
  let cursor = "default";
  switch (i) {
    case 0:
    case 2:
      cursor = "nwse-resize";
      break;
    case 1:
    case 3:
      cursor = "nesw-resize";
      break;
    case 4:
    case 6:
      cursor = "ns-resize";
      break;
    case 5:
    case 7:
      cursor = "ew-resize";
      break;
    case 8:
      cursor = "move";
      break;
    default:
      break;
  }
  return cursor;
};
