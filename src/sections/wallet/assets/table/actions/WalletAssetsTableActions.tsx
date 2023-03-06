import { ReactComponent as BuyIcon } from "assets/icons/BuyIcon.svg"
import { ReactComponent as ChevronDownIcon } from "assets/icons/ChevronDown.svg"
import { ReactComponent as ChevronRightIcon } from "assets/icons/ChevronRight.svg"
import { ReactComponent as MoreIcon } from "assets/icons/MoreDotsIcon.svg"
import { ReactComponent as SellIcon } from "assets/icons/SellIcon.svg"
import { ReactComponent as TransferIcon } from "assets/icons/TransferIcon.svg"
//import { ReactComponent as ClaimIcon } from "assets/icons/ClaimIcon.svg"
import { ReactComponent as DollarIcon } from "assets/icons/DollarIcon.svg"
import { ButtonTransparent } from "components/Button/Button"
import { Dropdown } from "components/Dropdown/Dropdown"
import { TableAction } from "components/Table/Table"
import { Trans, useTranslation } from "react-i18next"
import { theme } from "theme"
import { isNotNil } from "utils/helpers"
import { useSetAsFeePayment } from "api/payments"
import { useAccountStore } from "state/store"

type Props = {
  toggleExpanded: () => void
  symbol: string
  id: string
  onBuyClick: (() => void) | undefined
  onSellClick: (() => void) | undefined
  onTransferClick: () => void
  couldBeSetAsPaymentFee: boolean
  isExpanded: boolean
}

export const WalletAssetsTableActions = (props: Props) => {
  const { t } = useTranslation()
  const setFeeAsPayment = useSetAsFeePayment()
  const { account } = useAccountStore()

  const actionItems = [
    /*{
      key: "add",
      icon: <ClaimIcon />,
      label: t("wallet.assets.table.actions.claim"),
    },*/
    props.couldBeSetAsPaymentFee
      ? {
          key: "setAsFeePayment",
          icon: <DollarIcon />,
          label: t("wallet.assets.table.actions.payment.asset"),
        }
      : null,
  ].filter(isNotNil)

  return (
    <>
      <div sx={{ display: ["block", "none"] }}>
        <ButtonTransparent css={{ color: theme.colors.iconGray }}>
          <ChevronRightIcon />
        </ButtonTransparent>
      </div>
      <div
        sx={{
          flex: "row",
          gap: 10,
          display: ["none", "flex"],
          align: "center",
        }}
      >
        <TableAction
          icon={<BuyIcon />}
          onClick={props.onBuyClick}
          disabled={
            props.onBuyClick == null || account?.isExternalWalletConnected
          }
        >
          {t("wallet.assets.table.actions.buy")}
        </TableAction>
        <TableAction
          icon={<SellIcon />}
          onClick={props.onSellClick}
          disabled={
            props.onSellClick == null || account?.isExternalWalletConnected
          }
        >
          {t("wallet.assets.table.actions.sell")}
        </TableAction>
        <TableAction
          icon={<TransferIcon />}
          onClick={props.onTransferClick}
          disabled={account?.isExternalWalletConnected}
        >
          {t("wallet.assets.table.actions.transfer")}
        </TableAction>

        <Dropdown
          items={account?.isExternalWalletConnected ? [] : actionItems}
          onSelect={(item) => {
            if (item === "setAsFeePayment") {
              setFeeAsPayment(props.id, {
                onLoading: (
                  <Trans
                    t={t}
                    i18nKey="wallet.assets.table.actions.payment.toast.onLoading"
                    tOptions={{
                      asset: props.symbol,
                    }}
                  >
                    <span />
                    <span className="highlight" />
                  </Trans>
                ),
                onSuccess: (
                  <Trans
                    t={t}
                    i18nKey="wallet.assets.table.actions.payment.toast.onSuccess"
                    tOptions={{
                      asset: props.symbol,
                    }}
                  >
                    <span />
                    <span className="highlight" />
                  </Trans>
                ),
                onError: (
                  <Trans
                    t={t}
                    i18nKey="wallet.assets.table.actions.payment.toast.onLoading"
                    tOptions={{
                      asset: props.symbol,
                    }}
                  >
                    <span />
                    <span className="highlight" />
                  </Trans>
                ),
              })
            }
          }}
        >
          <MoreIcon />
        </Dropdown>

        <ButtonTransparent
          onClick={props.toggleExpanded}
          css={{
            color: theme.colors.iconGray,
            opacity: props.isExpanded ? "1" : "0.5",
            transform: props.isExpanded ? "rotate(180deg)" : undefined,
          }}
        >
          <ChevronDownIcon />
        </ButtonTransparent>
      </div>
    </>
  )
}
