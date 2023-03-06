import { WalletVestingHeader } from "./WalletVestingHeader"
import { WalletVestingBox } from "./WalletVestingBox"

export const WalletVesting = () => (
  <div
    sx={{
      mt: 45,
      flex: "column",
      flexGrow: 1,
    }}
  >
    <WalletVestingHeader />
    <WalletVestingBox />
  </div>
)
