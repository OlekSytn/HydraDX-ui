import { css, SerializedStyles } from "@emotion/react"
import styled from "@emotion/styled"
import { theme } from "theme"
import { ButtonProps, ButtonSize, ButtonVariant } from "./Button"

export const SButton = styled.button<ButtonProps>`
  cursor: pointer;
  text-transform: ${({ transform }) => transform ?? "uppercase"};

  border: none;
  border-radius: 4px;

  transition: ${theme.transitions.slow};

  ${({ variant }) => variant && variantStyles[variant]}
  ${({ size }) => size && sizeStyles[size]}
  ${({ active }) =>
    active &&
    css`
      background: ${theme.colors.brightBlue700};

      border: 1px solid ${theme.colors.brightBlue700};

      transition: all ${theme.transitions.default};
    `}

    ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}

  &:disabled {
    cursor: not-allowed;
    box-shadow: unset;
    transform: none;

    color: ${theme.colors.darkBlue300};
    border: 1px solid ${theme.colors.darkBlue300};
    background: rgba(${theme.rgbColors.alpha0}, 0.06);

    opacity: 0.7;

    &::after,
    &::before {
      all: unset;
    }
  }

  ${({ isLoading }) =>
    isLoading &&
    css`
      background: rgba(218, 255, 238, 0.06);
    `}
`

export const SContent = styled.span`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
`
export const SButtonTransparent = styled.button`
  background: transparent;
  margin: 0;
  padding: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  &[disabled] {
    cursor: unset;
  }
`

const variantStyles: Record<ButtonVariant, SerializedStyles> = {
  primary: css`
    background: ${theme.colors.pink700};
    color: ${theme.colors.white};

    position: relative;

    -webkit-transition: all 0.3s, background 0.1s, border 0.1s;
    transition: all 0.3s, background 0.1s, border 0.1s;

    box-shadow: rgb(246 40 124 / 45%) 0px 13px 40px -12px,
      rgb(195 145 199 / 30%) 0px 0px 0px -1px;

    border: 1px solid transparent;

    transform-style: preserve-3d;

    :before {
      content: "";
      position: absolute;
      inset: 0;

      height: 100%;
      width: 100%;

      background: linear-gradient(
        129deg,
        rgba(122, 96, 138, 0.25) 0%,
        rgba(255, 153, 202, 0.23) 100%
      );

      border-radius: 4px;

      transform: translate3d(0px, 0px, -1px);
      -webkit-transition: 0.3s;
      transition: 0.3s;
    }

    :hover:before {
      transform: translate3d(5px, 5px, -1px);
    }

    :hover {
      background: ${theme.colors.pink600};

      border: 1px solid rgba(255, 212, 222, 0.2);

      box-shadow: rgb(255 15 111 / 30%) 4px 10px 40px 0px;

      transform: translate(-5px, -5px);
      transform-style: preserve-3d;
    }

    :active {
      transform: translate3d(-3px, -3px, -1px);
      box-shadow: 0px 13px 40px -12px rgba(246, 41, 124, 0.45);
    }

    :active:before {
      transform: translate3d(3px, 3px, -1px);
    }
  `,
  secondary: css`
    border-radius: 4px;
    background: rgba(${theme.rgbColors.primaryA15}, 0.12);
    color: ${theme.colors.brightBlue300};
    border: 1px solid ${theme.colors.brightBlue300};
    box-shadow: unset;

    :hover {
      background: rgba(${theme.rgbColors.brightBlue500}, 0.9);
      color: ${theme.colors.white};
      border: 1px solid ${theme.colors.brightBlue100};
    }

    :active {
      background: ${theme.colors.brightBlue400};
      color: ${theme.colors.white};
      border: 1px solid ${theme.colors.brightBlue100};
    }
  `,
  gradient: css`
    background: ${theme.gradients.pinkLightPink};
    color: ${theme.colors.white};

    position: relative;
    overflow: hidden;

    :hover {
      &::after {
        content: "";

        width: 100%;
        height: 100%;

        position: absolute;
        top: 0;
        left: 0;

        background: rgba(${theme.rgbColors.white}, 0.2);
      }
    }
    :active {
      &::after {
        background: rgba(${theme.rgbColors.black}, 0.2);
      }
    }
  `,
  outline: css`
    background: rgba(${theme.rgbColors.white}, 0.03);
    color: ${theme.colors.white};

    border: 1px solid rgba(${theme.rgbColors.white}, 0.1);

    :hover,
    :active {
      background: ${theme.colors.brightBlue700};
      border: 1px solid ${theme.colors.brightBlue700};

      transition: all ${theme.transitions.default};
    }
  `,
  transparent: css`
    background: transparent;
    color: ${theme.colors.brightBlue600};
  `,
}

const sizeStyles: Record<ButtonSize, SerializedStyles> = {
  medium: css`
    padding: 16px 23px;
    font-size: 14px;
  `,
  small: css`
    padding: 12px 15px;
    font-size: 12px;
    line-height: 12px;
  `,
  micro: css`
    padding: 2px 10px;
    font-size: 12px;
    line-height: 16px;
  `,
}
