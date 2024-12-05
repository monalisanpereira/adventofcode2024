import axios from 'axios';
import 'dotenv/config';

const directions = [
    "upperLeft",
    "up",
    "upperRight",
    "centerLeft",
    "centerRight",
    "bottomLeft",
    "bottom",
    "bottomRight"
] as const;

type Direction = typeof directions[number];

type Coordinates = [number, number];

type RelativeCoordinates = [number, number, Direction];

const noCoordinates: Coordinates = [-1, -1];

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
    currentCharCoordinates: Coordinates,
    direction: Direction
): Coordinates => {
    const [x, y] = currentCharCoordinates;

    switch (direction) {
        case "upperLeft":
            if (
                x - 1 >= 0 && 
                y - 1 >= 0 && 
                wordSearchSection[x - 1][y - 1] === charToLookFor
            ) {
                return [x - 1, y - 1];
            }
            break;
        case "up":
            if (
                x - 1 >= 0 && 
                wordSearchSection[x - 1][y] === charToLookFor
            ) {
                return [x - 1, y];
            }
            break;
        case "upperRight":
            if (
                x - 1 >= 0 && 
                y + 1 < wordSearchSection[x - 1].length && 
                wordSearchSection[x - 1][y + 1] === charToLookFor
            ) {
                return [x - 1, y + 1];
            }
            break;
        case "centerLeft":
            if (
                y - 1 >= 0 && 
                wordSearchSection[x][y - 1] === charToLookFor
            ) {
                return [x, y - 1];
            }
            break;
        case "centerRight":
            if (
                y + 1 < wordSearchSection[x].length && 
                wordSearchSection[x][y + 1] === charToLookFor
            ) {
                return [x, y + 1];
            }
            break;
        case "bottomLeft":
            if (
                x + 1 < wordSearchSection.length && 
                y - 1 >= 0 && 
                wordSearchSection[x + 1][y - 1] === charToLookFor
            ) {
                return [x + 1, y - 1];
            }
            break;
        case "bottom":
            if (
                x + 1 < wordSearchSection.length && 
                wordSearchSection[x + 1][y] === charToLookFor
            ) {
                return [x + 1, y];
            }
            break;
        case "bottomRight":
            if (
                x + 1 < wordSearchSection.length && 
                y + 1 < wordSearchSection[x + 1].length && 
                wordSearchSection[x + 1][y + 1] === charToLookFor
            ) {
                return [x + 1, y + 1];
            }
            break;
    }

    return noCoordinates;
}

const searchXmas = (wordSearch: string[]): number => {
    let xmasCount = 0;

    for (let i = 0; i < wordSearch.length; i++) {
        for (let j = 0; j < wordSearch[i].length; j++) {
            if (wordSearch[i][j] !== "X") continue;

            const coordinatesForM = lookInAllDirections(wordSearch, "M", [i, j]);

            if (coordinatesForM.length === 0) continue;

            for (const coordinateForM of coordinatesForM) {
                const [xm, ym, direction] = coordinateForM;

                const coordinateForA = lookInASingleDirection(wordSearch, "A", [xm, ym], direction);
                
                if (coordinateForA === noCoordinates) continue;

                const [xa, ya] = coordinateForA;

                const coordinateForS = lookInASingleDirection(wordSearch, "S", [xa, ya], direction);

                if (coordinateForS === noCoordinates) continue;

                xmasCount++;
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