import axios from 'axios';
import 'dotenv/config';

const processData = (data: string) => {
    const list1: number[] = [];
    const list2: number[] = [];
    const pairs = data.split('\n');
    for (let i = 0; i < pairs.length - 1; i++) {
        const pair = pairs[i].split('   ');
        list1.push(+pair[0]);
        list2.push(+pair[1]);
    }
    list1.sort();
    list2.sort();
    return { list1, list2 };
}

const getDistanceBetweenLists = (list1: number[], list2: number[]) => {
    let totalDistance = 0;
    for (let i = 0; i < list1.length; i++) {
        const pairDistance = Math.abs(list2[i] - list1[i]);
        totalDistance += pairDistance;
    }
    return totalDistance;
}

const countAllOccurrences = (list: number[], item: number) => {
    let count = 0;
    let i = -1;
    while ((i = list.indexOf(item, i + 1)) != -1){
        count++;
    }
    return count;
}

const calculateSimilarityScore = (list1: number[], list2: number[]) => {
    let similarityScore = 0;
    for (let i = 0; i < list1.length; i++) {
        similarityScore += countAllOccurrences(list2, list1[i]) * list1[i];
    }
    return similarityScore;
}

axios({
    method: 'get',
    url: 'https://adventofcode.com/2024/day/1/input',
    responseType: 'text',
    headers:
        {
            'Cookie': `session=${process.env.SESSION};`
        },
    withCredentials: true,
  })
    .then(async (response) => {
      const { list1, list2 } = processData(response.data);
      const totalDistance = getDistanceBetweenLists(list1, list2);
      const similarityScore = calculateSimilarityScore(list1, list2);
      console.log(`Total distance is: ${totalDistance}`);
      console.log(`Similarity score is: ${similarityScore}`);
    });

console.log("gay");

