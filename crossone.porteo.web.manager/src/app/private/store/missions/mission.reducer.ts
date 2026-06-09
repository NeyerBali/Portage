import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Mission, MissionQueryParams } from 'src/app/shared/models';
import { MissionActions } from './mission.actions';

export const MISSIONS_FEATURE_KEY = 'missions';

export interface MissionsState extends EntityState<Mission> {
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  params: MissionQueryParams;
  error: string | null;
}

export const adapter = createEntityAdapter<Mission>();

export const initialState: MissionsState = adapter.getInitialState({
  total: 0,
  page: 1,
  pageSize: 8,
  loading: false,
  params: { page: 1, pageSize: 8, sortBy: 'debut', sortDir: 'desc' },
  error: null,
});

export const missionsReducer = createReducer(
  initialState,
  on(MissionActions.load, (state, { params }) => ({ ...state, loading: true, params })),
  on(MissionActions.loadSuccess, (state, { result }) =>
    adapter.setAll(result.items, {
      ...state,
      loading: false,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      error: null,
    })
  ),
  on(MissionActions.loadFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(MissionActions.operationFailure, (state, { error }) => ({ ...state, loading: false, error })),
);
