import {Observable, OperatorFunction, Subject} from 'rxjs';

interface PartitionMapConfig<V> {
  /** Callback that returns id string of partition to push to. */
  getPartitionId: (value: V) => string;
  /** Callback that determines if as of that value the partition is complete. */
  isPartitionComplete: (value: V) => boolean;
}

/**
 * Split input observable's values into an observable of observables of those values.
 *
 * @param config when to create partition observables and complete them
 * @returns an observable that pushs an observable for each created partition
 */
export function partitionMap<V>({
  getPartitionId,
  isPartitionComplete,
}: PartitionMapConfig<V>): OperatorFunction<V, Observable<V>> {
  return (source: Observable<V>) => {
    const partitions = {} as {[key: string]: Subject<V>};
    return new Observable<Observable<V>>((subscriber) => {
      return source.subscribe({
        next(graphChange) {
          const key = getPartitionId(graphChange);
          const isComplete = isPartitionComplete(graphChange);

          // If the key is not in the partition cache, add a new one for that
          // key and push it.
          if (!(key in partitions)) {
            partitions[key] = new Subject<V>();
            subscriber.next(partitions[key]);
          }

          // Push the value through the selected partition.
          partitions[key].next(graphChange);

          // When completeSelector returns true, complete the partition and
          // delete it from the cache.
          if (isComplete) {
            partitions[key].complete();
            delete partitions[key];
          }
        },

        // When source completes, all partitions complete.
        complete: () => subscriber.complete(),

        // When source errors, all partitions error.
        error: (reason) => subscriber.error(reason),
      });
    });
  };
}
