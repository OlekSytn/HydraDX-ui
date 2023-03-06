import { useTranslation } from "react-i18next"
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { WalletAssetsTableName } from "sections/wallet/assets/table/data/WalletAssetsTableData"
import { WalletAssetsHydraPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData"
import { Text } from "components/Typography/Text/Text"
import { WalletAssetsHydraPositionsActions } from "sections/wallet/assets/hydraPositions/actions/WalletAssetsHydraPositionsActions"
import { useState } from "react"
import { useMedia } from "react-use"
import { theme } from "theme"
import BN from "bignumber.js"

export const useHydraPositionsTable = (
  data: HydraPositionsTableData[],
  actions: { onTransfer: (assetId: string) => void },
) => {
  const { t } = useTranslation()
  const { accessor, display } = createColumnHelper<HydraPositionsTableData>()
  const [sorting, setSorting] = useState<SortingState>([])

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    name: true,
    value: true,
    valueUSD: isDesktop,
    actions: true,
  }

  const columns = [
    accessor("symbol", {
      id: "name",
      header: t("wallet.assets.hydraPositions.header.name"),
      cell: ({ row }) => <WalletAssetsTableName {...row.original} />,
    }),
    accessor("value", {
      id: "value",
      header: t("wallet.assets.hydraPositions.header.position"),
      sortingFn: (a, b) => (a.original.value.gt(b.original.value) ? 1 : -1),
      cell: ({ row }) => (
        <WalletAssetsHydraPositionsData
          symbol={row.original.symbol}
          lrna={row.original.lrna}
          value={row.original.value}
        />
      ),
    }),
    accessor("valueUSD", {
      id: "valueUSD",
      header: t("wallet.assets.hydraPositions.header.valueUSD"),
      sortingFn: (a, b) =>
        b.original.valueUSD.isNaN()
          ? 1
          : a.original.valueUSD.gt(b.original.valueUSD)
          ? 1
          : -1,
      cell: ({ row }) => (
        <Text fw={500} fs={16} lh={16} color="green600" tAlign="left">
          {t("value.usd", { amount: row.original.valueUSD })}
        </Text>
      ),
    }),
    display({
      id: "actions",
      cell: ({ row }) => (
        <WalletAssetsHydraPositionsActions
          toggleExpanded={row.toggleSelected}
          onTransferClick={() => actions.onTransfer(row.original.assetId)}
          isExpanded={row.getIsSelected()}
        />
      ),
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return table
}

export type HydraPositionsTableData = {
  id: string
  assetId: string
  symbol: string
  name: string
  lrna: BN
  value: BN
  valueUSD: BN
  price: BN
  providedAmount: BN
  providedAmountUSD: BN
  shares: BN
}
