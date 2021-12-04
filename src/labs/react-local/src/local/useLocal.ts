/*
 * File: useLocal.ts
 * Description: local context 消费者 hooks
 * Created: 2021-3-6 01:00:26
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import { useContext } from 'react';
import LocalContext from './LocalContext';
import Chinese from '../languages/chinese';

export const useLocal = () => {
  const local = useContext(LocalContext) || Chinese;
  return [local];
};
