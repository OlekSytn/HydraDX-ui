import { useTranslation } from "react-i18next"
//import { AprFarm } from "utils/farms/apr"
import { Graph } from "components/Graph/Graph"
import { Spinner } from "components/Spinner/Spinner.styled"
import { useLoyaltyRates } from "./LoyaltyGraph.utils"
import { PalletLiquidityMiningLoyaltyCurve } from "@polkadot/types/lookup"
import BigNumber from "bignumber.js"
import { Farm, useFarmApr } from "api/farms"

type LoyaltyGraphProps = {
  farm: Farm
  loyaltyCurve: PalletLiquidityMiningLoyaltyCurve
  enteredAt?: BigNumber
}

export function LoyaltyGraph({
  farm,
  loyaltyCurve,
  enteredAt,
}: LoyaltyGraphProps) {
  const { t } = useTranslation()
  const apr = useFarmApr(farm)

  const rates = useLoyaltyRates(
    farm,
    loyaltyCurve,
    enteredAt && apr.data != null
      ? apr.data.currentPeriod.minus(enteredAt)
      : undefined,
  )

  return (
    <div sx={{ flex: "column", gap: 32 }}>
      <div
        sx={{ height: 300, flex: "row", align: "center", justify: "center" }}
      >
        {rates.data ? (
          <Graph
            labelX={t("farms.modal.details.loyalty.x")}
            labelY={t("farms.modal.details.loyalty.y")}
            data={rates.data}
          />
        ) : (
          <Spinner width={64} height={64} />
        )}
      </div>
    </div>
  )
}
