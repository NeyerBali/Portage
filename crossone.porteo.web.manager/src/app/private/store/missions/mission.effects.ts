import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { catchError, map, mergeMap, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { ApiService } from '../../http/api.service';
import { MissionActions } from './mission.actions';
import { selectMissionsParams } from './mission.selectors';

@Injectable()
export class MissionEffects {
  constructor(
    private actions$: Actions,
    private api: ApiService,
    private store: Store,
    private toastr: ToastrService,
  ) {}

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MissionActions.load),
      switchMap(({ params }) =>
        this.api.missions.list(params).pipe(
          map(result => MissionActions.loadSuccess({ result })),
          catchError(err => of(MissionActions.loadFailure({ error: err?.message ?? 'Erreur' })))
        )
      )
    )
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MissionActions.create),
      mergeMap(({ dto }) =>
        this.api.missions.create(dto).pipe(
          map(mission => MissionActions.createSuccess({ mission })),
          catchError(err => of(MissionActions.operationFailure({ error: err?.error?.message ?? 'Erreur' })))
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MissionActions.update),
      mergeMap(({ id, dto }) =>
        this.api.missions.update(id, dto).pipe(
          map(mission => MissionActions.updateSuccess({ mission })),
          catchError(err => of(MissionActions.operationFailure({ error: err?.error?.message ?? 'Erreur' })))
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MissionActions.delete),
      mergeMap(({ id }) =>
        this.api.missions.delete(id).pipe(
          map(() => MissionActions.deleteSuccess({ id })),
          catchError(err => of(MissionActions.operationFailure({ error: err?.error?.message ?? 'Erreur' })))
        )
      )
    )
  );

  // Après une mutation réussie : toast + rechargement de la liste courante.
  reloadAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MissionActions.createSuccess, MissionActions.updateSuccess, MissionActions.deleteSuccess),
      tap(action => {
        const labels: Record<string, string> = {
          '[Missions] Create Success': 'Mission créée avec succès.',
          '[Missions] Update Success': 'Mission mise à jour.',
          '[Missions] Delete Success': 'Mission supprimée.',
        };
        this.toastr.success(labels[action.type] ?? 'Opération réussie.');
      }),
      withLatestFrom(this.store.select(selectMissionsParams)),
      map(([, params]) => MissionActions.load({ params }))
    )
  );
}
