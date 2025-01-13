class ControlsManager {
  constructor(initialControls = []) {
    this.controls = new Map();
    this.addControls(initialControls);
  }

  initializeControls() {
    this.controls.forEach((control) => this.setupControls(control));
  }

  addControls(newControls = []) {
    const defaultProps = {
      isPlugged: false,
      onPlug: null,
      targetCount: 0,
      get targetElement() {
        return this.isPlugged ? document.querySelectorAll(this.selector) : null;
      },
      setTargetElement(target) {
        const selector = String(this.selector).replace(/^./, "");
        if (!target) return;
        if (target instanceof NodeList || Array.isArray(target))
          target.forEach((el) => this.applyPlugLogic(el, selector));
        else if (target instanceof HTMLElement)
          this.applyPlugLogic(target, selector);
      },
      applyPlugLogic(target, selector) {
        if (!target.classList.contains(selector)) {
          target.classList.add(selector);
          if (typeof this.onPlug === "function") this.onPlug(target);
          this.targetCount += 1;
          this.isPlugged = true;
        }
      },
    };

    const setupProperties = (config) => {
      return { ...defaultProps, ...config };
    };

    const configuredControls = Array.isArray(newControls)
      ? newControls.map(setupProperties)
      : [setupProperties(newControls)];

    configuredControls.forEach((control) => {
      if (!this.controls.has(control.selector)) {
        this.controls.set(control.selector, control);
        this.setupControls(control);
      }
    });
  }

  setupControls({ selector, eventType, callback, update = null }) {
    if (!selector || !eventType || typeof callback !== "function") {
      console.warn("Invalid control configuration.");
      return;
    }

    document.querySelectorAll(selector).forEach((controller) => {
      if (!controller.dataset.eventBound) {
        controller.addEventListener(
          eventType,
          (e) => callback(e, update),
          false
        );
        controller.dataset.eventBound = true;
      }
    });
  }

  removeControls({ selector, eventType, callback }) {
    document.querySelectorAll(selector).forEach((controller) => {
      controller.removeEventListener(eventType, (e) => callback(e));
      controller.removeAttribute("data-eventBound");
    });
  }

  clearAllControls() {
    this.controls.forEach((control) => this.removeControls(control));
    this.controls.clear();
  }

  findControl(selector) {
    return this.controls.get(selector) || null;
  }

  updateControl(selector, newConfig) {
    if (this.controls.has(selector)) {
      const updatedControl = { ...this.controls.get(selector), ...newConfig };
      this.controls.set(selector, updatedControl);
      this.setupControls(updatedControl);
    }
  }

  plugController(targetId, helperSelector) {
    const helper = this.findControl(`.${helperSelector}`);
    if (helper) {
      helper.onPlug = this.initializeControls.bind(this);
      helper.setTargetElement(document.querySelectorAll(`#${targetId}`));
    }
  }

  refreshControl(selector) {
    const control = this.findControl(selector);
    if (control) {
      this.removeControls(control);
      this.setupControls(control);
    }
  }

  logControls() {
    console.table([...this.controls.values()]);
  }

  disconnectControl(selector) {
    const control = this.findControl(selector);
    if (control) {
      this.removeControls(control);
      this.controls.delete(selector);
    }
  }

  getControlCount() {
    return this.controls.size;
  }
}
