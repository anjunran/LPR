class FilterManager {
  constructor() {
    this.filters = {};
    this.levels = {};
    this.presets = new Cache();
    this.presetsDisplayId = "presetSelect";
    this.onPresetLoaded = null;
    this.controls = new ControlsManager([
      {
        selector: ".grayscale-f-switch",
        eventType: "change",
        callback: ({ target }) => this.setFilter("grayscale", target.checked),
      },
      {
        selector: ".gBlur-f-switch",
        eventType: "change",
        callback: ({ target }) => this.setFilter("gBlur", target.checked),
      },
      {
        selector: ".bw-f-switch",
        eventType: "change",
        callback: ({ target }) => this.setFilter("bw", target.checked),
      },
      {
        selector: ".grayscale-f-range",
        eventType: "input",
        callback: ({ target }) =>
          this.setFilterLevel("grayscale", target.value),
      },
      {
        selector: ".gBlur-f-range",
        eventType: "input",
        callback: ({ target }) => this.setFilterLevel("gBlur", target.value),
      },
      {
        selector: ".contrast-f-range",
        eventType: "input",
        callback: ({ target }) => this.setFilterLevel("contrast", target.value),
      },
      {
        selector: ".brightness-f-range",
        eventType: "input",
        callback: ({ target }) =>
          this.setFilterLevel("brightness", target.value),
      },
    ]);
  }

  initialize(lastFilters = {}, lastFilterLevels = {}) {
    this.onPresetLoaded = (entries) => {
      this.populatePresetDropdown(entries);
    };

    this.loadFilterPresets()
      .then(() => {
        Object.assign(this.filters, {
          grayscale: false,
          gBlur: false,
          bw: false,
          ...lastFilters,
        });

        const defaultLevel = this.presets.get("default");

        Object.assign(this.levels, {
          ...defaultLevel,
          ...lastFilterLevels,
        });

        this.setupFilterControls(
          ["grayscale-filter", "grayscale-f-switch"],
          ["gaussian-filter", "gBlur-f-switch"],
          ["bw-filter", "bw-f-switch"],
          ["grayscale-range", "grayscale-f-range"],
          ["gaussian-blur-range", "gBlur-f-range"],
          ["contrast-range", "contrast-f-range"],
          ["brightness-range", "brightness-f-range"]
        );
      })
      .catch(console.warn);
  }

  setupFilterControls(...controllers) {
    for (const [targetId, helperClassname] of controllers) {
      this.controls.plugController(targetId, helperClassname);
    }
  }

  setFilter(filterName, value) {
    if (this.filters.hasOwnProperty(filterName)) {
      this.filters[filterName] = value;
    } else {
      console.warn(`Filter "${filterName}" does not exist.`);
    }
  }

  overideElementValue(elClassname) {
    const element = document.querySelectorAll(`.${elClassname}`);
  }

  getFilter(filterName) {
    return this.filters.hasOwnProperty(filterName)
      ? this.filters[filterName]
      : null;
  }

  toggleFilter(filterName) {
    if (this.filters.hasOwnProperty(filterName)) {
      this.filters[filterName] = !this.filters[filterName];
    } else {
      console.warn(`Filter "${filterName}" does not exist.`);
    }
  }

  setFilterLevel(filterName, level) {
    if (this.levels.hasOwnProperty(filterName)) {
      if (this.filters[filterName]) this.levels[filterName] = level;
    } else {
      console.warn(`Filter level "${filterName}" does not exist.`);
    }
  }

  getFilterLevel(filterName) {
    return this.levels.hasOwnProperty(filterName)
      ? this.levels[filterName]
      : null;
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
    const presetSelect = document.querySelectorAll(`#${this.presetsDisplayId}`);
    const data = Array.from(entries);
    presetSelect.forEach((select) => {
      if (select && select.tagName == "SELECT") {
        select.innerHTML = `<option selected disabled>&#9873; Presets (${data.length})</option>`;
        data.sort().forEach(([name]) => {
          const option = document.createElement("option");
          option.innerHTML = name;
          option.value = name;
          select.appendChild(option);
        });
      }
    });
  }

  addFilterPreset(name, settings) {
    this.presets.set(name, settings);
  }

  async loadFilterPresets() {
    try {
      const response = await fetch(this.getPresetsURL());
      const data = await response.json();

      for (const [filterName, settings] of Object.entries(data)) {
        this.addFilterPreset(filterName, settings);
      }
      if (typeof this.onPresetLoaded == "function") {
        this.onPresetLoaded(this.presets.entries());
      }
    } catch (error) {
      console.error("[LPR Error] Failed to preset filters:", error);
    }
  }

  getPresetsURL() {
    return new URL("/filter/presets", location.origin).toString();
  }
}
