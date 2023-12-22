// Cypress run a test against different media devices

export const Viewports = {
  mobile: {
    width: 414,
    height: 896,
  },
  foldable: {
    width: 717,
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

export type DeviceType =
  | "mobile"
  | "foldable"
  | "tablet"
  | "desktopSmall"
  | "desktopLarge";

export type DeviceGroup = "desktopFriendly" | "mobileFriendly";

const desktopFriendly = ["desktopLarge", "desktopSmall", "tablet"];
const mobileFriendly = ["mobile", "foldable"];

const getDeviceGroup = (device: DeviceType): DeviceGroup | undefined => {
  if (desktopFriendly.includes(device)) {
    return "desktopFriendly";
  } else if (mobileFriendly.includes(device)) {
    return "mobileFriendly";
  }
};

type TestParams = {
  device: DeviceType;
  deviceGroup: DeviceGroup;
};
type Test = (params: TestParams) => void;

export function withMedia(test: Test, devices?: Array<DeviceType>) {
  // Copy Viewports to avoid mutating it
  const viewports = Object.assign({}, Viewports);

  // If 'devices' is not provided, run test against all devices
  devices = (
    devices && devices?.length !== 0 ? devices : Object.keys(Viewports)
  ) as Array<DeviceType>;

  devices.forEach((device) => {
    // Type force casting: 'deviceGroup' will never be undefined even though it returns undefined when nothing matched
    const deviceGroup = getDeviceGroup(device) as DeviceGroup;

    it(`${device}: `, () => {
      // Change the viewport size to the device's size
      cy.viewport(viewports[device].width, viewports[device].height);

      // Run test under the device's viewport
      test({
        device,
        deviceGroup,
      });
    });
  });
}

function assessTitle(deviceGroup: DeviceGroup) {
  if (deviceGroup === "desktopFriendly") {
    cy.get("h1").should("contain", "coming from desktop");
  } else {
    cy.get("h1").should("contain", "coming from mobile");
  }
}

describe("Find header", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  // This runs test against all devices
  withMedia(({ device, deviceGroup }) => {
    // Test code here
    assessTitle(deviceGroup);
  });

  // This runs test against given devices
  withMedia(
    ({ device, deviceGroup }) => {
      // Test code here
      assessTitle(deviceGroup);
    },
    ["desktopLarge", "desktopSmall", "tablet"]
  );
});
