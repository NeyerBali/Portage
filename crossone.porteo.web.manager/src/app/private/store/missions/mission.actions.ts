import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Mission, MissionQueryParams, MissionUpsert, PagedResult } from 'src/app/shared/models';

export const MissionActions = createActionGroup({
  source: 'Missions',
  events: {
    'Load': props<{ params: MissionQueryParams }>(),
    'Load Success': props<{ result: PagedResult<Mission> }>(),
    'Load Failure': props<{ error: string }>(),

    'Create': props<{ dto: MissionUpsert }>(),
    'Create Success': props<{ mission: Mission }>(),

    'Update': props<{ id: number; dto: MissionUpsert }>(),
    'Update Success': props<{ mission: Mission }>(),

    'Delete': props<{ id: number }>(),
    'Delete Success': props<{ id: number }>(),

    'Operation Failure': props<{ error: string }>(),
    'Reset': emptyProps(),
  },
});
