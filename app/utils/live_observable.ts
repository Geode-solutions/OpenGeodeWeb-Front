// Third party imports
import type { Observable } from "rxjs";
import { liveQuery } from "dexie";

// Dexie's liveQuery() returns Dexie's own minimal Observable shape, not an
// Actual rxjs Observable instance (useObservable's declared parameter type);
// The two are structurally close enough at runtime (vueuse only calls
// `.subscribe`) but not identical, hence the cast.
function liveObservable<Value>(query: () => Promise<Value>): Observable<Value> {
  // oxlint-disable-next-line no-unsafe-type-assertion -- trusted vueuse/Dexie Observable boundary; see comment above.
  return liveQuery(query) as unknown as Observable<Value>;
}

export { liveObservable };
