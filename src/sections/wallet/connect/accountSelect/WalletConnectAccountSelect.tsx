import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { WalletConnectAccountSelectItem } from "sections/wallet/connect/accountSelect/item/WalletConnectAccountSelectItem"
import { Account } from "state/store"
import { getWalletBySource } from "@talismn/connect-wallets"
import { SContainer } from "./WalletConnectAccountSelect.styled"
import { externalWallet } from "state/store"

type Props = {
  provider: string
  onSelect: (account: Account) => void
  currentAddress: string | undefined
}

export const WalletConnectAccountSelect = ({
  provider,
  onSelect,
  currentAddress,
}: Props) => {
  const { t } = useTranslation("translation")
  const isExternalWallet = provider === externalWallet.provider

  const accounts = useQuery(
    ["web3Accounts", provider],
    async () => {
      const wallet = getWalletBySource(provider)
      return await wallet?.getAccounts()
    },
    { enabled: !isExternalWallet },
  )

  return (
    <>
      <Text fw={400} color="basic400" sx={{ mt: 6 }}>
        {t("walletConnect.accountSelect.description")}
      </Text>

      <SContainer>
        {currentAddress && isExternalWallet ? (
          <WalletConnectAccountSelectItem
            isActive
            provider={provider}
            name={externalWallet.name}
            address={currentAddress}
            setAccount={() => {
              onSelect({
                name: externalWallet.name,
                address: currentAddress,
                provider,
                isExternalWalletConnected: true,
              })
            }}
          />
        ) : (
          accounts.data
            // As Talisman allows Ethereum accounts to be added as well, filter these accounts out
            // as I believe these are not supported on Basilisk / HydraDX
            // @ts-expect-error
            ?.filter((i) => i.type !== "ethereum" && i.type !== "ecdsa")
            ?.map((account) => {
              const accountName = account.name ?? account.address
              return (
                <WalletConnectAccountSelectItem
                  isActive={currentAddress === account.address}
                  provider={provider}
                  key={account.address}
                  name={accountName}
                  address={account.address}
                  setAccount={() => {
                    onSelect({
                      name: accountName,
                      address: account.address,
                      provider,
                      isExternalWalletConnected: false,
                    })
                  }}
                />
              )
            })
        )}
      </SContainer>
    </>
  )
}
