import { motion } from "framer-motion";
import { PeddingSvg } from "../svg/Pedding";
import { RocketSvg } from "../svg/Rocket";
import { WarningSvg } from "../svg/Warning";

export const ToastifyIconTemplates = {
  pendingRocket: (
    <div className="relative max-w-full max-h-full">
      <PeddingSvg className="relative max-w-full max-h-full" />
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 max-w-full max-h-full">
        <RocketSvg className="relative max-w-full max-h-full" />
      </div>
    </div>
  ),
  successRocket: (
    <motion.div
      animate={{
        scale: [0.9, 1.2, 0.9],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        repeatType: "loop",
      }}
      className="relative max-w-full max-h-full"
    >
      <RocketSvg className="relative max-w-full max-h-full" />
    </motion.div>
  ),
  warning: (
    <div className="relative max-w-full max-h-full">
      <WarningSvg className="relative max-w-full max-h-full" />
    </div>
  ),
};
