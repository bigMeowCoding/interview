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
let canvasSize = {} as {
  width: number;
  height: number;
};
let uploadFileCreateURL = "";
let initSize = {} as {
  width: number;
  height: number;
  proportion: number;
};
let uploadImageELement: HTMLImageElement;
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
    console.log(canvasWidth, canvasHeight, imgWidth, imgHeight, imgScale);
    ctx.save();
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
    console.log(event);
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

  function mouseMove() {}

  function mouseDown() {}
  function cancelChangeSelect() {}
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
