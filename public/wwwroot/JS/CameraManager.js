class CameraManager {
  constructor(onCameraReady) {
    this.stream = null;
    this.onCameraReady = onCameraReady || null;
  }

  async startCamera(deviceId = null) {
    if (this.stream) this.stopCamera();
    try {
      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      };
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
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

    dropdown.removeEventListener("change", null);
  }

  async populateCameraDropdown(dropdownId) {
    const dropdown = document.querySelector(dropdownId);
    if (!dropdown) {
      console.warn(`Dropdown with ID "${dropdownId}" not found.`);
      return;
    }

    const cameras = await this.getAvailableCameras();
    const camerasLen = cameras.length;
    dropdown.innerHTML = `<option selected disabled>${camerasLen} Device${
      camerasLen !== 1 ? "s" : ""
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

    dropdown?.addEventListener("change", async () => {
      const deviceNameDisplay = document.getElementById("device-name");
      const cameraName = Array.from(dropdown).find(
        (n) => n.value === dropdown.value
      ).textContent;

      const stream = await this.startCamera(dropdown.value);
      deviceNameDisplay.innerHTML = `<p class="w3-text-green">${cameraName}</p>`;
      try {
        if (stream) {
          if (this.onCameraReady instanceof Function)
            this.onCameraReady(stream, this.source);
        } else {
          console.error("Failed to start the camera stream.");
        }
      } catch (error) {
        console.error("Error starting camera stream:", error);
      }
    });
  }
}
