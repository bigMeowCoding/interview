import { ICanvasSize, IImgSize } from "../index";

export type ISelectPosi = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Distance = {
  x: number;
  y: number;
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
    [x - 4, y - 4, 8, 8],
    [x + w - 4, y - 4, 8, 8],
    [x + w - 4, y + h - 4, 8, 8],
    [x - 4, y + h - 4, 8, 8],

    [x - 4, y - 4, w + 4, 8],
    [x + w - 4, y - 4, 8, h + 4],
    [x - 4, y + h - 4, w + 4, 8],
    [x - 4, y - 4, 8, h + 4],
  ];
};
export const getAnewXY = (select: ISelectPosi) => {
  return {
    x: select.x + (select.w < 0 ? select.w : 0),
    y: select.y + (select.h < 0 ? select.h : 0),
    w: Math.abs(select.w),
    h: Math.abs(select.h),
  };
};
/**
 *
 *
 */
export const handleMouseInfo = (
  i: number,
  select: ISelectPosi,
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
      _select.h -= distance.y;
      _select.y += distance.y;
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
  }
  return _select;
};
export const getCursorStyle = (i: number) => {};

export function getPhotoData(option: {
  imgSize: IImgSize;
  img: HTMLImageElement;
  canvasSize: ICanvasSize;
  imgScale: number;
  rotate: number;
  grayscale: boolean;
  selectPosi: ISelectPosi;
}): Promise<Blob> {
  const { imgSize, grayscale, img, rotate, canvasSize, imgScale, selectPosi } =
    option;
  // console.log("option", option);
  const canvasEl = document.createElement("canvas");
  const ctx = canvasEl.getContext("2d");
  // document.body.appendChild(canvasEl)
  let { width: imgWidth, height: imgHeight } = imgSize;
  if (rotate % 180 !== 0) {
    [imgWidth, imgHeight] = [imgHeight, imgWidth];
  }
  canvasEl.width = imgWidth;
  canvasEl.height = imgHeight;
  ctx.save();
  if (rotate % 180 !== 0) {
    [imgWidth, imgHeight] = [imgHeight, imgWidth];
  }
  ctx.translate(canvasEl.width / 2, canvasEl.height / 2);
  ctx.rotate((Math.PI / 180) * rotate);
  ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);

  // ctx.rect(0,0,100,100)
  // ctx.strokeStyle='blue'
  // ctx.stroke()

  // console.log(-1*canvasEl.width  / 2, -1* canvasEl.height / 2,'t2')
  // ctx.rect(0,0,200,200)
  // ctx.strokeStyle='red'
  // ctx.stroke()

  ctx.restore();
  if (rotate % 180 !== 0) {
    [imgWidth, imgHeight] = [imgHeight, imgWidth];
  }
  const putX =
    (imgWidth - canvasSize.width / imgScale) / 2 + selectPosi.x / imgScale;
  const putY =
    (imgHeight - canvasSize.height / imgScale) / 2 + selectPosi.y / imgScale;
  const putW = selectPosi.w / imgScale;
  const putH = selectPosi.h / imgScale;
  let imgData = ctx.getImageData(putX, putY, putW, putH);

  if (grayscale) {
    getGrayData(imgData);
  }
  canvasEl.width = putW;
  canvasEl.height = putH;
  ctx.putImageData(imgData, 0, 0);
  return new Promise((res, rej) => {
    canvasEl.toBlob((e) => res(e));
  });
}
export function getGrayData(imageData:ImageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grayScale = (data[i] + data[i + 1] * 2 + data[i + 2]) >> 2;
    data[i] = grayScale;
    data[i + 1] = grayScale;
    data[i + 2] = grayScale;
  }
  return data;
}
