import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { useAccountStore } from "state/store"
import { useMemo } from "react"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { useAssetMetaList } from "api/assetMeta"
import { getAssetName } from "components/AssetIcon/AssetIcon"
import BN from "bignumber.js"
import { useTokensBalances } from "api/balances"
import { BN_10, BN_NAN } from "utils/constants"
import { useUniques } from "api/uniques"
import { useOmnipoolAssets, useOmnipoolPositions } from "api/omnipool"
import { useSpotPrices } from "api/spotPrice"
import {
  calculate_liquidity_lrna_out,
  calculate_liquidity_out,
} from "@galacticcouncil/math-omnipool"
import { useApiIds } from "api/consts"
import { useAssetDetailsList } from "api/assetDetails"
import { isNotNil } from "utils/helpers"

export const useHydraPositionsData = () => {
  const { account } = useAccountStore()
  const apiIds = useApiIds()
  const uniques = useUniques(
    account?.address ?? "",
    apiIds.data?.omnipoolCollectionId ?? "",
  )
  const positions = useOmnipoolPositions(
    uniques.data?.map((u) => u.itemId) ?? [],
  )

  const metas = useAssetMetaList([
    apiIds.data?.usdId,
    apiIds.data?.hubId,
    ...positions.map((query) => query.data?.assetId),
  ])

  const detailsList = useAssetDetailsList(
    positions.map((p) => p.data?.assetId?.toString()) ?? [],
  )
  const omnipoolAssets = useOmnipoolAssets()
  const omnipoolBalances = useTokensBalances(
    positions.map((p) => p.data?.assetId).filter(isNotNil) ?? [],
    OMNIPOOL_ACCOUNT_ADDRESS,
  )
  const spotPrices = useSpotPrices(
    [apiIds.data?.hubId, ...(positions?.map((p) => p.data?.assetId) ?? [])],
    apiIds.data?.usdId,
  )

  const queries = [
    apiIds,
    uniques,
    metas,
    detailsList,
    omnipoolAssets,
    ...positions,
    ...omnipoolBalances,
    ...spotPrices,
  ]
  const isLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !uniques.data ||
      !metas.data ||
      !omnipoolAssets.data ||
      !apiIds.data ||
      positions.some((q) => !q.data) ||
      omnipoolBalances.some((q) => !q.data) ||
      spotPrices.some((q) => !q.data)
    )
      return []

    const rows: HydraPositionsTableData[] = positions
      .map((query) => {
        const position = query.data
        if (!position) return null

        const assetId = position.assetId.toString()
        const meta = metas.data.find((m) => m.id.toString() === assetId)
        const details = detailsList.data?.find(
          (d) => d.id.toString() === assetId,
        )
        const lrnaMeta = metas.data.find(
          (m) => m.id.toString() === apiIds.data.hubId,
        )
        const omnipoolAsset = omnipoolAssets.data.find(
          (a) => a.id.toString() === assetId,
        )
        const omnipoolBalance = omnipoolBalances.find(
          (b) => b.data?.assetId.toString() === assetId,
        )

        const symbol = meta?.symbol || "N/A"
        const name = details?.name || getAssetName(meta?.symbol)

        const [nom, denom] = position.price.map((n) => new BN(n.toString()))
        const price = nom.div(denom)
        const positionPrice = price.times(BN_10.pow(18))

        let lernaOutResult = "-1"
        let liquidityOutResult = "-1"

        if (omnipoolBalance?.data && omnipoolAsset?.data) {
          const params: Parameters<typeof calculate_liquidity_out> = [
            omnipoolBalance.data.balance.toString(),
            omnipoolAsset.data.hubReserve.toString(),
            omnipoolAsset.data.shares.toString(),
            position.amount.toString(),
            position.shares.toString(),
            positionPrice.toFixed(0),
            position.shares.toString(),
          ]
          lernaOutResult = calculate_liquidity_lrna_out.apply(this, params)
          liquidityOutResult = calculate_liquidity_out.apply(this, params)

          // console.table([
          //   ["position asset id", "", id],
          //   [
          //     "omnipool balance",
          //     "asset_reserve",
          //     omnipoolBalance.data.balance.toString(),
          //   ],
          //   [
          //     "asset hub reserve",
          //     "asset_hub_reserve",
          //     omnipoolAsset.data.hubReserve.toString(),
          //   ],
          //   [
          //     "asset shares",
          //     "asset_shares",
          //     omnipoolAsset.data.shares.toString(),
          //   ],
          //   ["position amount", "position_amount", position.amount.toString()],
          //   ["position shares", "position_shares", position.shares.toString()],
          //   ["position price", "position_price", positionPrice.toFixed(0)],
          //   ["position shares", "shares_to_remove", position.shares.toString()],
          //   ["calculate_liquidity_out", "", liquidityOutResult],
          //   ["calculate_liquidity_lrna_out", "", lernaOutResult],
          // ])
        }

        const lrnaSp = spotPrices.find(
          (sp) => sp.data?.tokenIn === apiIds.data.hubId,
        )
        const lrnaDp = BN_10.pow(lrnaMeta?.decimals.toNumber() ?? 12)
        const lrna =
          lernaOutResult !== "-1" ? new BN(lernaOutResult).div(lrnaDp) : BN_NAN

        const valueSp = spotPrices.find((sp) => sp.data?.tokenIn === assetId)
        const valueDp = BN_10.pow(meta?.decimals.toNumber() ?? 12)
        const value =
          liquidityOutResult !== "-1"
            ? new BN(liquidityOutResult).div(valueDp)
            : BN_NAN
        let valueUSD = BN_NAN

        const providedAmount = position.amount.toBigNumber().div(valueDp)
        let providedAmountUSD = BN_NAN

        const shares = position.shares.toBigNumber()

        if (liquidityOutResult !== "-1" && valueSp?.data) {
          valueUSD = value.times(valueSp.data.spotPrice)

          if (lrna.gt(0)) {
            valueUSD = !lrnaSp?.data
              ? BN_NAN
              : valueUSD.plus(lrna.times(lrnaSp.data.spotPrice))
          }
        }

        if (valueSp?.data)
          providedAmountUSD = providedAmount.times(valueSp.data.spotPrice)

        const result = {
          id: position.id.toString(),
          assetId,
          symbol,
          name,
          lrna,
          value,
          valueUSD,
          price,
          providedAmount: position.amount.toBigNumber(),
          providedAmountUSD,
          shares,
        }

        return result
      })
      .filter((x): x is HydraPositionsTableData => x !== null)
      .sort((a, b) => parseInt(a.id) - parseInt(b.id))

    return rows
  }, [
    uniques.data,
    positions,
    metas.data,
    detailsList.data,
    omnipoolAssets.data,
    apiIds.data,
    omnipoolBalances,
    spotPrices,
  ])

  return {
    data,
    isLoading,
    refetch: uniques.refetch,
  }
}
