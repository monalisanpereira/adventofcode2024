import axios from 'axios';
import 'dotenv/config';

// extract possible mul operations from data
const checkForDo = (rawMulString: string): string[] => {
    const doStrings = rawMulString.split('do()');
    return doStrings;
}

const checkForDont = (doString: string): string => {
    const mulStrings = doString.split("don't()");
    return mulStrings[0];
}

const parseMulString = (data: string): string[] => {
    const possibleMuls = data.split('mul');
    return possibleMuls.slice(1);
}

const parseMulStringWithDoOrDont = (data: string): string[] => {
    const doStrings = checkForDo(data);
    const mulStrings: string[] = [];
    const possibleMuls: string[][] = [];

    doStrings.forEach((doString) => {
        mulStrings.push(checkForDont(doString))
    })

    mulStrings.forEach((mulString) => {
        possibleMuls.push(parseMulString(mulString));
    })

    return possibleMuls.flat();
}

// apply mul operation
const getFirstNumber = (firstPart: string): number => {
    const possibleNumbers = firstPart.slice(1);

    if (
        firstPart[0] !== "(" || 
        isNaN(Number(possibleNumbers)) || 
        possibleNumbers.length > 3
    ) return 0;

    return +possibleNumbers;
}

const getSecondNumber = (secondPart: string): number => {
    const parsedSecondPart = secondPart.split(")");
    const possibleNumbers = parsedSecondPart[0];

    if (
        parsedSecondPart.length <= 1 || 
        possibleNumbers.length > 3
    ) return 0;

    return +possibleNumbers;
}

const calculateMul = (possibleMul: string): number => {
    const commaIndex = possibleMul.indexOf(",");

    if (commaIndex === -1) return 0;

    const firstNumberPart = possibleMul.slice(0, commaIndex)
    const secondNumberPart = possibleMul.slice(commaIndex + 1)

    const firstNumber = getFirstNumber(firstNumberPart);
    const secondNumber = getSecondNumber(secondNumberPart);

    return firstNumber * secondNumber;
}

const calculateMuls = (possibleMuls: string[]): number => {
    const mulResults = possibleMuls.map((possibleMul) => calculateMul(possibleMul));

    const totalSum = mulResults.reduce((a, b)  => a + b)

    return totalSum;
}

axios({
    method: 'get',
    url: 'https://adventofcode.com/2024/day/3/input',
    responseType: 'text',
    headers:
        {
            'Cookie': `session=${process.env.SESSION};`
        },
    withCredentials: true,
  })
    .then((response) => {
        // ignore do and don't
        const possibleMulsWithoutDosOrDonts = parseMulString(response.data);
        const totalWithoutDosOrDonts = calculateMuls(possibleMulsWithoutDosOrDonts);
        console.log(`Total without dos or don'ts: ${totalWithoutDosOrDonts}`);

        // do and don't
        const possibleMulsWithDosAndDonts = parseMulStringWithDoOrDont(response.data);
        const totalWithDosAndDonts = calculateMuls(possibleMulsWithDosAndDonts);
        console.log(`Total with dos and don'ts: ${totalWithDosAndDonts}`);
    }); 