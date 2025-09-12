/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { LogoIcon } from './icons';

export const WelcomeScreen: React.FC = () => {
  return (
      <div className="flex flex-col items-center justify-center text-center p-8 animate-fade-in flex-grow">
          <div className="max-w-2xl w-full">
              <LogoIcon className="w-24 h-24 text-blue-500 mb-8 mx-auto" />
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl lg:text-6xl tracking-tight">
                  Client Intelligence, Instantly.
              </h2>
              <p className="mt-8 text-lg max-w-xl mx-auto text-slate-600 dark:text-slate-400 leading-relaxed">
                  Enter an Instagram handle in the search bar above to generate a comprehensive KYC report and unlock deep insights into a client's digital footprint.
              </p>
          </div>
      </div>
  );
};