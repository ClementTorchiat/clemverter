/**
 * clemverter - Custom Select Dropdown Component
 * Fully styled, accessible (ARIA, keyboard nav), with rich options & badges.
 */

import { icons } from './icons.js';

let isGlobalListenerBound = false;

/**
 * Render a rich, accessible custom select dropdown HTML string
 * @param {Object} config
 * @param {string} config.id - Identifier for the select
 * @param {string} config.value - Current selected value
 * @param {Array<{value: string, label: string, badge?: string, badgeClass?: string, description?: string, icon?: string}>} config.options
 * @param {string} [config.ariaLabel]
 * @param {string} [config.variant] - 'default' | 'compact'
 * @param {string} [config.triggerLabel] - Optional custom label for trigger
 * @returns {string} HTML markup
 */
export function renderCustomSelect({ id, value, options, ariaLabel, variant = 'default', triggerLabel = null }) {
  const selectedOption = options.find(o => o.value === value) || options[0] || { value: '', label: '' };
  const displayLabel = triggerLabel !== null ? triggerLabel : selectedOption.label;

  return `
    <div class="custom-select ${variant === 'compact' ? 'is-compact' : ''}" data-custom-select-id="${id}">
      <button
        type="button"
        class="custom-select-trigger"
        id="${id}-trigger"
        aria-haspopup="listbox"
        aria-expanded="false"
        aria-controls="${id}-listbox"
        aria-label="${ariaLabel || selectedOption.label}"
      >
        <div class="custom-select-trigger-content">
          ${selectedOption.icon ? `<span class="custom-select-icon">${selectedOption.icon}</span>` : ''}
          <span class="custom-select-trigger-label">${displayLabel}</span>
          ${(triggerLabel === null && selectedOption.badge) ? `<span class="custom-select-badge ${selectedOption.badgeClass || ''}">${selectedOption.badge}</span>` : ''}
        </div>
        <span class="custom-select-chevron" aria-hidden="true">${icons.chevronDown}</span>
      </button>

      <div
        class="custom-select-dropdown"
        id="${id}-listbox"
        role="listbox"
        aria-label="${ariaLabel || selectedOption.label}"
        tabindex="-1"
      >
        <div class="custom-select-options">
          ${options.map(opt => {
            const isSelected = opt.value === value;
            return `
              <div
                class="custom-select-option ${isSelected ? 'is-selected' : ''}"
                role="option"
                data-value="${opt.value}"
                aria-selected="${isSelected ? 'true' : 'false'}"
                tabindex="-1"
              >
                <div class="custom-select-option-body">
                  <div class="custom-select-option-header">
                    ${opt.icon ? `<span class="custom-select-option-icon">${opt.icon}</span>` : ''}
                    <span class="custom-select-option-label">${opt.label}</span>
                    ${opt.badge ? `<span class="custom-select-badge ${opt.badgeClass || ''}">${opt.badge}</span>` : ''}
                  </div>
                  ${opt.description ? `<p class="custom-select-option-desc">${opt.description}</p>` : ''}
                </div>
                <span class="custom-select-check" aria-hidden="true">${icons.check}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * Close any open custom select menus in the DOM
 * @param {HTMLElement} [except] - Optional select container to keep open
 */
export function closeAllCustomSelects(except = null) {
  document.querySelectorAll('.custom-select.is-open').forEach(sel => {
    if (sel !== except) {
      sel.classList.remove('is-open');
      const trigger = sel.querySelector('.custom-select-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      sel.closest('.setting-card')?.classList.remove('has-open-dropdown');
    }
  });
}

/**
 * Initialize all custom select components on the page and bind interactive handlers
 * @param {(selectId: string, value: string) => void} onSelect - Callback when an option is selected
 */
export function initCustomSelects(onSelect) {
  // Bind global outside-click & escape listener once
  if (!isGlobalListenerBound) {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-select')) {
        closeAllCustomSelects();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openSel = document.querySelector('.custom-select.is-open');
        if (openSel) {
          const trigger = openSel.querySelector('.custom-select-trigger');
          closeAllCustomSelects();
          trigger?.focus();
        }
      }
    });

    isGlobalListenerBound = true;
  }

  // Bind each custom select instance
  const selects = document.querySelectorAll('.custom-select');

  selects.forEach(selectEl => {
    const selectId = selectEl.getAttribute('data-custom-select-id');
    const trigger = selectEl.querySelector('.custom-select-trigger');
    const dropdown = selectEl.querySelector('.custom-select-dropdown');
    const options = Array.from(selectEl.querySelectorAll('.custom-select-option'));

    if (!trigger || !dropdown) return;

    // Toggle dropdown on trigger click
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = selectEl.classList.contains('is-open');
      
      if (isOpen) {
        selectEl.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        selectEl.closest('.setting-card')?.classList.remove('has-open-dropdown');
      } else {
        closeAllCustomSelects(selectEl);
        selectEl.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        selectEl.closest('.setting-card')?.classList.add('has-open-dropdown');
      }
    });

    // Keyboard navigation on trigger button
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!selectEl.classList.contains('is-open')) {
          closeAllCustomSelects(selectEl);
          selectEl.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
          selectEl.closest('.setting-card')?.classList.add('has-open-dropdown');
        }
        // Focus the currently selected option or the first option
        const targetOption = options.find(opt => opt.classList.contains('is-selected')) || options[0];
        targetOption?.focus();
      }
    });

    // Options handling (click & keyboard)
    options.forEach((optionEl, index) => {
      const selectCurrentOption = () => {
        const val = optionEl.getAttribute('data-value');
        closeAllCustomSelects();
        if (val && onSelect) {
          onSelect(selectId, val);
        }
      };

      optionEl.addEventListener('click', (e) => {
        e.stopPropagation();
        selectCurrentOption();
      });

      optionEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectCurrentOption();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIndex = (index + 1) % options.length;
          options[nextIndex]?.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIndex = (index - 1 + options.length) % options.length;
          options[prevIndex]?.focus();
        } else if (e.key === 'Home') {
          e.preventDefault();
          options[0]?.focus();
        } else if (e.key === 'End') {
          e.preventDefault();
          options[options.length - 1]?.focus();
        } else if (e.key === 'Tab') {
          closeAllCustomSelects();
        }
      });
    });
  });
}
