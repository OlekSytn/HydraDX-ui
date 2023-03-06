import { Page } from "components/Layout/Page/Page"
import { PoolsHeader } from "sections/pools/header/PoolsHeader"
import { useState } from "react"
import { Pool } from "sections/pools/pool/Pool"
import { useOmnipoolPools } from "sections/pools/PoolsPage.utils"
import { PoolSkeleton } from "./skeleton/PoolSkeleton"

export const PoolsPage = () => {
  const [filter, setFilter] = useState({ showMyPositions: false })

  const { data, isLoading } = useOmnipoolPools(filter.showMyPositions)

  return (
    <Page>
      <PoolsHeader
        showMyPositions={filter.showMyPositions}
        onShowMyPositionsChange={(value) =>
          setFilter((prev) => ({
            ...prev,
            showMyPositions: value,
          }))
        }
      />
      <div sx={{ flex: "column", gap: 20 }}>
        {!isLoading && data
          ? data.map((pool) => <Pool key={pool.id.toString()} pool={pool} />)
          : [...Array(3)].map((_, index) => (
              <PoolSkeleton key={index} length={3} index={index} />
            ))}
      </div>
    </Page>
  )
}
