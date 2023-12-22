// Hide scrollbar from the viewport without degrading UX on modal or popover activation.

// Add to index.css
// body.hide-scroll {
//  position: fixed;
//  width: 100%;
// }

import { useEffect, useMemo } from "react";
import { v4 as uuid } from "uuid";

const scrollLockConsumers = new Map<string, boolean>();

type StylesBackupType = {
  scrollTop: number;
};

export const useScrollbarLock = (open: boolean) => {
  const id = useMemo(() => uuid(), []);

  useEffect(() => {
    const stylesBackup = {} as StylesBackupType;

    if (open) {
      scrollLockConsumers.set(id, true);

      // Backup the current styles
      stylesBackup.scrollTop = window.scrollY;

      // Maintain the scroll position
      document.body.style.top = `-${stylesBackup.scrollTop}px`;

      // Hide the scrollbar
      document.body.classList.add("hide-scroll");
    }

    return () => {
      if (open) {
        scrollLockConsumers.delete(id);

        if (scrollLockConsumers.size === 0) {
          // Show the scrollbar
          document.body.classList.remove("hide-scroll");

          // Restore the scrollbar position
          window.scrollTo(0, stylesBackup.scrollTop);
        }
      }
    };
  }, [open]);
};
