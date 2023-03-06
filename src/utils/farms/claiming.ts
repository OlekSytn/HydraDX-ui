/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useApiPromise } from "utils/api"
import { ToastMessage, useStore } from "state/store"
import { useMutation } from "@tanstack/react-query"
import { decodeAddress } from "@polkadot/util-crypto"
import { u8aToHex } from "@polkadot/util"
import { DepositNftType, useAccountDeposits } from "api/deposits"
import { u32 } from "@polkadot/types"
import { useBestNumber } from "api/chain"
import { useFarms } from "api/farms"
import { getAccountResolver } from "./claiming/accountResolver"
import { useAssetDetailsList } from "api/assetDetails"
import { useSpotPrices } from "api/spotPrice"
import { AccountId32 } from "@polkadot/types/interfaces"
import { MultiCurrencyContainer } from "./claiming/multiCurrency"
import { OmnipoolLiquidityMiningClaimSim } from "./claiming/claimSimulator"
import { createMutableFarmEntries } from "./claiming/mutableFarms"
import { useApiIds } from "api/consts"
import { useAsset } from "api/asset"
import { useAccountAssetBalances } from "api/accountBalances"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import BigNumber from "bignumber.js"
import { BN_0 } from "utils/constants"
import { useQueryReduce } from "utils/helpers"

export const useClaimableAmount = (
  pool: OmnipoolPool,
  depositNft?: DepositNftType,
) => {
  const bestNumberQuery = useBestNumber()
  const userDeposits = useAccountDeposits(pool.id)
  const farms = useFarms(pool.id)

  const apiIds = useApiIds()
  const usd = useAsset(apiIds.data?.usdId)

  const api = useApiPromise()
  const accountResolver = getAccountResolver(api.registry)

  const assetIds = [
    ...new Set(farms.data?.map((i) => i.globalFarm.rewardCurrency.toString())),
  ]

  const assetList = useAssetDetailsList(assetIds)
  const usdSpotPrices = useSpotPrices(assetIds, usd.data?.id)

  const accountAddresses =
    farms.data
      ?.map(
        ({ globalFarm }) =>
          [
            [accountResolver(0), globalFarm.rewardCurrency],
            [accountResolver(globalFarm.id), globalFarm.rewardCurrency],
          ] as [AccountId32, u32][],
      )
      .flat(1) ?? []

  const accountBalances = useAccountAssetBalances(accountAddresses)

  return useQueryReduce(
    [bestNumberQuery, userDeposits, farms, assetList, accountBalances] as const,
    (bestNumberQuery, userDeposits, farms, assetList, accountBalances) => {
      const deposits = depositNft != null ? [depositNft] : userDeposits ?? []
      const bestNumber = bestNumberQuery

      const multiCurrency = new MultiCurrencyContainer(
        accountAddresses,
        accountBalances ?? [],
      )
      const simulator = new OmnipoolLiquidityMiningClaimSim(
        getAccountResolver(api.registry),
        multiCurrency,
        assetList ?? [],
      )

      const { globalFarms, yieldFarms } = createMutableFarmEntries(farms ?? [])

      return deposits
        ?.map((record) =>
          record.deposit.yieldFarmEntries.map((farmEntry) => {
            const aprEntry = farms?.find(
              (i) =>
                i.globalFarm.id.eq(farmEntry.globalFarmId) &&
                i.yieldFarm.id.eq(farmEntry.yieldFarmId),
            )

            if (!aprEntry) return null

            const reward = simulator.claim_rewards(
              globalFarms[aprEntry.globalFarm.id.toString()],
              yieldFarms[aprEntry.yieldFarm.id.toString()],
              farmEntry,
              bestNumber.relaychainBlockNumber.toBigNumber(),
            )

            const usd = usdSpotPrices.find(
              (spot) => spot.data?.tokenIn === reward?.assetId,
            )?.data

            if (!reward || !usd) return null
            return {
              usd: reward.value.multipliedBy(usd.spotPrice),
              asset: { id: reward?.assetId, value: reward.value },
            }
          }),
        )
        .flat(2)
        .reduce<{
          usd: BigNumber
          assets: Record<string, BigNumber>
        }>(
          (memo, item) => {
            if (item == null) return memo
            const { id, value } = item.asset
            memo.usd = memo.usd.plus(item.usd)
            !memo.assets[id]
              ? (memo.assets[id] = value)
              : (memo.assets[id] = memo.assets[id].plus(value))

            return memo
          },
          { usd: BN_0, assets: {} },
        )
    },
  )
}

export const useClaimAllMutation = (
  poolId: u32,
  depositNft?: DepositNftType,
  toast?: ToastMessage,
) => {
  const api = useApiPromise()
  const { createTransaction } = useStore()
  const userDeposits = useAccountDeposits(poolId)

  const deposits = depositNft ? [depositNft] : userDeposits.data

  return useMutation(async () => {
    const txs =
      deposits
        ?.map((deposit) =>
          deposit.deposit.yieldFarmEntries.map((entry) =>
            api.tx.omnipoolLiquidityMining.claimRewards(
              deposit.id,
              entry.yieldFarmId,
            ),
          ),
        )
        .flat(2) ?? []

    if (txs.length > 0) {
      return await createTransaction(
        { tx: txs.length > 1 ? api.tx.utility.batch(txs) : txs[0] },
        { toast },
      )
    }
  })
}

// @ts-expect-error
window.decodeAddressToBytes = (bsx: string) => u8aToHex(decodeAddress(bsx))
