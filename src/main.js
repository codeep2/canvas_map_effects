/*
 * @Author: MADAO
 * @Date: 2020-07-21 09:42:12
 * @LastEditors: MADAO
 * @LastEditTime: 2020-08-10 14:38:42
 * @Description: 主要js文件
 */
const app = {
  pointCanvas: document.querySelector('#point-canvas'),
  backCanvas: document.querySelector('#back-canvas'),
  trackCanvas: document.querySelector('#track-canvas'),
  pointCtx: null,
  backCtx: null,
  trackCtx: null,
  centerCoordinate: { x: 1201, y: 356 },
  progress: 0,
  coordinateGroup: [
    { x: 1282, y: 163 },
    { x: 1201, y: 356 },
    { x: 1226, y: 577 },
    { x: 1338, y: 713 },
    { x: 1060, y: 225 },
    { x: 1060, y: 491 },
    { x: 874, y: 271 },
    { x: 920, y: 669 },
    { x: 852, y: 597 },
    { x: 726, y: 491 },
    { x: 593, y: 121 },
    { x: 479, y: 627 },
    { x: 373, y: 345 },
    { x: 263, y: 261 },
    { x: 281, y: 411 },
    { x: 167, y: 145 }
  ],
  /**
 * 二次贝塞尔曲线方程
 * @param  {number} start 起点
 * @param  {number} controlPoint 曲度点
 * @param  {number} end 终点
 * @param  {number} progress 绘制进度(0-1)
 * @returns {number}
 */
  quadraticBezier (startPoint, controlPoint, endPoint, progress) {
    const k = 1 - progress
    return k * k * startPoint + 2 * (1 - progress) * progress * controlPoint + progress * progress * endPoint
  },

  drawCanvasBg () {
    return new Promise(resolve => {
      const bg = new Image()
      bg.src = './assets/images/map.png'
      bg.onload = () => {
        const { naturalWidth, naturalHeight } = bg
        ;[this.backCanvas, this.pointCanvas, this.trackCanvas].forEach(value => {
          value.width = naturalWidth
          value.height = naturalHeight
        })
        this.backCtx.drawImage(bg, 0, 0, naturalWidth, naturalHeight)
        this.pointCtx.globalAlpha = 0.95
        resolve()
      }
    })
  },

  drawCircle () {
    this.coordinateGroup.forEach(({ x, y, radius }, index, array) => {
      let newRadius = radius || 0
      this.pointCtx.beginPath()
      this.pointCtx.arc(x, y, newRadius, 0, 2 * Math.PI)
      this.pointCtx.closePath()
      this.pointCtx.strokeStyle = '#005086'
      this.pointCtx.lineWidth= 2
      this.pointCtx.stroke()
      newRadius += 0.5
      if (newRadius > 30) {
        newRadius = 0
      }
      array[index].radius = newRadius
    })
  },

  drawLine () {
    this.coordinateGroup.forEach(({ x, y }) => {
      if (x === this.centerCoordinate.x && y === this.centerCoordinate.y) {
        return
      }
      this.backCtx.strokeStyle = '#065446'
      this.backCtx.lineWidth = 1
      this.backCtx.moveTo(x, y)
      const controlPoint = {
        x: (x + this.centerCoordinate.x) / 2,
        y: y - 100
      }
      this.backCtx.quadraticCurveTo(controlPoint.x, controlPoint.y, this.centerCoordinate.x, this.centerCoordinate.y)
      this.backCtx.stroke()
    })
  },

  drawTrack () {
    this.trackCtx.clearRect(0, 0, this.backCanvas.width, this.backCanvas.height)
    this.coordinateGroup.forEach(({ x, y }) => {
      if (x === this.centerCoordinate.x && y === this.centerCoordinate.y) {
        return
      }
      const controlPoint = {
        x: (x + this.centerCoordinate.x) / 2,
        y: y - 100
      }
      const endPoint = {
        x: this.quadraticBezier(x, controlPoint.x, this.centerCoordinate.x, this.progress / 100),
        y: this.quadraticBezier(y, controlPoint.y, this.centerCoordinate.y, this.progress / 100)
      }
      const color = '#1f4068'
      this.trackCtx.beginPath()
      this.trackCtx.shadowColor = color;
      this.trackCtx.shadowBlur = 8;
      this.trackCtx.fillStyle = color;
      this.trackCtx.arc(endPoint.x, endPoint.y, 4, 0, 2 * Math.PI);
      this.trackCtx.fill();
    })
  },

  renderPoint () {
    this.pointCtx.globalCompositeOperation = 'destination-in'
    this.pointCtx.fillRect(0, 0, this.pointCanvas.width, this.pointCanvas.height)
    this.pointCtx.globalCompositeOperation = 'source-over'
    this.drawCircle()
  },

  rendTrack () {
    if (this.progress <= 100) {
      this.drawTrack()
      this.progress += 1
    } else {
      setTimeout(() => {
        this.progress = 0
        this.drawTrack()
      }, 200);
    }
  },

  render () {
    this.renderPoint()
    this.rendTrack()
    window.requestAnimationFrame(this.render.bind(this))
  },

  init () {
    this.pointCtx = this.pointCanvas.getContext('2d')
    this.trackCtx = this.trackCanvas.getContext('2d')
    this.backCtx = this.backCanvas.getContext('2d')
    this.drawCanvasBg()
      .then(() => {
        this.drawCircle()
        this.drawLine()
        this.render()
      })
  }
}

app.init()
