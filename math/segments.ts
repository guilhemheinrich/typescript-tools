export function mergeSegments(segments: ReadonlyArray<[number, number]>) {
    if (segments.length == 0) return segments
    // Trier les segments par leur point de départ
    const copySegment = [...segments]
    copySegment.sort((a, b) => a[0] - b[0]);

    const merged: [number, number][] = [];
    let currentSegment: [number, number] = [...copySegment[0]];

    for (let i = 1; i < copySegment.length; i++) {
        if (copySegment[i][0] <= currentSegment[1]) {
            // Si les segments se chevauchent, fusionnez-les
            currentSegment[1] = Math.max(currentSegment[1], copySegment[i][1]);
        } else {
            // Sinon, ajoutez le segment actuel à la liste et commencez un nouveau segment
            merged.push(currentSegment);
            currentSegment = copySegment[i];
        }
    }

    // Ajouter le dernier segment fusionné
    merged.push(currentSegment);

    return merged;
}

export function differenceSegments(segA: ReadonlyArray<[number, number]>, segB: ReadonlyArray<[number, number]>): Array<[number, number]> {
    // merge and order
    const mergedSegA = mergeSegments(segA);
    const mergedSegB = mergeSegments(segB);

    if (mergedSegB.length == 0) return [...mergedSegA]
    if (mergedSegA.length == 0) return []

    const result: Array<[number, number]> = [];
    let currentAIndex = 0;
    let currentBIndex = 0;

    let [startPos, endPos] = mergedSegA[0]
    let [startNeg, endNeg] = mergedSegB[0]
    while (true) {
        if (startPos < startNeg) {
            // [
            //      [
            if (endPos <= startNeg) {
                // [   ]     
                //          [
                //! avoid edge cases
                if (startPos < endPos) result.push([startPos, endPos])
                currentAIndex++
                if (currentAIndex > mergedSegA.length - 1) break
                [startPos, endPos] = mergedSegA[currentAIndex]
            } else {
                // [        ]     
                //      [
                //! avoid edge cases
                if (startPos < startNeg) result.push([startPos, startNeg])
                startPos = endNeg
                if (endPos < endNeg) {
                    // [        ]     
                    //      [       ]
                    currentAIndex++
                    if (currentAIndex > mergedSegA.length - 1) break
                    [startPos, endPos] = mergedSegA[currentAIndex]
                } else {
                    // [         ]     
                    //      [   ]
                    currentBIndex++
                    if (currentBIndex > mergedSegB.length - 1) break
                    [startNeg, endNeg] = mergedSegB[currentBIndex]
                }
            }
        } else {
            //  [
            // [
            if (endPos > endNeg) {
                if (startPos >= endNeg) {
                    //           [       ]
                    // [        ]
                    currentBIndex++
                    if (currentBIndex > mergedSegB.length - 1) break
                    [startNeg, endNeg] = mergedSegB[currentBIndex]
                } else {
                    //      [       ]
                    // [        ]
                    startPos = endNeg
                    currentBIndex++
                    if (currentBIndex > mergedSegB.length - 1) break
                    [startNeg, endNeg] = mergedSegB[currentBIndex]
                }
            } else {
                //      [      ]
                // [            ]
                currentAIndex++
                if (currentAIndex > mergedSegA.length - 1) break
                [startPos, endPos] = mergedSegA[currentAIndex]
            }
        }
    }
    if (currentBIndex > mergedSegB.length - 1) {
        //! avoid edge cases
        if (startPos < endPos) result.push([startPos, endPos]) // On finit de pousser le segmentA "en cours"
        result.push(...mergedSegA.slice(currentAIndex + 1)) // On pousse le restant du segment A

    }
    return result;
}

export function checkIncludeSegment(segments_array: Array<[number, number]>, segment_toCheck: [number, number]) {
    // Iterate through each segment in the segments array
    for (const segment of segments_array) {
        // Check if the segment_toCheck is within the current segment in the iteration
        if (segment_toCheck[0] >= segment[0] && segment_toCheck[1] <= segment[1]) {
            // If segment_toCheck is within a segment in segments_array, return true
            return true;
        }
    }
    // If no containing segment is found, return false
    return false;
}

export function checkCollisionSegmentArray(segments_array: Array<[number, number]>, segment_toCheck: [number, number]) {
    let collisionCheck = false
    for (const segment of segments_array) {
        collisionCheck = collisionSegment(segment, segment_toCheck)
    }
    // If no containing segment is found, return false
    return collisionCheck;

}

export function collisionSegment(segmentB: [number, number], segmentA: [number, number]): boolean {
    //  [        ]
    //      [
    if (segmentB[0] >= segmentA[0] && segmentB[0] <= segmentA[1]) {
        return true;
    }
    //  [        ]
    //      ]
    if (segmentB[1] >= segmentA[0] && segmentB[1] <= segmentA[1]) {
        return true;
    }
    //      [   ]
    //   [          ]
    if (segmentB[0] <= segmentA[0] && segmentB[1] >= segmentA[1]) {
        return true;
    }
    return false
}


//    ______                           _
//   |  ____|                         | |
//   | |__  __  ____ _ _ __ ___  _ __ | | ___
//   |  __| \ \/ / _` | '_ ` _ \| '_ \| |/ _ \
//   | |____ >  < (_| | | | | | | |_) | |  __/
//   |______/_/\_\__,_|_| |_| |_| .__/|_|\___|
//                              | |
//                              |_|
// const segPos: [number, number][] = [
//     [9, 16],
//     [17, 19.5],
//     [24 + 9, 24 + 12],
// ]

// const segNeg: [number, number][] = [
//     [17 - 24, 18 - 24]
// ]
// console.log(differenceSegments(segPos, segNeg))

// const segA: [number, number][] = [[0, 10],              [11, 13], [14, 18]]
// const segB: [number, number][] = [[1, 2], [3, 4], [6, 7],   [12, 15]]
// const segA: [number, number][] = [[11, 13], [14, 18]]
// const segB: [number, number][] = [      [12, 15]    ]


// Edge cases
// const segA: [number, number][] = [[11, 13], [14, 18]]
// const segB: [number, number][] = [[12, 13], [14, 15]]
// console.log(differenceSegments(segA, segB))

// console.log(differenceSegments(segA, segC))

const hourToMlls = 1000 * 60 * 60
const affineStart = 1709209800000
// const segPos: [number, number][] = [
//     [1709209800000, 1709226000000],
//     [1709280000000, 1709305200000],
//     [1709308800000, 1709317800000],
//     [1709366400000, 1709377200000],
//     [1709539200000, 1709562600000],
//     [1709566200000, 1709577000000],
//     [1709622000000, 1709663400000],
//     [1709712000000, 1709739000000],
//     [1709742600000, 1709749800000]
// ].map((item) => [(item[0] - affineStart) / hourToMlls, (item[1] - affineStart) / hourToMlls])

// const segNeg: [number, number][] = [[1709211600000, 1709215200000], [1709218800000, 1709222400000]].map((item)=> [(item[0] - affineStart) / hourToMlls, (item[1] - affineStart) / hourToMlls])

// console.log(segPos)
// console.log(segNeg)
// console.log(differenceSegments(segPos, segNeg))
// console.log(differenceSegments(segPos, segNeg).map((item) => `${new Date(item[0] * hourToMlls + affineStart)} - ${new Date(item[1] * hourToMlls + affineStart)}`))

