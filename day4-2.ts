import axios from 'axios';
import 'dotenv/config';

const directions = [
    "upperLeft",
    "upperRight",
    "bottomLeft",
    "bottomRight",
] as const;

type Direction = typeof directions[number];

type Coordinates = [number, number];

type RelativeCoordinates = [number, number, Direction];

const noCoordinates: Coordinates = [-1, -1];

const getOppositeDirection = (direction: Direction): Direction => {
    switch (direction) {
        case "upperLeft":
            return "bottomRight";
        case "upperRight":
            return "bottomLeft";
        case "bottomLeft":
            return "upperRight";
        case "bottomRight":
            return "upperLeft";
    }
}

const parseWordSearch = (data: string): string[] => {
    const parsedData = data.split('\n');
    return parsedData.slice(0, -1);
}

const lookInAllDirections = (
    wordSearchSection: string[],
    charToLookFor: string,
    charCoordinates: Coordinates
): RelativeCoordinates[] => {
    const relativeCoordinates: RelativeCoordinates[] = []; 

    directions.forEach((direction) => {
        const coordinates = lookInASingleDirection(wordSearchSection, charToLookFor, charCoordinates, direction);
        if (coordinates !== noCoordinates) {
            relativeCoordinates.push([coordinates, direction].flat() as RelativeCoordinates);
        }
    })
    
    return relativeCoordinates;
}

const lookInASingleDirection = (
    wordSearchSection: string[],
    charToLookFor: string,
    charToLookAround: Coordinates,
    direction: Direction
): Coordinates => {
    const [x, y] = charToLookAround;

    switch (direction) {
        case "upperLeft":
            if (wordSearchSection[x - 1][y - 1] === charToLookFor) {
                return [x - 1, y - 1];
            }
            break;
        case "upperRight":
            if (wordSearchSection[x - 1][y + 1] === charToLookFor) {
                return [x - 1, y + 1];
            }
            break;
        case "bottomLeft":
            if (wordSearchSection[x + 1][y - 1] === charToLookFor) {
                return [x + 1, y - 1];
            }
            break;
        case "bottomRight":
            if (wordSearchSection[x + 1][y + 1] === charToLookFor) {
                return [x + 1, y + 1];
            }
            break;
    }

    return noCoordinates;
}

const searchXmas = (wordSearch: string[]): number=> {
    let xmasCount = 0;

    for (let i = 1; i < wordSearch.length - 1; i++) {
        for (let j = 1; j < wordSearch[i].length - 1; j++) {
            if (wordSearch[i][j] !== "A") continue;

            const coordinatesForM = lookInAllDirections(wordSearch, "M", [i, j]);

            if (coordinatesForM.length === 0) continue;

            let xmas = false;

            for (const coordinateForM of coordinatesForM) {
                const [xm, ym, direction] = coordinateForM;

                const coordinateForS = lookInASingleDirection(wordSearch, "S", [i, j], getOppositeDirection(direction));
                
                if (coordinateForS === noCoordinates) continue;

                if (!xmas) {
                    xmas = true;
                } else {
                    xmasCount++;
                }
            }
        }
    }

    return xmasCount;
}

axios({
    method: 'get',
    url: 'https://adventofcode.com/2024/day/4/input',
    responseType: 'text',
    headers:
        {
            'Cookie': `session=${process.env.SESSION};`
        },
    withCredentials: true,
  })
    .then((response) => {
        const parsedWordSearch = parseWordSearch(response.data);
        const xmasCount = searchXmas(parsedWordSearch);
        console.log(`The number of XMAS is: ${xmasCount}`);
    }); 