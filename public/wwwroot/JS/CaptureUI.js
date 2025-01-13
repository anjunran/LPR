class CaptureUI {
  constructor(appContainer = document.querySelector(".lpr-container")) {
    if (!appContainer)
      throw new Error("[LPR Error] The container element is missing.");

    this.container = appContainer;
    this.uiManager = new UIManager(
      this.container,
      this.initializeParameters.bind(this)
    );
    this.source = { file: false, device: false };
    this.error = null;
    this.errorMessage = "";
    this.state = new StateManager();
    this.filters = new FilterManager();
    this.displayManager = new DisplayManager();
    this.cameraManager = new CameraManager({
      onCameraReady: this.onCameraReady.bind(this),
    });
    this.fileUploader = new FileUploader({
      onFileReady: this.onFileReady.bind(this),
    });
    this.navigationManager = new NavigationManager();
    this.cache = new Cache();
    this.controls = new ControlsManager([
      {
        selector: "#video-mode",
        eventType: "change",
        callback: this.handleModeChange.bind(this),
      },
    ]);
  }

  static createInstance() {
    return new CaptureUI();
  }

  async initialize() {
    if (!this.isW3Available())
      throw new Error(
        "[LPR Error] The container element or 'w3.js' is missing."
      );
    try {
      await this.uiManager.initializeUI();
    } catch (error) {
      console.error(error.message);
    }
  }

  initializeParameters() {
    this.state.initialize();
    this.filters.initialize();
    this.displayManager.initializeDisplays();
    this.navigationManager.initializeNavControls();
    this.setupSourceControls();
    this.fileUploader.initializeVideoUpload();
  }

  async setupSourceControls() {
    this.controls.initializeControls();
  }

  handleModeChange({ target }) {
    const mode = target.value.split("-")[1]?.trim();
    if (mode) this.setSource(mode);
  }

  setSource(sourceName) {
    if (sourceName in this.source) {
      Object.keys(this.source).forEach(
        (key) => (this.source[key] = key === sourceName)
      );
    }
    this.displayManager.resetSources();
    this.updateSourceVisibility(this.onSourceReady.bind(this));
  }

  updateSourceVisibility(callback = null) {
    Object.entries(this.source).forEach(([key, isActive]) => {
      const element = document.querySelector(`#video-${key}`)?.parentElement;
      if (element) element.style.display = isActive ? "" : "none";

      const button = document.querySelector(`#setting-btn-${key}`);
      if (button) button.style.display = isActive ? "" : "none";
    });

    if (callback instanceof Function) callback(this.source);
  }

  onSourceReady(source) {
    if (source.device) {
      this.updateCameraList();
    } else if (source.file) {
      console.info("File source selected. Handle accordingly.");
    } else if (!source.device && !source.file) {
      this.displayManager.toggleSourceSignal(false);
    }

    this.displayManager.toggleSourceSignal(true);
  }

  updateCameraList(dropdownId = "#video-device-select") {
    const listHandler = this.source.device
      ? this.cameraManager.populateCameraDropdown.bind(this.cameraManager)
      : this.cameraManager.clearDropdown.bind(this.cameraManager);
    listHandler(dropdownId);
  }

  isW3Available() {
    return this.container && typeof w3 !== "undefined";
  }

  getVideoPlayer() {
    return this.displayManager.getVideoPlayer();
  }

  onCameraReady(stream) {
    const videoPlayer = this.getVideoPlayer();
    if (videoPlayer) this.displayManager.setSourceStream(stream);
  }

  onFileReady(file) {
    const videoPlayer = this.getVideoPlayer();
    if (videoPlayer) this.displayManager.setSourceFile(file);
  }

  async switchSource(newSource) {
    try {
      this.setSource(newSource);
      console.info(`Switched to ${newSource} source.`);
    } catch (error) {
      console.error("Error switching source:", error);
    }
  }
}
