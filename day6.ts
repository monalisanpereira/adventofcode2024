import axios from 'axios';
import 'dotenv/config';

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

const parseMap = (data: string): Map => {
    return data.split("\n").slice(0, -1);
}

const getGuardPosition = (map: Map): Position => {
    for (const stripe of map) {
        if (stripe.includes("^"))
            return [map.indexOf(stripe), stripe.indexOf("^")];
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
        if (position.length === referencePosition.length &&
            position.every((value, index) => value === referencePosition[index])
        ) return true;
    }

    return false;
}

const move = (map: Map, startingPosition: Position, direction: Direction, distinctPositions: Position[]): [Position, Direction] => {
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

        if (!isValidPosition(nextPosition, map)) return [nextPosition, nextDirection];

        // console.log(map[xn][yn]);

        if (map[xn][yn] === "#") return [currentPosition, nextDirection];

        if (!includesPosition(distinctPositions, nextPosition)) {
            distinctPositions.push(nextPosition);
        }

        currentPosition = nextPosition;
    }

}

const countDistinctPositions = (map: Map): number => {
    const distinctPositions: Position[] = [];
    const initialPosition = getGuardPosition(map);
    
    distinctPositions.push(initialPosition);
    // console.log(distinctPositions);

    let currentPosition = initialPosition;
    let currentDirection: Direction = "up";

    while (isValidPosition(currentPosition, map)) {
        [currentPosition, currentDirection] = move(map, currentPosition, currentDirection, distinctPositions);
        // console.log(distinctPositions);
        // console.log(distinctPositions.length);
    }

    return distinctPositions.length;
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
        const distinctPositions = countDistinctPositions(map);
        console.log(`The total number of distinct positions is: ${distinctPositions}`);
    }); 