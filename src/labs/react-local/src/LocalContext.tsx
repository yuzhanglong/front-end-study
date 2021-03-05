/*
 * File: LocalContext.tsx
 * Description: react context
 * Created: 2021-3-6 00:11:04
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */


import {createContext} from "react"
import {Local} from "./types"

const LocalContext = createContext<Local | undefined>(undefined)

export default LocalContext
