import styled from "@emotion/styled"
import { css } from "@emotion/react"
import * as RadixSeparator from "@radix-ui/react-separator"
import { theme } from "theme"
import { SeparatorProps } from "./Separator"

export const SSeparator = styled(RadixSeparator.Root)<SeparatorProps>`
  background: ${(p) =>
    p.color ? theme.colors[p.color] : theme.colors.darkBlue400};
  opacity: ${(p) => p.opacity ?? 1};
  height: ${(p) => p.size ?? 1}px;
  width: 100%;
  color: ${(p) => (p.color ? theme.colors[p.color] : theme.colors.darkBlue400)};

  ${(p) =>
    p.orientation === "vertical" &&
    css`
      height: auto;
      width: ${p.size ?? 1}px;
    `}
`
