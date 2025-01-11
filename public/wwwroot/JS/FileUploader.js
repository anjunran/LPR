class FileUploader {
  constructor({
    videoFileInput = document.querySelector("#video-file"),
    onfileready = null,
  } = {}) {
    this.videoFileInput = videoFileInput;
    this.onfileready = onfileready;
    this.fileInfos = null;
  }

  initializeVideoUpload() {
    this.videoFileInput = document.querySelector("#video-file");
    if (!this.videoFileInput) return;

    this.videoFileInput.addEventListener("change", () => {
      const deviceNameDisplay = document.getElementById("device-name");
      const file = this.videoFileInput.files[0];

      if (!file || !file.type.startsWith("video/")) {
        console.error("Please select a valid video file.");
        return;
      }

      const uploaded = URL.createObjectURL(file);

      this.fileInfos = FileProcessor.processFileInfo(file);

      deviceNameDisplay.innerHTML = `<p class="w3-text-green" title="${this.fileInfos[2]}/${this.fileInfos[0]}">${this.fileInfos[1]}</p>`;

      if (this.onfileready instanceof Function)
        this.onfileready(uploaded, this.fileInfos);
    });
  }

  validateFile(file, allowedTypes = ["video/mp4", "video/webm", "video/ogg"]) {
    if (!file) {
      console.error("No file selected.");
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      console.error("Unsupported file type.");
      return false;
    }

    return true;
  }

  uploadAsBase64(callback) {
    if (!this.videoFileInput) {
      console.warn(`File input with ID "${this.videoFileInput.id}" not found.`);
      return;
    }

    this.videoFileInput.addEventListener("change", () => {
      const file = this.videoFileInput.files[0];
      if (!this.validateFile(file)) return;

      const reader = new FileReader();
      reader.onload = () => {
        if (callback) callback(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  uploadAsBlob(callback) {
    if (!this.videoFileInput) {
      console.warn(`File input with ID "${this.videoFileInput.id}" not found.`);
      return;
    }

    this.videoFileInput.addEventListener("change", () => {
      const file = this.videoFileInput.files[0];
      if (!this.validateFile(file)) return;
      if (callback) callback(file);
    });
  }
}

class FileProcessor {
  static convertSize(file) {
    if (!file?.size) return null;
    const units = ["Octets", "Ko", "Mo", "Go", "To"];
    let size = file.size;
    let i = 0;
    for (; size >= 1024 && i < units.length - 1; size /= 1024, i++);
    return `${size.toFixed(2)} ${units[i]}`;
  }

  static removeExtension(file) {
    if (!file?.name) return null;
    const lastDotIndex = file.name.lastIndexOf(".");
    return lastDotIndex > 0 ? file.name.slice(0, lastDotIndex) : file.name;
  }

  static getFileExtension(file) {
    return file?.type ? file.type.split("/").pop().toLowerCase() : null;
  }

  static processFileInfo(file) {
    return [
      FileProcessor.convertSize(file),
      FileProcessor.removeExtension(file),
      FileProcessor.getFileExtension(file),
    ];
  }
}
