import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LoadingState {
    getAllItemsLoading: boolean;
    getItemsByQueryLoading: boolean;
    getSumLoading: boolean;
    addItemLoading: boolean;
    updateItemLoading: boolean;
    deleteItemLoading: boolean;
    getItemPaginationLoading: boolean;
}

const initialState: LoadingState = {
    getAllItemsLoading: false,
    getItemsByQueryLoading: false,
    getSumLoading: false,
    addItemLoading: false,
    updateItemLoading: false,
    deleteItemLoading: false,
    getItemPaginationLoading: false,
};

const loadingSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        setGetAllItemsLoading(state, action: PayloadAction<boolean>) {
            state.getAllItemsLoading = action.payload;
        },
        setGetItemsByQueryLoading(state, action: PayloadAction<boolean>) {
            state.getItemsByQueryLoading = action.payload;
        },
        setGetSumLoading(state, action: PayloadAction<boolean>) {
            state.getSumLoading = action.payload;
        },
        setAddItemLoading(state, action: PayloadAction<boolean>) {
            state.addItemLoading = action.payload;
        },
        setUpdateItemLoading(state, action: PayloadAction<boolean>) {
            state.updateItemLoading = action.payload;
        },
        setDeleteItemLoading(state, action: PayloadAction<boolean>) {
            state.deleteItemLoading = action.payload;
        },
        setGetItemPaginationLoading(state, action: PayloadAction<boolean>) {
            state.deleteItemLoading = action.payload;
        },
    },
});

export const {
    setGetAllItemsLoading,
    setGetItemsByQueryLoading,
    setGetSumLoading,
    setAddItemLoading,
    setUpdateItemLoading,
    setDeleteItemLoading,
    setGetItemPaginationLoading
} = loadingSlice.actions;

export default loadingSlice.reducer;
