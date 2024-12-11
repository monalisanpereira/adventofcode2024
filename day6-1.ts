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

type Direction = typeof directions[number];
type Map = string[];
type Position = [number, number];
type PositionWithDirection = {
    position: Position;
    direction: Direction;
};

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
        const map = parseMap(response.data);
        console.time("Total time");
        const distinctGuardsPositions = getAllDistinctGuardsPositions(map);
        console.log(`The total number of the guard's distinct positions is: ${distinctGuardsPositions.length}`);
        console.timeEnd("Total time");
    }); 