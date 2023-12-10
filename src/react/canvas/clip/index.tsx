import React, { useEffect, useRef, useState } from "react";
import { FC } from "react";
import Layout from "./layout";
import styled from "styled-components";
import { Button } from "antd";
import {
  getAnewXY,
  getCursorStyle,
  getMousePosi,
  getPixelRatio,
  handleMouseInfo,
} from "./utils";

const CanvasBox = styled.div`
  width: 500px;
  height: 500px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const OperationBox = styled.div`
  margin-left: 35px;
  width: 200px;
  display: flex;
  flex-direction: column;

  .img-box {
    width: 144px;
    height: 144px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      max-width: 144px;
      max-height: 144px;
    }
  }

  button {
    margin: 20px 10px 0 0;
    width: 80px;
    border-radius: 2px;
    position: relative;
  }

  input {
    width: 100%;
    height: 100%;
    font-size: 0;
    position: absolute;
    left: 0;
    top: 0;
    outline: none;
    opacity: 0;
    cursor: pointer;
  }
`;

let ratio: number;
let mousePosi: number[][] = [];

let ctx: CanvasRenderingContext2D;
let canvasSize = {} as {
  width: number;
  height: number;
};
let createURL = "";
let initSize = {} as {
  width: number;
  height: number;
  proportion: number;
};
let img: HTMLImageElement;
let imgSize = {} as {
  width: number;
  height: number;
};
let imgScale: number; // 图片缩放比

let selectPosi = {
  x: 0,
  y: 0,
  w: 0,
  h: 0,
};
let canChangeSelect: boolean = false;
let initMousePosi: {
  x: number;
  y: number;
};
let cursorIndex: number;
let tempCursorIndex: number | null = null;
let resetSelect: boolean = false;

interface Props {}

const ClipDemo: FC<Props> = () => {
  const [dataUrl, setDataUrl] = useState<string>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 设置像素分配比例
  function init() {
    try {
      initSize = {
        width: 500, //canvasRef.current!.clientWidth,
        height: 500, //canvasRef.current!.clientHeight,
        proportion: 1, //canvasRef.current!.clientWidth / canvasRef.current!.clientHeight
      };

      ctx = canvasRef.current!.getContext("2d") as CanvasRenderingContext2D;
      ratio = getPixelRatio(ctx);
    } catch (e) {
      alert("浏览器不支持canvas");
    }
  }

  useEffect(() => {
    init();
  }, []);

  const checkInPath = (pathX: number, pathY: number, rectPosi: number[]) => {
    ctx.beginPath();
    // @ts-ignore
    ctx.rect(...rectPosi);
    const result = ctx.isPointInPath(pathX, pathY);
    ctx.closePath();
    return result;
  };

  const drawCover = () => {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.globalCompositeOperation = "source-atop";
    ctx.restore();
  };
  function drawSelect(x: number, y: number, w: number, h: number) {
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    drawCover();
    ctx.save();
    ctx.clearRect(x, y, w, h);
    // ctx.strokeStyle = "#5696f8";
    // ctx.strokeRect(x, y, w, h);
    //
    // ctx.fillStyle = "#5696f8";
    // //@ts-ignore
    //
    // ctx.lineWidth = 1;
    // ctx.strokeStyle = "rgba(255, 255, 255, .75)";
    //
    ctx.restore();
    //

    drawImage();
    //
    mousePosi = getMousePosi(x, y, w, h);
    mousePosi.push([selectPosi.x, selectPosi.y, selectPosi.w, selectPosi.h]);
  }

  function mouseMove(e) {
    // console.log("mouseMove=====", e.nativeEvent);
    if (!ctx || !canvasRef.current) {
      return;
    }
    const { offsetX, offsetY } = e.nativeEvent;
    const pathX = offsetX * ratio;
    const pathY = offsetY * ratio; // 判断点是否在路径中需要比例
    let cursor = "crosshair";
    cursorIndex = 9;
    // console.log("mousepo", mousePosi);
    console.log("mouseMove=====", e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    console.log(mousePosi, "moueposiiii");
    for (let i = 0; i < mousePosi.length; i++) {
      if (checkInPath(pathX, pathY, mousePosi[i])) {
        cursor = getCursorStyle(i);
        cursorIndex = i;
        break;
      }
    }

    canvasRef.current.style.cursor = cursor;
    if (!canChangeSelect) {
      return;
    }

    if (resetSelect) {
      selectPosi = {
        x: initMousePosi.x,
        y: initMousePosi.y,
        w: 4,
        h: 4,
      };
      tempCursorIndex = 2;
      resetSelect = false;
    }

    const distanceX = offsetX - initMousePosi.x;
    const distanceY = offsetY - initMousePosi.y;

    selectPosi = handleMouseInfo(
      tempCursorIndex !== null ? tempCursorIndex : cursorIndex,
      selectPosi,
      { x: distanceX, y: distanceY },
    );
    // console.log("dddddd", selectPosi, tempCursorIndex, cursorIndex);
    drawSelect(selectPosi.x, selectPosi.y, selectPosi.w, selectPosi.h);

    initMousePosi = {
      x: offsetX,
      y: offsetY,
    };
    //
    if (tempCursorIndex === null) {
      tempCursorIndex = cursorIndex;
    }
  }

  function mouseDown(e) {
    console.log("mouseDown=====", e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    if (cursorIndex === 9) {
      resetSelect = true;
    }
    canChangeSelect = true;
    initMousePosi = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };
  }
  const cancelChangeSelect = async () => {
    // if (selectPosi.w < 0 || selectPosi.h < 0) {
    //   // selectPosi = getAnewXY(selectPosi);
    //   const { x, y, w, h } = selectPosi;
    //   mousePosi = getMousePosi(x, y, w, h);
    // }

    // if (canChangeSelect) {
    //   dataUrl && window.URL.revokeObjectURL(dataUrl);
    //   const blob = (await getPhotoData({
    //     imgSize,
    //     rotate,
    //     img,
    //     canvasSize,
    //     imgScale,
    //     selectPosi,
    //     grayscale,
    //   })) as Blob;
    //   const newDataUrl = window.URL.createObjectURL(blob);
    //   setDataUrl(newDataUrl);
    // }

    canChangeSelect = false;
    tempCursorIndex = null;
  };

  /**
   * 1. 计算图片scale
   * 2. 设置imgsize
   *
   */
  function initImageCanvas(img: HTMLImageElement) {
    const { width: imgWidth, height: imgHeight } = img;
    const propotion = imgWidth / imgHeight;
    imgSize = {
      width: imgWidth,
      height: imgHeight,
    };
    if (propotion > initSize.proportion) {
      imgScale = initSize.width / imgWidth;
    } else {
      imgScale = initSize.height / imgHeight;
    }
  }

  /**
   * 1. 设置canvasRef 尺寸
   * 2. 社会ctx比例
   * 3. 设置canvasSize
   * 5. 清空鼠标位置记录
   */
  function calcCanvasSize() {
    if (!canvasRef.current) {
      return;
    }
    let canvasWidth = Math.min(initSize.width, imgSize.width * imgScale);
    let canvasHeight = Math.min(initSize.height, imgSize.height * imgScale);
    canvasRef.current.style.width = `${canvasWidth}px`;
    canvasRef.current.style.height = `${canvasHeight}px`;
    canvasRef.current.width = canvasWidth * ratio;
    canvasRef.current.height = canvasHeight * ratio;
    ctx.scale(ratio, ratio); // 画布宽高设置比例后，这里也要有
    canvasSize = {
      width: canvasWidth,
      height: canvasHeight,
    };
    mousePosi = [];
  }

  function drawImage() {
    let { width, height } = canvasSize;
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";

    const imgWidth = imgSize.width * imgScale;
    const imgHeight = imgSize.height * imgScale;

    ctx.drawImage(
      img,
      (width - imgWidth) / 2,
      (height - imgHeight) / 2, // 居中
      imgWidth,
      imgHeight,
    );
    ctx.restore();
  }
  /**
   * 1. 利用URL.createObjectURL 创建本地图片url
   * 2. 加载图片
   * 3. 分配图片和canvas比例
   * 4. 渲染图片
   */
  function handleChoiseImg() {
    if (createURL) {
      window.URL.revokeObjectURL(createURL);
    }
    createURL = window.URL.createObjectURL(inputRef.current.files[0]);

    img = new Image();
    img.onload = () => {
      initImageCanvas(img);
      calcCanvasSize();
      drawImage();
    };
    img.src = createURL;
  }

  return (
    <>
      <Layout
        event={{
          onMouseUp: cancelChangeSelect,
        }}
      >
        <CanvasBox>
          <canvas
            ref={canvasRef}
            onMouseMove={mouseMove}
            onMouseDown={mouseDown}
          >
            浏览器不支持canvas
          </canvas>
        </CanvasBox>
        <OperationBox>
          <div className="img-box">
            {dataUrl ? <img src={dataUrl} alt="canvas" /> : null}
          </div>
          <Button type="primary" ghost>
            <input
              ref={inputRef}
              type="file"
              onChange={handleChoiseImg}
              accept="image/gif,image/jpeg,image/jpg,image/png,image/svg"
            />
            选择图片
          </Button>
          {/*<div>*/}
          {/*  <Button type="primary" onClick={handleScale.bind(null, true)} ghost>*/}
          {/*    放大*/}
          {/*  </Button>*/}
          {/*  <Button*/}
          {/*    type="primary"*/}
          {/*    onClick={handleScale.bind(null, false)}*/}
          {/*    ghost*/}
          {/*  >*/}
          {/*    缩小*/}
          {/*  </Button>*/}
          {/*</div>*/}
          {/*<Button type="primary" onClick={handleRotate} ghost>*/}
          {/*  旋转*/}
          {/*</Button>*/}
          {/*<Button type="primary" onClick={handleGrayscale} ghost>*/}
          {/*  灰度*/}
          {/*</Button>*/}
          {/*<Button type="primary" onClick={handleReset} ghost>*/}
          {/*  重置*/}
          {/*</Button>*/}
          {/*<Button type="primary" ghost>*/}
          {/*  <a href={dataUrl} download="canvas.png">*/}
          {/*    下载*/}
          {/*  </a>*/}
          {/*</Button>*/}
        </OperationBox>
      </Layout>
    </>
  );
};

export default ClipDemo;
