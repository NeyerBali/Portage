import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MISSIONS_FEATURE_KEY, MissionsState, adapter } from './mission.reducer';

const selectState = createFeatureSelector<MissionsState>(MISSIONS_FEATURE_KEY);
const { selectAll } = adapter.getSelectors();

export const selectMissions = createSelector(selectState, selectAll);
export const selectMissionsLoading = createSelector(selectState, s => s.loading);
export const selectMissionsTotal = createSelector(selectState, s => s.total);
export const selectMissionsPage = createSelector(selectState, s => s.page);
export const selectMissionsPageSize = createSelector(selectState, s => s.pageSize);
export const selectMissionsParams = createSelector(selectState, s => s.params);
