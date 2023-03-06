import { useOmnipoolAssets } from "../../../api/omnipool"
import { usePoolsDetailsTradeVolumes } from "../pool/details/PoolDetails.utils"
import { useOmnipoolPools } from "../PoolsPage.utils"

export function useTotalVolumesInPools() {
  const assets = useOmnipoolAssets()
  const totalVolume = usePoolsDetailsTradeVolumes(
    assets.data?.map((asset) => asset.id) ?? [],
  )

  const queries = [assets, totalVolume]
  const isLoading = queries.some((query) => query.isLoading)

  return {
    isLoading,
    value: totalVolume.data,
  }
}

export function useTotalVolumesInPoolsUser() {
  const pools = useOmnipoolPools(true)
  const assetIds = pools.data?.map((pool) => pool.id) ?? []

  const totalVolume = usePoolsDetailsTradeVolumes(assetIds)

  const queries = [pools, totalVolume]
  const isLoading = queries.some((query) => query.isLoading)

  return {
    isLoading,
    value: totalVolume.data,
  }
}
