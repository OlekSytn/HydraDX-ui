import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  --scrollbar-url: url("images/Scrollbar.svg");
  margin: -16px -12px;

  @media (${theme.viewport.gte.sm}) {
    margin: unset;
  }

  @media (${theme.viewport.lt.xs}) {
    display: flex;
    flex: 1;
    background: #111320;

    gc-xcm-app {
      flex: 1;
    }
  }
`
