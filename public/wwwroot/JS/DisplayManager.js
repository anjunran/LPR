class DisplayManager {
  constructor() {
    this.display = null;
    this.canvas = null;
  }

  initializeDisplays() {
    this.setVideoPlayer();
    this.setCanvasPlayer();
  }

  setVideoPlayer(playerId = "#video") {
    this.display = document.querySelector(playerId);
    if (!this.display) {
      console.warn(`Video player with ID "${playerId}" not found.`);
    }
  }

  setSourceFile(fileBlob, { autoplay = true } = {}) {
    this.resetSources();
    this.display.src = fileBlob;
    if (autoplay) this.playVideo();
  }

  setSourceStream(stream, { autoplay = true } = {}) {
    this.resetSources();
    this.display.srcObject = stream;
    if (autoplay) this.playVideo();
  }

  getVideoPlayer() {
    return this.display;
  }

  playVideo() {
    try {
      if (this.display) {
        this.display.play();
      } else {
        console.error("Video player is not initialized.");
      }
    } catch (error) {
      console.error("Error playing video:", error);
    }
  }

  pauseVideo() {
    try {
      if (this.display) {
        this.display.pause();
      } else {
        console.error("Video player is not initialized.");
      }
    } catch (error) {
      console.error("Error pausing video:", error);
    }
  }

  stopVideo() {
    try {
      if (this.display) {
        this.display.pause();
        this.display.currentTime = 0;
      } else {
        console.error("Video player is not initialized.");
      }
    } catch (error) {
      console.error("Error stopping video:", error);
    }
  }

  resetSources() {
    try {
      if (this.display) {
        this.stopVideo();
        this.display.src = "";
        this.display.srcObject = null;
        this.display.load();
      } else {
        console.warn("Video player is not initialized.");
      }
    } catch (error) {
      console.error("Error resetting video sources:", error.message);
    }
  }

  seekVideo(time) {
    if (this.display) {
      this.display.currentTime = time;
    } else {
      console.error("Video player is not initialized.");
    }
  }

  setPlaybackRate(rate) {
    if (this.display) {
      this.display.playbackRate = rate;
    } else {
      console.error("Video player is not initialized.");
    }
  }

  toggleMute() {
    if (this.display) {
      this.display.muted = !this.display.muted;
    } else {
      console.error("Video player is not initialized.");
    }
  }

  setVolume(level) {
    if (this.display) {
      this.display.volume = Math.min(Math.max(level, 0), 1);
    } else {
      console.error("Video player is not initialized.");
    }
  }

  getCurrentTime() {
    if (this.display) {
      return this.display.currentTime;
    } else {
      console.error("Video player is not initialized.");
      return null;
    }
  }

  getDuration() {
    if (this.display) {
      return this.display.duration;
    } else {
      console.error("Video player is not initialized.");
      return null;
    }
  }

  isVideoEnded() {
    if (this.display) {
      return this.display.ended;
    } else {
      console.error("Video player is not initialized.");
      return false;
    }
  }

  setCanvasPlayer(canvasId = "#canvas") {
    this.canvas = document.querySelector(canvasId);
    if (!this.canvas) {
      console.warn(`Canvas player with ID "${canvasId}" not found.`);
    }
  }

  getCanvasPlayer() {
    return this.canvas;
  }

  updateVideoSource(src) {
    if (this.display) {
      this.display.src = src;
      this.display.load();
      this.display.play();
    } else {
      console.error("Video player is not initialized.");
    }
  }

  clearCanvas() {
    if (this.canvas) {
      const context = this.canvas.getContext("2d");
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      console.error("Canvas player is not initialized.");
    }
  }

  captureFrameToCanvas(quality = "high") {
    if (this.display && this.canvas) {
      const context = this.canvas.getContext("2d");
      let width = this.display.videoWidth;
      let height = this.display.videoHeight;

      switch (quality) {
        case "medium":
          width *= 0.75;
          height *= 0.75;
          break;
        case "low":
          width *= 0.5;
          height *= 0.5;
          break;
        case "high":
        default:
          break;
      }

      this.canvas.width = width;
      this.canvas.height = height;
      context.drawImage(this.display, 0, 0, width, height);
    } else {
      console.error("Either video player or canvas is not initialized.");
    }
  }

  drawTextToCanvas(
    text,
    x,
    y,
    fontSize = 20,
    fontColor = "#FFFFFF",
    fontFamily = "Arial",
    textAlign = "center",
    quality = "high"
  ) {
    if (this.canvas) {
      const context = this.canvas.getContext("2d");
      let width = this.canvas.width;
      let height = this.canvas.height;

      switch (quality) {
        case "medium":
          fontSize *= 0.75;
          break;
        case "low":
          fontSize *= 0.5;
          break;
        case "high":
        default:
          break;
      }

      context.font = `${fontSize}px ${fontFamily}`;
      context.fillStyle = fontColor;
      context.textAlign = textAlign;
      context.fillText(text, x * width, y * height);
    } else {
      console.error("Canvas player is not initialized.");
    }
  }

  drawGridToCanvas(
    gridSize = 10,
    lineColor = "#CCCCCC",
    textColor = "#666666",
    fontSize = 12
  ) {
    if (this.canvas) {
      const context = this.canvas.getContext("2d");
      const width = this.canvas.width;
      const height = this.canvas.height;

      context.clearRect(0, 0, width, height);
      context.beginPath();
      context.strokeStyle = lineColor;
      context.fillStyle = textColor;
      context.font = `${fontSize}px Arial`;

      for (let x = 0; x <= width; x += gridSize) {
        context.moveTo(x, 0);
        context.lineTo(x, height);
        if (x % (gridSize * 5) === 0) {
          context.fillText(x, x + 2, fontSize + 2);
        }
      }

      for (let y = 0; y <= height; y += gridSize) {
        context.moveTo(0, y);
        context.lineTo(width, y);
        if (y % (gridSize * 5) === 0) {
          context.fillText(y, 2, y + fontSize + 2);
        }
      }

      context.stroke();
    } else {
      console.error("Canvas player is not initialized.");
    }
  }

  applyCanvasFilter(filterType, throttle = 16) {
    if (this.canvas) {
      const context = this.canvas.getContext("2d");
      const imageData = context.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      const data = imageData.data;

      let lastExecutionTime = 0;

      const processFilter = () => {
        const now = performance.now();
        if (now - lastExecutionTime < throttle) return;
        lastExecutionTime = now;

        switch (filterType) {
          case "grayscale":
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              data[i] = avg;
              data[i + 1] = avg;
              data[i + 2] = avg;
            }
            break;
          case "blur":
            context.filter = "blur(5px)";
            break;
          case "bw":
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              const bwValue = avg > 128 ? 255 : 0;
              data[i] = bwValue;
              data[i + 1] = bwValue;
              data[i + 2] = bwValue;
            }
            break;
          default:
            console.warn("Unknown filter type.");
            return;
        }

        context.putImageData(imageData, 0, 0);
      };

      processFilter();
    } else {
      console.error("Canvas player is not initialized.");
    }
  }

  toggleFullScreen() {
    if (this.display) {
      if (this.display.requestFullscreen) {
        this.display.requestFullscreen();
      } else if (this.display.webkitRequestFullscreen) {
        this.display.webkitRequestFullscreen();
      } else if (this.display.mozRequestFullScreen) {
        this.display.mozRequestFullScreen();
      } else if (this.display.msRequestFullscreen) {
        this.display.msRequestFullscreen();
      }
    } else {
      console.error("Video player is not initialized.");
    }
  }

  captureCanvasAsBase64() {
    if (this.canvas) {
      return this.canvas.toDataURL("image/png");
    } else {
      console.error("Canvas player is not initialized.");
      return null;
    }
  }

  captureCanvasAsBlob(callback) {
    if (this.canvas) {
      this.canvas.toBlob((blob) => {
        if (callback) callback(blob);
      }, "image/png");
    } else {
      console.error("Canvas player is not initialized.");
    }
  }

  captureCanvasAsObjectURL() {
    if (this.canvas) {
      return URL.createObjectURL(this.canvas.toBlob());
    } else {
      console.error("Canvas player is not initialized.");
      return null;
    }
  }
}
