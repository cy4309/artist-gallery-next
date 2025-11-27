import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/stores/store";

// 用在 dispatch
export const useAppDispatch: () => AppDispatch = useDispatch;

// 用在 selector
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
