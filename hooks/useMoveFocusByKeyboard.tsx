// React hook for moving focus with arrow buttons

import { useEffect } from "react";

const findNextFocusableElement = (direction: "next" | "previous") => {
  const currentlyFocusedElement = document.querySelector(
    "*:focus-visible"
  ) as HTMLElement;

  // this is needed if MUI modal is opened
  const nearestRoot =
    currentlyFocusedElement?.closest('[tabindex="-1"]') || document;
  const focusableElements =
    // get all focusable elements
    Array.from(nearestRoot.querySelectorAll('[tabindex="0"]'))
      // filter not visible elements
      .filter((element) => getComputedStyle(element).display !== "none");

  const indexOfCurrentlyFocusedElement = focusableElements.indexOf(
    currentlyFocusedElement
  );

  let indexOfNextElement: number;
  if (direction === "next") {
    indexOfNextElement =
      indexOfCurrentlyFocusedElement + 1 >= focusableElements.length
        ? 0
        : indexOfCurrentlyFocusedElement + 1;
  } else {
    indexOfNextElement =
      indexOfCurrentlyFocusedElement - 1 < 0
        ? focusableElements.length - 1
        : indexOfCurrentlyFocusedElement - 1;
  }

  return focusableElements[indexOfNextElement];
};

export const useMoveFocusByKeyboard = () => {
  useEffect(() => {
    const eventHandler = (event: KeyboardEvent) => {
      const node = event.target as HTMLElement;
      // If inside an input, ignore the event
      // Or else, the user will not be able navigate inside the input
      // with the keyboard
      if (node.nodeName === "INPUT" && node.getAttribute("type") === "text") {
        return;
      }

      // move focus by arrow key only when focus ring is visible
      const isFocusVisible = document.querySelector("*:focus-visible");
      if (!isFocusVisible) {
        return;
      }

      // on ArrowLeft, move focus to previous focusable element
      // on ArrowRight, move focus to next focusable element
      const keyList = ["ArrowLeft", "ArrowRight"];
      if (keyList.includes(event.key)) {
        event.preventDefault();

        const direction = event.key === "ArrowLeft" ? "previous" : "next";
        const target = findNextFocusableElement(direction) as HTMLElement;
        target?.focus();
        return;
      }
    };
    window.addEventListener("keydown", eventHandler);
    return () => {
      window.removeEventListener("keydown", eventHandler);
    };
  }, []);
};
