class NavigationManager {
  constructor() {
    this.uinav = null;
    this.currentSlideData = {};
  }

  initializeNavControls() {
    this.uinav = w3.slideshow(
      ".section-item",
      0,
      this.trackSlideChange.bind(this)
    );
    this.uinav.jumpTo(2);
    this.setupNavButtons(".s-next-control", this.uinav.next.bind(this.uinav));
    this.setupNavButtons(
      ".s-previous-control",
      this.uinav.previous.bind(this.uinav)
    );
    this.setupNavButtons(".s-jump-control", this.handleJump.bind(this));
    this.setupNavButtons(".s-start-control", this.handleStart.bind(this));
    this.setupNavButtons(".s-end-control", this.handleEnd.bind(this));
  }

  setupNavButtons(selector, callback) {
    document
      .querySelectorAll(selector)
      .forEach((btn) => btn.addEventListener("click", callback));
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
