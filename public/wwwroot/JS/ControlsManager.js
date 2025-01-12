class ControlsManager {
  constructor(initialControls = []) {
    this.controls = [...initialControls];
  }

  initializeControls() {
    for (const control of this.controls) {
      this.setupControls(control);
    }
  }

  addControls(newControls = []) {
    if (Array.isArray(newControls)) {
      this.controls.push(...newControls);
    } else if (newControls) {
      this.controls.push(newControls);
    }
    this.initializeControls();
  }

  setupControls({ selector, eventType, callback, update = null }) {
    if (!selector || !eventType || typeof callback !== "function") {
      console.warn("Invalid control configuration.");
      return;
    }

    document
      .querySelectorAll(selector)
      .forEach((controller) =>
        controller.removeEventListener(eventType, (e) => callback(e, update))
      );

    document
      .querySelectorAll(selector)
      .forEach((controller) =>
        controller.addEventListener(eventType, (e) => callback(e, update))
      );
  }

  removeControls({ selector, eventType, callback }) {
    document
      .querySelectorAll(selector)
      .forEach((controller) =>
        controller.removeEventListener(eventType, (e) => callback(e))
      );
  }

  clearAllControls() {
    this.controls.forEach((control) => this.removeControls(control));
    this.controls = [];
  }

  findControl(selector) {
    return (
      this.controls.find((control) => control.selector === selector) || null
    );
  }

  updateControl(selector, newConfig) {
    const controlIndex = this.controls.findIndex(
      (control) => control.selector === selector
    );
    if (controlIndex !== -1) {
      this.controls[controlIndex] = {
        ...this.controls[controlIndex],
        ...newConfig,
      };
    }
  }

  plugController(targetId, helperSelector) {
    const target = document.getElementById(targetId);
    if (target && !target.classList.contains(helperSelector))
      target.classList.add(helperSelector);
  }

  logControls() {
    console.table(this.controls);
  }
}
