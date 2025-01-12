class CameraManager {
  constructor({ onCameraReady = null } = {}) {
    this.onCameraReady = onCameraReady || null;
    this.stream = null;
    this.deviceNameDisplayId = "device-name";
    this.controls = new ControlsManager();
  }

  async startCamera(deviceId = null) {
    if (this.stream) this.stopCamera();
    try {
      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      };
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (this.onCameraReady) this.onCameraReady(this.stream);
      return this.stream;
    } catch (error) {
      console.error("Error accessing camera:", error);
      return null;
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
      console.info("Camera stream stopped.");
    } else {
      console.warn("No active camera stream to stop.");
    }
  }

  async getAvailableCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((device) => device.kind === "videoinput");
    } catch (error) {
      console.error("Error enumerating devices:", error);
      return [];
    }
  }

  clearDropdown(dropdownId) {
    const dropdown = document.querySelector(dropdownId);
    if (!dropdown) {
      console.warn(`Dropdown with ID "${dropdownId}" not found.`);
      return;
    }

    dropdown.innerHTML = "";

    const placeholderOption = document.createElement("option");
    placeholderOption.selected = true;
    placeholderOption.textContent =
      "Choose the camera to use during reading...";
    dropdown.appendChild(placeholderOption);
  }

  async populateCameraDropdown(dropdownId) {
    const dropdown = document.querySelector(dropdownId);
    if (!dropdown) {
      console.warn(`Dropdown with ID "${dropdownId}" not found.`);
      return;
    }

    const cameras = await this.getAvailableCameras();
    dropdown.innerHTML = `<option selected disabled>${cameras.length} Device${
      cameras.length !== 1 ? "s" : ""
    } Ready</option>`;

    cameras.forEach((camera, index) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.textContent = camera.label || `Camera ${index + 1}`;
      dropdown.appendChild(option);
    });

    if (cameras.length === 0) {
      const option = document.createElement("option");
      option.textContent = "No cameras found";
      dropdown.appendChild(option);
    }

    this.controls.addControls({
      selector: dropdownId,
      eventType: "change",
      callback: this.handleCamSelect.bind(this),
    });
  }

  async handleCamSelect(event) {
    const { target } = event;
    const stream = await this.startCamera(target.value);

    if (stream) {
      const selectedOption = Array.from(target.options).find(
        (option) => option.value === target.value
      );

      if (selectedOption) {
        this.onCameraConnected({
          deviceNameDisplay: document.getElementById(this.deviceNameDisplayId),
          cameraName: selectedOption.textContent,
        });
      }
    } else {
      console.error("Failed to start the camera stream.");
    }
  }

  onCameraConnected({ deviceNameDisplay, cameraName }) {
    if (deviceNameDisplay) {
      deviceNameDisplay.innerHTML = `<p class="w3-text-green">${cameraName}</p>`;
    } else {
      console.warn("Device name display element not found.");
    }
  }

  async switchCamera(deviceId) {
    try {
      await this.startCamera(deviceId);
      console.info("Camera switched successfully.");
    } catch (error) {
      console.error("Error switching camera:", error);
    }
  }
}
