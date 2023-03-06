import { useMutation } from "@tanstack/react-query"
import { DepositNftType } from "api/deposits"
import { Farm } from "api/farms"
import { useStore } from "state/store"
import { useApiPromise } from "utils/api"

export const useFarmRedepositMutation = (
  availableYieldFarms: Farm[] | undefined,
  depositNfts: DepositNftType[],
) => {
  const api = useApiPromise()
  const { createTransaction } = useStore()

  return useMutation(async () => {
    if (!availableYieldFarms?.length)
      throw new Error("No available farms to redeposit into")

    const txs = depositNfts
      .map((record) => {
        return availableYieldFarms.map((farm) => {
          return api.tx.omnipoolLiquidityMining.redepositShares(
            farm.globalFarm.id,
            farm.yieldFarm.id,
            record.id,
          )
        })
      })
      .flat(2)

    if (txs.length > 1) {
      return await createTransaction({ tx: api.tx.utility.batchAll(txs) })
    } else {
      return await createTransaction({ tx: txs[0] })
    }
  })
}
