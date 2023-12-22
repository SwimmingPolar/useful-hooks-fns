// React hook for calculating scrollbar width

import { useEffect, useLayoutEffect, useState } from "react";

// Create a singleton backup variable in a closure
const { getBackupScrollbarWidth, cacheBackupScrollbarWidth } = (() => {
  let backupScrollbarWidth: number;
  return {
    getBackupScrollbarWidth: () => backupScrollbarWidth,
    cacheBackupScrollbarWidth: (scrollbarWidth: number) => {
      backupScrollbarWidth = scrollbarWidth;
    },
  };
})();

export const getScrollbarWidth = () => {
  // First calculate the width of the scrollbar from the browser
  // If the scrollbar exists, the width will be greater than 0
  const viewportWidth = window.innerWidth;
  const documentWidth = document.documentElement.getBoundingClientRect().width;
  let scrollbarWidth = viewportWidth - documentWidth;

  if (scrollbarWidth > 0) {
    return scrollbarWidth;
  }

  const hiddenElement = document.createElement("div");
  // Create a hidden element that is just longer than the viewport
  hiddenElement.style.height = "calc(100vh + 1px)";
  hiddenElement.style.visibility = "hidden";

  // Make sure the scrollbar is visible
  const overflowStyle = document.documentElement.style.overflowY;
  document.documentElement.style.overflowY = "scroll";

  // Append the hidden element it to the body
  document.body.appendChild(hiddenElement);

  // Calculate the width of the scrollbar
  // by subtracting the width of the hidden element from the window width
  scrollbarWidth = window.innerWidth - hiddenElement.clientWidth;

  // Remove the hidden element
  document.body.removeChild(hiddenElement);

  // Restore the original overflow style
  document.documentElement.style.overflowY = overflowStyle;

  return scrollbarWidth;
};

/**
 *  To calculate the width of the scrollbar
 *
 *  1. Try to get the scrollbar width from the browser.
 *     By calculating the difference between the window width and the document width.
 *     If the scrollbar exists, the width will be greater than 0
 *
 *
 *  2. On desktop, to get the scrollbarWidth, we create a hidden element and append it to the body.
 *     Then, set the height of the hidden element to 100vh + 1px.
 *     This will force the scrollbar to appear but not visible to the user.
 *     Then, subtract the width of the hidden element from the window width.
 *     This will give us the width of the scrollbar.
 *
 */

export const useScrollbarWidth = () => {
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  // Initial scrollbar width
  useLayoutEffect(() => {
    // Get the initial scrollbar width
    const scrollbarWidth = getScrollbarWidth();

    // Save it as a backup
    cacheBackupScrollbarWidth(scrollbarWidth);

    // Update the scrollbarWidth state
    setScrollbarWidth(scrollbarWidth);
  }, []);

  // Get scrollbar width on window resize
  useEffect(() => {
    const handleResize = () => {
      const scrollbarWidth = getScrollbarWidth();

      // Will only update the scrollbar width if it's different from the backup
      if (scrollbarWidth !== getBackupScrollbarWidth()) {
        setScrollbarWidth(scrollbarWidth);
        cacheBackupScrollbarWidth(scrollbarWidth);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return scrollbarWidth;
};
