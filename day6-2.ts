import axios from 'axios';
import 'dotenv/config';
import { isEqual } from 'lodash';

const testInput =
`....#.....
.........#
..........
..#.......
.......#..
..........
.#..^.....
........#.
#.........
......#...
`

// variables

const guard = "^";
const obstruction = "#";
const emptySpace = ".";
const directions = [
    "up",
    "right",
    "down",
    "left",
] as const;

const nextDirectionMap = {
    up: "right" as Direction,
    right: "down" as Direction,
    down: "left" as Direction,
    left: "up" as Direction,
};

// types

type Direction = typeof directions[number];
type Map = string[];
type Position = [number, number];
type PositionWithDirection = {
    position: Position;
    direction: Direction;
};

// util functions

const parseMap = (data: string): Map => {
    return data.split("\n").slice(0, -1);
}

const getGuardPosition = (map: Map): PositionWithDirection => {
    for (const stripe of map) {
        if (stripe.includes(guard))
            return { position: [map.indexOf(stripe), stripe.indexOf(guard)], direction: "up" };
    }
}

const isValidPosition = (map: Map, position: Position): boolean => {
    if (
        position.some(v => v < 0) ||
        position.some(v => v >= map[0].length)
    ) return false;

    return true;
}

const includesPosition = (positions: Position[], position: Position): boolean => {
    for (const referencePosition of positions) {
        if (isEqual(position, referencePosition)) return true;
    }

    return false;
}

const includesPositionWithDirection = (
    positionsWithDirections: PositionWithDirection[],
    positionWithDirection: PositionWithDirection
): boolean => {
    for (const referencePositionWithDirection of positionsWithDirections) {
        if (isEqual(positionWithDirection, referencePositionWithDirection)) return true;
    }

    return false;
}

// helper functions 

const getNextPossiblePositionWithDirection = (
    positionWithDirection: PositionWithDirection,
): PositionWithDirection => {
    const { position, direction } = positionWithDirection;

    const [x, y] = position;
    let nextPossiblePosition: Position;

    switch (direction) {
        case "up":
            nextPossiblePosition = [x - 1, y];
            break;
        case "right":
            nextPossiblePosition = [x, y + 1];
            break;
        case "down":
            nextPossiblePosition = [x + 1, y];
            break;
        case "left":
            nextPossiblePosition = [x, y - 1];
            break;
    }

    return { position: nextPossiblePosition, direction };
};

const getNextPositionWithDirection = (
    map: Map, 
    positionWithDirection: PositionWithDirection,
): PositionWithDirection => {
    let nextPossiblePositionWithDirection = getNextPossiblePositionWithDirection(positionWithDirection);
    let [x, y] = nextPossiblePositionWithDirection.position;

    if (!isValidPosition(map, nextPossiblePositionWithDirection.position)) return nextPossiblePositionWithDirection;

    let nextDirection = nextDirectionMap[positionWithDirection.direction];

    while (isValidPosition(map, nextPossiblePositionWithDirection.position) && map[x][y] === obstruction) {
        nextPossiblePositionWithDirection = getNextPossiblePositionWithDirection({ position: positionWithDirection.position, direction: nextDirection });
        [x, y] = nextPossiblePositionWithDirection.position;
        nextDirection = nextDirectionMap[nextDirection];
    }

    return nextPossiblePositionWithDirection;
}

const placeObstruction = (map: Map, position: Position): Map => {
    const [x, y] = position;

    if (map[x][y] === guard) {
        throw Error("Impossible to place obstruction where the guard is!");
    }

    const sliceOfMap = map[x];
    const sliceOfMapWithObstruction = sliceOfMap.substring(0, y) + obstruction + sliceOfMap.substring(y + 1);
    const mapWithObstruction = map.slice(0, x).concat(sliceOfMapWithObstruction, map.slice(x + 1));

    return mapWithObstruction;
}

const checkIfMapLeadsToLoop = (map: Map, initialPositionWithDirection: PositionWithDirection): boolean => {
    const passedPositions: PositionWithDirection[] = [];

    let currentPositionWithDirection: PositionWithDirection = initialPositionWithDirection;

    while (isValidPosition(map, currentPositionWithDirection.position)) {
        currentPositionWithDirection = getNextPositionWithDirection(map, currentPositionWithDirection);
        if (includesPositionWithDirection(passedPositions, currentPositionWithDirection)) return true;
        passedPositions.push(currentPositionWithDirection);
    }
    
    return false;
}

// main function

const getAllObstructionPositionsLeadingToLoop = (map: Map): Position[] => {
    const obstructionPositionsLeadingToLoop: Position[] = [];
    const checkedPositions: Position[] = [];
    let currentPositionWithDirection = getGuardPosition(map);
    let nextPositionWithDirection = getNextPositionWithDirection(map, currentPositionWithDirection);
    let checkedPositionCount = 1;

    while (isValidPosition(map, nextPositionWithDirection.position)) {
        console.log(`Now checking position number ${checkedPositionCount}...`);
        console.time(`Total time (${checkedPositionCount})`);

        const { position } = nextPositionWithDirection;

        if (map[position[0]][position[1]] !== guard && !includesPosition(checkedPositions, position)) {
            const mapWithObstruction = placeObstruction(map, nextPositionWithDirection.position);

            if (
                checkIfMapLeadsToLoop(mapWithObstruction, currentPositionWithDirection) &&
                !includesPosition(obstructionPositionsLeadingToLoop, nextPositionWithDirection.position)
            ) {
                obstructionPositionsLeadingToLoop.push(nextPositionWithDirection.position);
                console.log("Loop found!");
            }

            checkedPositions.push(nextPositionWithDirection.position);
        }
        
        currentPositionWithDirection = nextPositionWithDirection;
        nextPositionWithDirection = getNextPositionWithDirection(map, currentPositionWithDirection);

        console.timeEnd(`Total time (${checkedPositionCount})`);
        checkedPositionCount++;
    }

    return obstructionPositionsLeadingToLoop;
}

axios({
    method: 'get',
    url: 'https://adventofcode.com/2024/day/6/input',
    responseType: 'text',
    headers:
        {
            'Cookie': `session=${process.env.SESSION};`
        },
    withCredentials: true,
  })
    .then((response) => {
        // const map = parseMap(testInput);
        const map = parseMap(response.data);
        console.time("Total time");
        const obstructionPositionsLeadingToLoop = getAllObstructionPositionsLeadingToLoop(map);
        console.log(`The total number of obstruction positions leading to a loop is: ${obstructionPositionsLeadingToLoop.length}`);
        console.timeEnd("Total time");
    }); 