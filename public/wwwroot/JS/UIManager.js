class UIManager {
  constructor(container, onUILoaded) {
    this.container = container;
    this.onUILoaded = onUILoaded || null;
  }

  async initializeUI() {
    const section = this.getSectionElement() || this.createSection();
    await this.includeComponents(section);
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

  async includeComponents(section) {
    try {
      const response = await fetch(this.getComponentURL());
      const data = await response.json();
      section.innerHTML = data.files
        .map(
          (file) =>
            `<div class="section-item" w3-include-html="/components/captureui/${file}"></div>`
        )
        .join("");
      w3.includeHTML(
        typeof this.onUILoaded == "function"
          ? this.onUILoaded
          : () => console.info("Components included successfully.")
      );
    } catch (error) {
      console.error("[LPR Error] Failed to load components:", error);
    }
  }

  getComponentURL() {
    return new URL("/cui/files", location.origin).toString();
  }
}
