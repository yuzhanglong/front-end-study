/*
 * File: LocalProvider.tsx
 * Description: provider
 * Created: 2021-3-6 00:47:51
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import React from 'react';
import LocalContext from './LocalContext';
import { Local } from '../types';

interface LocalProviderProps {
  local: Local;
}

const LocalProvider: React.FunctionComponent<LocalProviderProps> = (props) => {
  return (
    <LocalContext.Provider value={props.local}>
      {props.children}
    </LocalContext.Provider>
  );
};

export default LocalProvider;
