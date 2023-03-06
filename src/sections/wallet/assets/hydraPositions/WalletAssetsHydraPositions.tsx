import { useTranslation } from "react-i18next"
import { Fragment, useState } from "react"
import {
  Table,
  TableBodyContent,
  TableContainer,
  TableData,
  TableHeaderContent,
  TableRow,
  TableTitle,
} from "components/Table/Table.styled"
import { assetsTableStyles } from "sections/wallet/assets/table/WalletAssetsTable.styled"
import { Text } from "components/Typography/Text/Text"
import { TableSortHeader } from "components/Table/Table"
import { flexRender } from "@tanstack/react-table"
import { WalletTransferModal } from "sections/wallet/transfer/WalletTransferModal"
import {
  HydraPositionsTableData,
  useHydraPositionsTable,
} from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { WalletAssetsHydraPositionsDetails } from "sections/wallet/assets/hydraPositions/details/WalletAssetsHydraPositionsDetails"
import { EmptyState } from "./EmptyState"

type Props = { data: HydraPositionsTableData[] }

export const WalletAssetsHydraPositions = ({ data }: Props) => {
  const { t } = useTranslation()
  const [transferAsset, setTransferAsset] = useState<string | null>(null)

  const table = useHydraPositionsTable(data, { onTransfer: setTransferAsset })

  return (
    <TableContainer css={assetsTableStyles}>
      <TableTitle>
        <Text
          fs={[16, 20]}
          lh={[20, 26]}
          css={{ fontFamily: "FontOver" }}
          fw={500}
          color="white"
        >
          {t("wallet.assets.hydraPositions.title")}
        </Text>
      </TableTitle>
      <Table>
        <TableHeaderContent>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableSortHeader
                  key={header.id}
                  canSort={header.column.getCanSort()}
                  sortDirection={header.column.getIsSorted()}
                  onSort={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableSortHeader>
              ))}
            </TableRow>
          ))}
        </TableHeaderContent>
        <TableBodyContent>
          {table.options.data.length ? (
            table.getRowModel().rows.map((row, i) => (
              <Fragment key={row.id}>
                <TableRow isOdd={!(i % 2)} onClick={() => row.toggleSelected()}>
                  {row.getVisibleCells().map((cell) => (
                    <TableData key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableData>
                  ))}
                </TableRow>
                {row.getIsSelected() && (
                  <TableRow isSub>
                    <TableData colSpan={table.getAllColumns().length}>
                      <WalletAssetsHydraPositionsDetails
                        assetId={row.original.assetId}
                        symbol={row.original.symbol}
                        amount={row.original.providedAmount}
                        amountUSD={row.original.providedAmountUSD}
                        shares={row.original.shares}
                      />
                    </TableData>
                  </TableRow>
                )}
              </Fragment>
            ))
          ) : (
            <EmptyState />
          )}
        </TableBodyContent>
      </Table>
      {transferAsset && (
        <WalletTransferModal
          open
          initialAsset={transferAsset}
          onClose={() => setTransferAsset(null)}
        />
      )}
    </TableContainer>
  )
}
