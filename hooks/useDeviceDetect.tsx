// React hook for detecting media devices based on the provided view port sizes

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type DeviceGroup = "desktopFriendly" | "mobileFriendly";

const desktopFriendly = ["desktopLarge", "desktopSmall", "tablet"];
const mobileFriendly = ["mobile", "foldable"];

export const Viewports = {
  mobile: {
    width: 480,
    height: 896,
  },
  foldable: {
    width: 743,
    height: 512,
  },
  tablet: {
    width: 1199,
    height: 1024,
  },
  desktopSmall: {
    width: 1200,
    height: 1080,
  },
  desktopLarge: {
    width: 1400,
    height: 1080,
  },
};

export const getDeviceGroup = (
  device: Exclude<DeviceType, null>
): DeviceGroup | undefined => {
  if (desktopFriendly.includes(device)) {
    return "desktopFriendly";
  } else if (mobileFriendly.includes(device)) {
    return "mobileFriendly";
  }
};

export type DeviceType =
  | "mobile"
  | "foldable"
  | "tablet"
  | "desktopSmall"
  | "desktopLarge"
  | null;

const DeviceDetectContext = createContext<DeviceType>(null);

const getDevice = () => {
  let device = null as DeviceType;
  const width = window.innerWidth;
  const { mobile, foldable, tablet, desktopSmall, desktopLarge } = Viewports;

  if (0 < width && width <= mobile.width) {
    device = "mobile";
  } else if (mobile.width < width && width <= foldable.width) {
    device = "foldable";
  } else if (foldable.width < width && width <= tablet.width) {
    device = "tablet";
  } else if (desktopSmall.width <= width && width < desktopLarge.width) {
    device = "desktopSmall";
  } else if (width >= desktopLarge.width) {
    device = "desktopLarge";
  }

  return device;
};

export const DeviceDetectContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [device, setDevice] = useState<DeviceType>(getDevice());

  useEffect(() => {
    const handleResize = () => {
      // get current device type
      const device = getDevice();
      // set new device type
      setDevice(device);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <DeviceDetectContext.Provider value={device}>
      {children}
    </DeviceDetectContext.Provider>
  );
};

// This hook is used to call a function when the device type changes
export const useCallOnMediaChange = (callback: () => void) => {
  const device = useContext(DeviceDetectContext);
  const memoizedDeviceType = useRef<undefined | DeviceType>(undefined);

  useEffect(() => {
    const previousDeviceType = memoizedDeviceType.current;
    const currentDeviceType = getDevice();

    if (
      previousDeviceType !== undefined &&
      previousDeviceType !== currentDeviceType
    ) {
      callback();
    }

    return () => {
      memoizedDeviceType.current = currentDeviceType;
    };
  }, [callback, device]);
};

// This hook is used to get the device type and to check if the device is mobile, foldable, tablet, desktopSmall or desktopLarge
export const useDeviceDetect = () => {
  const device = useContext(DeviceDetectContext);

  return {
    device: useContext<DeviceType>(DeviceDetectContext),
    isMobile: useMemo(() => device === "mobile", [device]),
    isFoldable: useMemo(() => device === "foldable", [device]),
    isTablet: useMemo(() => device === "tablet", [device]),
    isDesktopSmall: useMemo(() => device === "desktopSmall", [device]),
    isDesktopLarge: useMemo(() => device === "desktopLarge", [device]),
    isMobileFriendly: useMemo(
      () => ["mobile", "foldable"].includes(device || ""),
      [device]
    ),
    isDesktopFriendly: useMemo(
      () => ["tablet", "desktopSmall", "desktopLarge"].includes(device || ""),
      [device]
    ),
    isDesktop: useMemo(
      () => ["desktopSmall", "desktopLarge"].includes(device || ""),
      [device]
    ),
  };
};
