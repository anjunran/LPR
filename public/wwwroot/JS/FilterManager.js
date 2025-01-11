class FilterManager {
  constructor() {
    this.filters = {};
    this.levels = {};
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
      this.levels[filterName] = level;
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
