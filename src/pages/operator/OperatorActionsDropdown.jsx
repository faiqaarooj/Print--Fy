import { useState, useRef, useEffect, useCallback, useId, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from '../../components/dashboard/DashboardIcons';
import { getJobTransitions } from './jobTransitions';
import OperatorStatusChip from './OperatorStatusChip';

/**
 * OperatorActionsDropdown:
 * Renders the "Actions" dropdown on each operator card based on jobTransitions.js.
 *
 * Requirements:
 * - Trigger: "Actions" button with chevron.
 * - FIRST line: non-clickable header "{fileName} · Status: {status chip}".
 * - Destructive items (Cancel job, Undo ...) are red and separated by a divider.
 * - Blocked items stay visible, disabled, with a reason line under them.
 * - Keyboard navigation: Enter/Space opens, arrows move, Enter selects, Escape closes and restores focus to trigger.
 * - Closes on outside click.
 * - Menu overlays the page via createPortal to document.body, never clipped by card containers.
 * - Items are at least 44px tall on narrow screens.
 */
export default function OperatorActionsDropdown({ job, onAction, onOpenChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const itemRefs = useRef([]);
  const menuId = useId();
  const triggerId = useId();

  // Obtain menu items from jobTransitions.js
  const { menuItems } = useMemo(() => getJobTransitions(job), [job]);

  // Separate regular vs destructive items
  const regularItems = useMemo(
    () => menuItems.filter((item) => item.kind !== 'undo' && item.kind !== 'cancel' && item.id !== 'cancel_job'),
    [menuItems]
  );

  const destructiveItems = useMemo(
    () => menuItems.filter((item) => item.kind === 'undo' || item.kind === 'cancel' || item.id === 'cancel_job'),
    [menuItems]
  );

  const allItems = useMemo(() => [...regularItems, ...destructiveItems], [regularItems, destructiveItems]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 250;

    // Align right edge of menu with right edge of button
    let left = rect.right - menuWidth;
    if (left < 10) left = 10;
    if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }

    const estimatedHeight = allItems.length * 48 + 70;
    let top = rect.bottom + 4;
    // Flip above if reaching bottom of viewport
    if (top + estimatedHeight > window.innerHeight && rect.top > estimatedHeight) {
      top = rect.top - estimatedHeight - 4;
    }

    setMenuPosition({ top, left });
  }, [allItems.length]);

  const handleOpen = (initialIndex = 0) => {
    updatePosition();
    setIsOpen(true);
    if (onOpenChange) {
      onOpenChange(true);
    }

    // Find first enabled item from target
    let target = initialIndex;
    if (allItems[target]?.disabled) {
      const firstEnabled = allItems.findIndex((it) => !it.disabled);
      if (firstEnabled !== -1) target = firstEnabled;
    }
    setFocusedIndex(target);
  };

  const handleClose = (restoreFocus = true) => {
    setIsOpen(false);
    setFocusedIndex(-1);
    if (onOpenChange) {
      onOpenChange(false);
    }
    if (restoreFocus && triggerRef.current) {
      triggerRef.current.focus();
    }
  };

  const handleToggle = () => {
    if (isOpen) {
      handleClose(true);
    } else {
      handleOpen(0);
    }
  };

  const handleSelect = (item) => {
    if (item.disabled) return;
    handleClose(true);
    if (onAction) {
      onAction(item);
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        handleClose(false);
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    document.addEventListener('mousedown', handleOutsideClick, true);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, true);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  // Focus active item when focusedIndex changes
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex].focus();
    }
  }, [isOpen, focusedIndex]);

  // Trigger keyboard handling
  const handleTriggerKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen(0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleOpen(allItems.length - 1);
    }
  };

  // Menu keyboard handling
  const handleMenuKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose(true);
    } else if (e.key === 'Tab') {
      handleClose(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      let nextIndex = (focusedIndex + 1) % allItems.length;
      for (let i = 0; i < allItems.length; i += 1) {
        const candidate = (focusedIndex + 1 + i) % allItems.length;
        if (!allItems[candidate].disabled) {
          nextIndex = candidate;
          break;
        }
      }
      setFocusedIndex(nextIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      let prevIndex = (focusedIndex - 1 + allItems.length) % allItems.length;
      for (let i = 0; i < allItems.length; i += 1) {
        const candidate = (focusedIndex - 1 - i + allItems.length) % allItems.length;
        if (!allItems[candidate].disabled) {
          prevIndex = candidate;
          break;
        }
      }
      setFocusedIndex(prevIndex);
    } else if (e.key === 'Home') {
      e.preventDefault();
      const firstEnabled = allItems.findIndex((it) => !it.disabled);
      if (firstEnabled !== -1) setFocusedIndex(firstEnabled);
    } else if (e.key === 'End') {
      e.preventDefault();
      for (let i = allItems.length - 1; i >= 0; i -= 1) {
        if (!allItems[i].disabled) {
          setFocusedIndex(i);
          break;
        }
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focusedIndex >= 0 && allItems[focusedIndex]) {
        handleSelect(allItems[focusedIndex]);
      }
    }
  };

  return (
    <div className="operator-dropdown-wrapper">
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        className={`operator-actions-trigger-btn ${isOpen ? 'is-active' : ''}`}
        onClick={handleToggle}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
      >
        <span>Actions</span>
        <ChevronDownIcon size={14} className="operator-trigger-chevron" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-labelledby={triggerId}
            className="operator-actions-dropdown-menu"
            style={{
              position: 'fixed',
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              zIndex: 2000,
            }}
            onKeyDown={handleMenuKeyDown}
          >
            {/* FIRST LINE: Non-clickable header "{fileName} · Status: {status chip}" */}
            <div className="operator-dropdown-header" role="presentation" aria-hidden="true">
              <span className="operator-dropdown-header-filename" title={job.fileName}>
                {job.fileName}
              </span>
              <span className="operator-dropdown-header-sep">·</span>
              <span className="operator-dropdown-header-status-label">Status:</span>
              <OperatorStatusChip job={job} compact />
            </div>

            <div className="operator-dropdown-divider" role="separator" />

            {/* Regular Non-Destructive Items */}
            {regularItems.map((item, index) => {
              const isFocused = focusedIndex === index;
              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={isFocused ? 0 : -1}
                  disabled={item.disabled}
                  className={`operator-dropdown-item ${item.disabled ? 'is-disabled' : ''}`}
                  onClick={() => handleSelect(item)}
                >
                  <span className="operator-dropdown-item-label">{item.label}</span>
                  {item.disabled && item.disabledReason && (
                    <span className="operator-dropdown-item-reason">{item.disabledReason}</span>
                  )}
                </button>
              );
            })}

            {/* Divider separating destructive items */}
            {destructiveItems.length > 0 && regularItems.length > 0 && (
              <div className="operator-dropdown-divider" role="separator" />
            )}

            {/* Destructive items (Cancel job, Undo ...) styled red */}
            {destructiveItems.map((item, dIdx) => {
              const overallIndex = regularItems.length + dIdx;
              const isFocused = focusedIndex === overallIndex;
              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current[overallIndex] = el;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={isFocused ? 0 : -1}
                  disabled={item.disabled}
                  className={`operator-dropdown-item is-destructive ${item.disabled ? 'is-disabled' : ''}`}
                  onClick={() => handleSelect(item)}
                >
                  <span className="operator-dropdown-item-label">{item.label}</span>
                  {item.disabled && item.disabledReason && (
                    <span className="operator-dropdown-item-reason">{item.disabledReason}</span>
                  )}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
