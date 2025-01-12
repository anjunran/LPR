class NavigationManager {
  constructor() {
    this.uinav = null;
    this.currentSlideData = {};
    this.controls = new ControlsManager([
      {
        selector: ".s-next-control",
        eventType: "click",
        callback: this.handleNext.bind(this),
      },
      {
        selector: ".s-previous-control",
        eventType: "click",
        callback: this.hadlePrevious.bind(this),
      },
      {
        selector: ".s-jump-control",
        eventType: "click",
        callback: this.handleJump.bind(this),
      },
      {
        selector: ".s-start-control",
        eventType: "click",
        callback: this.handleStart.bind(this),
      },
      {
        selector: ".s-end-control",
        eventType: "click",
        callback: this.handleEnd.bind(this),
      },
    ]);
  }

  initializeNavControls() {
    this.uinav = w3.slideshow(
      ".section-item",
      0,
      this.trackSlideChange.bind(this)
    );

    this.uinav.jumpTo(3);
    this.controls.initializeControls();
  }

  handleNext() {
    if (this.uinav) this.uinav.next();
  }

  hadlePrevious() {
    if (this.uinav) this.uinav.previous();
  }

  handleJump(event) {
    const markup = event.target.getAttribute("ui-markup");
    if (markup) this.uinav.jumpTo(markup);
  }

  handleStart() {
    if (this.uinav) this.uinav.jumpTo(0);
  }

  handleEnd() {
    if (this.uinav) this.uinav.jumpTo(this.uinav.getSlides().length - 1);
  }

  trackSlideChange(currentSlide, slideData) {
    this.currentSlideData = { slideNumber: currentSlide, ...slideData };
    console.log("Slide changed:", this.currentSlideData);
  }

  onSlideChange(callback) {
    if (typeof callback === "function") {
      this.uinav.ondisplaychange = (currentSlide, slideData) => {
        this.trackSlideChange(currentSlide, slideData);
        callback(currentSlide, slideData);
      };
    }
  }

  enableKeyboardNavigation() {
    document.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "ArrowRight":
          this.uinav.next();
          break;
        case "ArrowLeft":
          this.uinav.previous();
          break;
        case "Home":
          this.handleStart();
          break;
        case "End":
          this.handleEnd();
          break;
        default:
          break;
      }
    });
  }

  disableKeyboardNavigation() {
    document.removeEventListener("keydown", this.enableKeyboardNavigation);
  }

  getCurrentSlide() {
    return this.uinav ? this.uinav.current : null;
  }

  getSlideData() {
    return this.currentSlideData;
  }
}
