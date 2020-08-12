/*
 * @Author: MADAO
 * @Date: 2020-07-21 09:42:12
 * @LastEditors: MADAO
 * @LastEditTime: 2020-08-12 17:19:58
 * @Description: 主要js文件
 */

(function () {
  const app = {
    backCanvas: document.querySelector('.back-canvas'),
    pointCanvas: document.querySelector('.point-canvas'),
    trackCanvas: document.querySelector('.track-canvas'),
    backContext: null,
    pointContext: null,
    trackContext: null,
    ratio: 2,
    progress: 0,
    centerCoordinate: null,
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
    * @param  {number} startPoint 起点
    * @param  {number} controlPoint 曲度点
    * @param  {number} endPoint 终点
    * @param  {number} progress 当前百分比(0-1)
    * @returns {number}
    */
    quadraticBezier (startPoint, controlPoint, endPoint, progress) {
      const { x: startPointX, y: startPointY } = startPoint;
      const { x: endPointX, y: endPointY } = endPoint;
      const { x: controlPointX, y: controlPointY } = controlPoint;
      const t = 1 - progress
      const x = t * t * startPointX + 2 * progress * t * controlPointX + progress * progress * endPointX
      const y = t * t * startPointY + 2 * progress * t * controlPointY + progress * progress * endPointY
      return { x, y }
    },

    // 做数值转换的原因是，绘制出的图形太迷糊了，所以使用2倍图
    numericalConversion (number) {
      return number * this.ratio
    },

    isCenterPoint (x, y) {
      return (x === this.centerCoordinate.x && y === this.centerCoordinate.y)
    },

    getControlPoint (x, y) {
      const controlPoint = {
        x: (x + this.centerCoordinate.x) / 2,
        y: y - this.numericalConversion(100)
      }
      return controlPoint
    },

    drawBg () {
      return new Promise(resolve => {
        const bgImage = new Image()
        bgImage.src = './assets/images/map.png'
        bgImage.onload = () => {
          const { naturalWidth, naturalHeight } = bgImage
          const width = this.numericalConversion(naturalWidth)
          const height = this.numericalConversion(naturalHeight)
          ;[this.backCanvas, this.pointCanvas, this.trackCanvas].forEach(value => {
            // 设置canvas的HTML属性width，height
            value.width = width
            value.height = height
            // 设置canvas的css属性width，height
            value.style.width = `${naturalWidth}px`
            value.style.height = `${naturalHeight}px`
          })

          this.backContext.drawImage(bgImage, 0, 0, width, height)
          this.pointContext.globalAlpha = 0.95
          resolve()
        }
      })
    },

    drawCircle () {
      this.coordinateGroup = this.coordinateGroup.map(({ x, y, radius = 0 }) => {
        this.pointContext.beginPath()
        this.pointContext.arc(x, y, radius, 0, 2 * Math.PI)
        this.pointContext.closePath()
        this.pointContext.strokeStyle = '#005086'
        this.pointContext.lineWidth= 4
        this.pointContext.stroke()
        radius += 1
        if (radius > 60) {
          radius = 0
        }
        return { x, y, radius }
      })
    },

    drawLine () {
      this.coordinateGroup.forEach(({ x, y }) => {
        // 中心点与中心点之间不需要连线
        if (this.isCenterPoint(x, y)) {
          return
        }
        this.backContext.strokeStyle = '#065446'
        this.backContext.lineWidth = this.numericalConversion(1)
        this.backContext.moveTo(x, y)
        const controlPoint = this.getControlPoint(x, y)
        this.backContext.quadraticCurveTo(controlPoint.x, controlPoint.y, this.centerCoordinate.x, this.centerCoordinate.y)
        this.backContext.stroke()
      })
    },

    drawTrack () {
      this.trackContext.clearRect(0, 0, this.backCanvas.width, this.backCanvas.height)
      this.coordinateGroup.forEach(({ x, y }) => {
        if (this.isCenterPoint(x, y)) {
          return
        }
        const controlPoint = this.getControlPoint(x, y)
        const endPoint = this.quadraticBezier({ x, y }, controlPoint, this.centerCoordinate, this.progress / 100)
        const color = '#1f4068'
        this.trackContext.beginPath()
        this.trackContext.shadowColor = color;
        this.trackContext.shadowBlur = this.numericalConversion(8);
        this.trackContext.fillStyle = color;
        this.trackContext.arc(endPoint.x, endPoint.y, this.numericalConversion(4), 0, 2 * Math.PI);
        this.trackContext.fill();
      })
    },

    setCoordinateGroup () {
      this.coordinateGroup = this.coordinateGroup.map(({ x, y }) => (
        { x: this.numericalConversion(x), y: this.numericalConversion(y) }
      ))
    },

    renderPoint () {
      this.pointContext.globalCompositeOperation = 'destination-in'
      this.pointContext.fillRect(0, 0, this.pointCanvas.width, this.pointCanvas.height)
      this.pointContext.globalCompositeOperation = 'source-over'
      this.drawCircle()
    },
    rendTrack () {
      if (this.progress <= 100) {
        this.drawTrack()
        this.progress += 1
        return
      }
      setTimeout(() => {
        this.progress = 0
        this.drawTrack()
      }, 200);
    },

    render () {
      this.renderPoint()
      this.rendTrack()
      window.requestAnimationFrame(this.render.bind(this))
    },

    init () {
      this.backContext = this.backCanvas.getContext('2d')
      this.pointContext = this.pointCanvas.getContext('2d')
      this.trackContext = this.trackCanvas.getContext('2d')
      this.setCoordinateGroup()
      this.centerCoordinate = {
        x: this.numericalConversion(1201),
        y: this.numericalConversion(356)
      }
      // 画背景
      this.drawBg().then(() => {
        // 绘制连线
        this.drawLine()
        // 启动动画
        this.render()
      })
    }
  }

  app.init()
})()
