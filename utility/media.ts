// A function that generates React styled-components' css text with interpolation using backtick (``)

import { css } from "styled-components";

export const DeviceList = {
  mobile: `(min-width: 0px) and (max-width: 743px)`,
  foldable: `(min-width: 481px) and (max-width: 743px)`,
  tablet: `(min-width: 744px) and (max-width: 1199px)`,
  desktopSmall: `(min-width: 1200px) and (max-width: 1399px)`,
  desktopLarge: `(min-width: 1400px)`,
};

export type Device = keyof typeof DeviceList;

type First = Parameters<typeof css>[0];
type Interpolations = Parameters<typeof css>[1][];
const template =
  (device: Device) =>
  (first: First, ...interpolations: Interpolations) => {
    return css`
      @media ${DeviceList[device]} {
        ${css(first, ...interpolations)}
      }
    `;
  };

/**
 * @param devices list of device names (mobile, foldable, tablet, desktopSmall, desktopLarge)
 * @returns a function that takes a template string and returns a media query
 * @description follow the function declaration for the usage
 */
// Usage:
// device('mobile', 'tablet')`
//  color: red;
//  background-color: ${props => props.theme.colors.primary}
// `
const device =
  (...devices: Device[]) =>
  (first: First, ...interpolations: Interpolations) =>
    devices.map((device) => template(device)(first, ...interpolations));

export type Media = {
  [key in Device]: ReturnType<typeof template>;
};

// Usage:
// media.mobile`
//  color: red;
//  background-color: ${props => props.theme.colors.primary}
// `
const defaultQueries = Object.keys(DeviceList).reduce(
  (acc, device) => ({
    ...acc,
    [device]: template(device as Device),
  }),
  {} as Media
);

export const mediaQuery = {
  ...defaultQueries,
  device,
  desktop: device("desktopSmall", "desktopLarge"),
};
