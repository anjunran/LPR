class CaptureUI {
  constructor(appContainer = document.querySelector(".lpr-container")) {
    if (!appContainer)
      throw new Error("[LPR Error] The container element is missing.");
    this.container = appContainer;
    this.state = new StateManager();
    this.filters = new FilterManager();
    this.displayManager = new DisplayManager();
    this.source = { file: false, device: false };
    this.cameraManager = new CameraManager(this.onCameraReady.bind(this));
    this.fileUploader = new FileUploader({
      onfileready: this.onFileReady.bind(this),
    });
    this.navigationManager = new NavigationManager();
    this.cache = new Cache();
    this.error = null;
    this.errorMessage = "";
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
      await this.setUI();
      this.initializeParameters();
    } catch (error) {
      console.error(error.message);
    }
  }

  initializeParameters() {
    this.state.initialize();
    this.filters.initialize();
    this.displayManager.initializeDisplays();
    this.navigationManager.initializeNavControls();
    this.setupSourceControls(this.setSource.bind(this));
    this.fileUploader.initializeVideoUpload();
  }

  async setupSourceControls(onSourceChange) {
    const modeSelector = document.querySelector("#video-mode");
    if (!modeSelector) return console.warn("Mode selector not found.");

    modeSelector.addEventListener("change", async ({ target }) => {
      const mode = target.value.split("-")[1]?.trim();
      if (mode) await onSourceChange(mode);
    });
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
      // Something to handle what happen when source selected by user is file-upload
    } else if (!source.device && !source.file) {
      this.displayManager.toggleSourceSignal(false);
    }

    console.log("source-ready");
    
    this.displayManager.toggleSourceSignal(true);
  }

  updateCameraList(dropdownId = "#video-device-select") {
    (this.source.device
      ? this.cameraManager.populateCameraDropdown.bind(this.cameraManager)
      : this.cameraManager.clearDropdown.bind(this.cameraManager))(dropdownId);
  }

  isW3Available() {
    return this.container && typeof w3 !== "undefined";
  }

  async setUI() {
    const section = this.getSectionElement() || this.createSection();
    await this.includeComponents(section, this.initializeParameters.bind(this));
  }

  getSectionElement() {
    return Array.from(this.container.children).find(
      (child) => child.tagName === "SECTION"
    );
  }

  createSection() {
    const section = document.createElement("section");
    this.container.appendChild(section);
    return section;
  }

  async includeComponents(section, callback) {
    try {
      const response = await fetch(this.getComponentURL());
      const data = await response.json();
      section.innerHTML = data.files
        .map(
          (file) =>
            `<div class="section-item" w3-include-html="/components/captureui/${file}"></div>`
        )
        .join("");
      w3.includeHTML(callback);
    } catch (error) {
      console.error("[LPR Error] Failed to load components:", error);
    }
  }

  getComponentURL() {
    return new URL("/cui/files", location.origin).toString();
  }

  getVideoPlayer() {
    return this.displayManager.getVideoPlayer();
  }

  onCameraReady(stream) {
    if (this.getVideoPlayer()) {
      this.displayManager.setSourceStream(stream);
    }
  }

  onFileReady(stream) {
    if (this.getVideoPlayer()) {
      this.displayManager.setSourceFile(stream);
    }
  }
}
