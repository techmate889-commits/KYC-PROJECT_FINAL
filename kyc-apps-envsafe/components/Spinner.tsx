/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react'
export default function Spinner(){
  return (
    <div className="w-full flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-400 border-t-transparent"></div>
    </div>
  )
}
