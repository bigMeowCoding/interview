import React, { useEffect, useRef, useState } from "react";
import { FC } from "react";
import Layout from "./layout";
import styled from "styled-components";
import { Button } from "antd";
import {
  getAnewXY,
  getCursorStyle,
  getMousePosi,
  getPhotoData,
  getPixelRatio,
  handleMouseInfo,
} from "./utils";

const CanvasBox = styled.div`
  width: 500px;
  height: 500px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: url("${require("./image/mosaic.jpg")}") 100% 100%;

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
let canvasSize = {} as ICanvasSize;
let uploadFileCreateURL = "";
let initSize = {} as {
  width: number;
  height: number;
  proportion: number;
};
let uploadImageELement: HTMLImageElement;
export interface IImgSize {
  width: number;
  height: number;
}
export interface ICanvasSize {
  width: number;
  height: number;
}
let imgSize = {} as IImgSize;
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
  const canvasRef = useRef();
  const inputRef = useRef();

  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    init();
  }, []);
  function init() {
    initSize = {
      width: 500,
      height: 500,
      proportion: 1,
    };
    ctx = canvasRef.current.getContext("2d");
    ratio = getPixelRatio(ctx);
  }

  function drawImage() {
    const { width: canvasWidth, height: canvasHeight } = canvasSize;
    const { width: imgWidth, height: imgHeight } = imgSize;
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.drawImage(
      uploadImageELement,
      (canvasWidth - imgWidth * imgScale) / 2,
      (canvasHeight - imgHeight * imgScale) / 2,
      imgWidth * imgScale,
      imgHeight * imgScale,
    );
    ctx.restore();
  }

  function calcCanvasSize() {
    const { width: imageWidth, height: imageHeight } = imgSize;
    const canvasRenderWidth = Math.min(imageWidth * imgScale, initSize.width);
    const canvasRenderHeight = Math.min(
      imageHeight * imgScale,
      initSize.height,
    );
    canvasRef.current.style.width = `${canvasRenderWidth}px`;
    canvasRef.current.style.height = `${canvasRenderHeight}px`;
    canvasRef.current.width = ratio * canvasRenderWidth;
    canvasRef.current.height = ratio * canvasRenderHeight;
    ctx.scale(ratio, ratio);
    canvasSize = {
      width: canvasRenderWidth,
      height: canvasRenderHeight,
    };
    mousePosi = []; // 每次重置canvas清空
  }
  function initImage() {
    imgSize = {
      width: uploadImageELement.width,
      height: uploadImageELement.height,
    };
    const propotion = uploadImageELement.width / uploadImageELement.height;
    if (
      uploadImageELement.width < initSize.width &&
      uploadImageELement.height < initSize.height
    ) {
      imgScale = 1;
      return;
    }
    if (propotion > initSize.proportion) {
      imgScale = initSize.width / uploadImageELement.width;
    } else if (propotion < initSize.proportion) {
      imgScale = initSize.height / uploadImageELement.height;
    }
  }

  function handleChoiseImg(event) {
    if (uploadFileCreateURL) {
      window.URL.revokeObjectURL(uploadFileCreateURL); // 释放先前建立的URL
    }
    uploadFileCreateURL = window.URL.createObjectURL(inputRef.current.files[0]);
    uploadImageELement = new Image();
    uploadImageELement.src = uploadFileCreateURL;
    uploadImageELement.onload = function () {
      initImage();
      calcCanvasSize();
      drawImage();
    };
  }

  function checkInPath(posX: number, posY: number, mousePosiElement: number[]) {
    ctx.beginPath();
    // @ts-ignore
    ctx.rect(...mousePosiElement);

    const ret = ctx.isPointInPath(posX, posY);
    ctx.closePath();
    return ret;
  }

  function drawCover() {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,.5)";
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.globalCompositeOperation = "source-atop";
    ctx.restore();
  }

  function drawSelect(x, y, w, h) {
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    drawCover();
    ctx.save();
    ctx.clearRect(x, y, w, h);
    ctx.strokeStyle = "#5696f8";
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
    drawImage();

    mousePosi = getMousePosi(x, y, w, h);
    mousePosi.push([x, y, w, h]);
  }

  function mouseMove(e: React.MouseEvent) {
    if (!ctx || !canvasRef.current) {
      return;
    }
    console.log(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    let cursor = "crosshair";
    cursorIndex = 9;
    const posX = e.nativeEvent.offsetX,
      posY = e.nativeEvent.offsetY;

    // 1. 计算是从九个顶点哪个开始点击的，判断是什么操作，是在原来基础上拖拽还是重置，如果在操作点周围给cursorIndex
    for (let i = 0; i < mousePosi.length; i++) {
      if (checkInPath(posX * ratio, posY * ratio, mousePosi[i])) {
        // cursor = getCursorStyle(i);
        cursorIndex = i;
        break;
      }
    }

    canvasRef.current.style.cursor = cursor;
    if (!canChangeSelect) {
      return;
    }
    //2. 如果没被操作点捕捉到并且可以进行选项框操作就给默认index和初始点位
    if (resetSelect) {
      selectPosi = {
        x: initMousePosi.x,
        y: initMousePosi.y,
        w: 4,
        h: 4,
      };
      resetSelect = false;
      tempCursorIndex = 2;
    }

    const pahX = posX - initMousePosi.x;
    const pathY = posY - initMousePosi.y;
    selectPosi = handleMouseInfo(
      tempCursorIndex !== null ? tempCursorIndex : cursorIndex,
      selectPosi,
      { x: pahX, y: pathY },
    );
    // 3. 绘制选中框
    drawSelect(selectPosi.x, selectPosi.y, selectPosi.w, selectPosi.h);
    initMousePosi = {
      x: posX,
      y: posY,
    };
    if (tempCursorIndex === null) {
      tempCursorIndex = cursorIndex;
    }
  }

  function mouseDown(e: React.MouseEvent) {
    if (cursorIndex === 9) {
      resetSelect = true;
    }
    canChangeSelect = true;
    initMousePosi = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };
  }
  async function cancelChangeSelect() {
    if (canChangeSelect) {
      dataUrl && window.URL.revokeObjectURL(dataUrl);

      const photoData: Blob = await getPhotoData({
        imgSize,
        img: uploadImageELement,
        imgScale,
        selectPosi,
        canvasSize,
      });
      const newUrl = window.URL.createObjectURL(photoData);
      setDataUrl(newUrl);
    }
    canChangeSelect = false;
    tempCursorIndex = null;
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
