import axios from 'axios';
import 'dotenv/config';
import { isEqual } from 'lodash';

const testInput = `....#.....
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

// help functions

const parseMap = (data: string): Map => {
    return data.split("\n").slice(0, -1);
}

const getGuardPosition = (map: Map): Position => {
    for (const stripe of map) {
        if (stripe.includes(guard))
            return [map.indexOf(stripe), stripe.indexOf(guard)];
    }
}

const isValidPosition = (position: Position, map: Map): boolean => {
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

const move = (
    map: Map, 
    startingPosition: Position,
    direction: Direction,
    distinctPositions: Position[]
): PositionWithDirection => {
    let currentPosition = startingPosition;
    const nextDirection = nextDirectionMap[direction];

    while (true) {
        let nextPosition: Position;
        const [xc, yc] = currentPosition;

        switch (direction) {
            case "up":
                nextPosition = [xc - 1, yc];
                break;
            case "right":
                nextPosition = [xc, yc + 1];
                break;
            case "down":
                nextPosition = [xc + 1, yc];
                break;
            case "left":
                nextPosition = [xc, yc - 1];
                break;
        }

        const [xn, yn] = nextPosition;

        if (!isValidPosition(nextPosition, map)) return { position: nextPosition, direction: nextDirection};

        if (map[xn][yn] === obstruction) return { position: currentPosition, direction: nextDirection};

        if (!includesPosition(distinctPositions, nextPosition)) {
            distinctPositions.push(nextPosition);
        }

        currentPosition = nextPosition;
    }

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

const checkIfMapLeadsToLoop = (map: Map): boolean => {
    const guardsPositions: Position[] = [];
    const cornerPositions: PositionWithDirection[] = [];
    const initialPosition = getGuardPosition(map);
    
    guardsPositions.push(initialPosition);

    let currentPositionWithDirection: PositionWithDirection = { position: initialPosition, direction: "up" };

    while (isValidPosition(currentPositionWithDirection.position, map)) {
        currentPositionWithDirection = move(map, currentPositionWithDirection.position, currentPositionWithDirection.direction, guardsPositions);
        if (includesPositionWithDirection(cornerPositions, currentPositionWithDirection)) return true;
        cornerPositions.push(currentPositionWithDirection);
    }
    
    return false;
}

// main functions

const getAllDistinctGuardsPositions = (map: Map): Position[] => {
    const distinctGuardsPositions: Position[] = [];
    const initialPosition = getGuardPosition(map);
    
    distinctGuardsPositions.push(initialPosition);

    let currentPositionWithDirection: PositionWithDirection = { position: initialPosition, direction: "up" };

    while (isValidPosition(currentPositionWithDirection.position, map)) {
        currentPositionWithDirection = move(map, currentPositionWithDirection.position, currentPositionWithDirection.direction, distinctGuardsPositions);
    }

    return distinctGuardsPositions;
}

const getAllObstructionPositionsLeadingToLoop = (map: Map, possibleObstructions: Position[]): Position[] => {
    const obstructionPositionsLeadingToLoop: Position[] = [];
    
    for (const position of possibleObstructions) {
        console.log(`Not in a loop, now checking ${position}...`);
        const mapWithObstruction = placeObstruction(map, position);
        if (checkIfMapLeadsToLoop(mapWithObstruction))
            obstructionPositionsLeadingToLoop.push(position);
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

        const distinctGuardsPositions = getAllDistinctGuardsPositions(map);
        const obstructionPositionsLeadingToLoop = getAllObstructionPositionsLeadingToLoop(map, distinctGuardsPositions.slice(1));

        console.log(`The total number of the guard's distinct positions is: ${distinctGuardsPositions.length}`);
        console.log(`The total number of obstruction positions leading to a loop is: ${obstructionPositionsLeadingToLoop.length}`);
    }); 