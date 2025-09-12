/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from "react";
import { motion } from "framer-motion";
import { LogoIcon } from "./icons";

const ReportLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
      {/* Pulsing Logo */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="mb-6"
      >
        <LogoIcon className="w-16 h-16 text-blue-500" />
      </motion.div>

      {/* Animated text dots */}
      <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
        Generating Report
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, delay: 0.3, repeat: Infinity }}
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, delay: 0.6, repeat: Infinity }}
        >
          .
        </motion.span>
      </p>

      {/* Progress bar shimmer */}
      <div className="relative mt-6 w-64 h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
        <motion.div
          className="absolute top-0 left-0 h-full bg-blue-500"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
};

export default ReportLoader;
