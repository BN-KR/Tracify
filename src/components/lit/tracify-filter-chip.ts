import { LitElement, html, css } from "lit";

/**
 * A single removable filter chip, e.g. "status = error".
 * Fires `chip-remove` with the chip's `filterId` when the close button is
 * clicked; the host owns filter state, this component is presentational.
 */
export class TracifyFilterChip extends LitElement {
  static properties = {
    filterId: { type: String, attribute: "filter-id" },
    label: { type: String },
    value: { type: String },
  };

  declare filterId: string;
  declare label: string;
  declare value: string;

  static styles = css`
    :host {
      display: inline-flex;
      font-family: var(--tracify-font-mono, ui-monospace, monospace);
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      border: 1px solid var(--tracify-border, #333);
      background: var(--tracify-chip-bg, #0a0a0a);
      color: var(--tracify-fg, #fff);
      padding: 0.3rem 0.5rem;
      font-size: 0.72rem;
      line-height: 1;
      white-space: nowrap;
    }

    .label {
      color: var(--tracify-muted, #999);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-size: 0.62rem;
    }

    .value {
      font-weight: 600;
    }

    button {
      appearance: none;
      background: transparent;
      border: none;
      color: var(--tracify-muted, #999);
      cursor: pointer;
      font-family: inherit;
      font-size: 0.85rem;
      line-height: 1;
      padding: 0 0 0 0.15rem;
    }

    button:hover {
      color: var(--tracify-fg, #fff);
    }
  `;

  constructor() {
    super();
    this.filterId = "";
    this.label = "";
    this.value = "";
  }

  private handleRemove() {
    this.dispatchEvent(
      new CustomEvent("chip-remove", {
        detail: { filterId: this.filterId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      <span class="chip">
        <span class="label">${this.label}</span>
        <span class="value">${this.value}</span>
        <button type="button" aria-label="Remove filter" @click=${this.handleRemove}>x</button>
      </span>
    `;
  }
}

if (!customElements.get("tracify-filter-chip")) {
  customElements.define("tracify-filter-chip", TracifyFilterChip);
}

declare global {
  interface HTMLElementTagNameMap {
    "tracify-filter-chip": TracifyFilterChip;
  }
}
