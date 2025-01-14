class FilterManager {
  constructor() {
    this.filters = {};
    this.levels = {};
    this.presets = new Cache();
    this.presetsDisplayId = "presetSelect";
    this.onPresetLoaded = null;
    this.retryConfig = { retries: 3, delay: 1000 }; // Configurable retry mechanism
  }

  async initialize(lastFilters = {}, lastFilterLevels = {}) {
    this.onPresetLoaded = (entries) =>
      this.populatePresetDropdown(Array.from(entries));

    try {
      await this.loadFilterPresets();

      this.filters = {
        grayscale: false,
        gBlur: false,
        bw: false,
        ...lastFilters,
      };

      this.levels = {
        ...this.presets.get("default"),
        ...lastFilterLevels,
      };

      const controlsConfig = this.createControlsConfig(
        ["grayscale", "gBlur", "bw"],
        ["grayscale", "gBlur", "contrast", "brightness"]
      );

      const plugConfigs = [
        ["grayscale-filter", "grayscale-f-switch"],
        ["gaussian-filter", "gBlur-f-switch"],
        ["bw-filter", "bw-f-switch"],
        ["grayscale-range", "grayscale-f-range"],
        ["gaussian-blur-range", "gBlur-f-range"],
        ["contrast-range", "contrast-f-range"],
        ["brightness-range", "brightness-f-range"],
      ];

      this.controls = new ControlsManager(controlsConfig);
      this.setupFilterControls(plugConfigs);
    } catch (error) {
      console.warn("Initialization error:", error);
    }
  }

  createControlsConfig(filterSwitches, filterRanges) {
    const switchControls = filterSwitches.map((filter) => ({
      selector: `.${filter}-f-switch`,
      eventType: "change",
      callback: ({ target }) => this.setFilter(filter, target.checked),
    }));

    const rangeControls = filterRanges.map((filter) => ({
      selector: `.${filter}-f-range`,
      eventType: "input",
      callback: this.handleRangeChange.bind(this),
      update: this.handleRangeUpdate.bind(this),
    }));

    return [...switchControls, ...rangeControls];
  }

  setupFilterControls(plugConfigs) {
    for (const [targetId, helperClassname] of plugConfigs) {
      this.controls.plugController(targetId, helperClassname);
      this.overrideElementValue(helperClassname);
    }
  }

  setFilter(filterName, value) {
    if (filterName in this.filters) {
      this.filters[filterName] = value;
    } else {
      console.warn(`Filter "${filterName}" does not exist.`);
    }
  }

  handleRangeChange({ target }, update) {
    const filterName = Array.from(target.classList)
      .toReversed()[0]
      .split("-")[0];

    if (filterName in this.levels) {
      this.setFilterLevel(filterName, target.value);
      if (update) update(target, filterName);
    }
  }

  handleRangeUpdate(target, filterName) {
    this.overrideElementValue(`.${filterName}-f-range`);
  }

  overrideElementValue(nodeClassName) {
    const elements = document.querySelectorAll(
      String(nodeClassName).startsWith(".")
        ? nodeClassName
        : `.${nodeClassName}`
    );

    elements.forEach((el) => {
      const [parameter, , type] = nodeClassName.split("-");
      const property = parameter.replace(".", "");
      if (type === "switch") {
        el.checked = this.filters[property];
      } else if (type === "range") {
        const newValue = this.levels[property] || 0;
        el.value = newValue;
        this.setRangeLabelValue(el, newValue);
      }
    });
  }

  setRangeLabelValue(range, value) {
    if (range.nextElementSibling) {
      range.nextElementSibling.innerHTML = value;
    }
  }

  setFilterLevel(filterName, level) {
    if (filterName in this.levels) {
      this.levels[filterName] = level;
    } else {
      console.warn(`Filter level "${filterName}" does not exist.`);
    }
  }

  getFilter(filterName) {
    return this.filters.hasOwnProperty(filterName)
      ? this.filters[filterName]
      : null;
  }

  getFilterLevel(filterName) {
    return this.levels.hasOwnProperty(filterName)
      ? this.levels[filterName]
      : null;
  }

  toggleFilter(filterName) {
    if (this.filters.hasOwnProperty(filterName)) {
      this.filters[filterName] = !this.filters[filterName];
    } else {
      console.warn(`Filter "${filterName}" does not exist.`);
    }
  }

  resetFilters() {
    Object.keys(this.filters).forEach((filter) => {
      this.filters[filter] = false;
    });
  }

  resetFilterLevels() {
    Object.keys(this.levels).forEach((level) => {
      this.levels[level] = 0.5;
    });
  }

  isFilterActive(filterName) {
    return this.filters.hasOwnProperty(filterName)
      ? this.filters[filterName]
      : false;
  }

  populatePresetDropdown(entries) {
    const presetSelect = document.querySelector(`#${this.presetsDisplayId}`);
    if (presetSelect) {
      presetSelect.innerHTML = `<option selected disabled>&#9873; Presets (${entries.length})</option>`;
      Array.from(entries)
        .sort()
        .forEach(([name]) => {
          const option = document.createElement("option");
          option.textContent = name;
          option.value = name;
          presetSelect.appendChild(option);
        });
    }
  }

  addFilterPreset(name, settings) {
    this.presets.set(name, settings);
  }

  async loadFilterPresets() {
    let retries = this.retryConfig.retries;
    const delay = this.retryConfig.delay;

    while (retries > 0) {
      try {
        const response = await fetch(this.getPresetsURL());
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        for (const [filterName, settings] of Object.entries(data)) {
          this.addFilterPreset(filterName, settings);
        }

        if (typeof this.onPresetLoaded === "function") {
          this.onPresetLoaded(this.presets.entries());
        }

        return;
      } catch (error) {
        console.error("[LPR Error] Failed to load filter presets:", error);
        retries--;

        if (retries === 0) {
          console.warn("[LPR Error] All retry attempts failed.");
        } else {
          console.info(`Retrying... Attempts left: ${retries}`);
          await this.delayExecution(delay);
        }
      }
    }
  }

  delayExecution(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getPresetsURL() {
    return new URL("/filter/presets", location.origin).toString();
  }
}
