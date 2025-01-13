class FilterManager {
  constructor() {
    this.filters = {};
    this.levels = {};
    this.presets = new Cache();
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
        selector: ".bw-f-range",
        eventType: "input",
        callback: ({ target }) => this.setFilterLevel("bw", target.value),
      },
    ]);
  }

  initialize(lastFilters = {}, lastFilterLevels = {}) {
    Object.assign(this.filters, {
      grayscale: false,
      gBlur: false,
      bw: false,
      ...lastFilters,
    });
    Object.assign(this.levels, {
      grayscale: 0.5,
      gBlur: 0.5,
      bw: 0.5,
      ...lastFilterLevels,
    });
    this.setupFilterControls(
      ["grayscale-filter", "grayscale-f-switch"],
      ["gaussian-filter", "gBlur-f-switch"],
      ["bw-filter", "bw-f-switch"],
      ["grayscale-range", "grayscale-f-range"],
      ["gaussian-blur-range", "gBlur-f-range"],
      ["bw-range", "bw-f-range"]
    );
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
}
