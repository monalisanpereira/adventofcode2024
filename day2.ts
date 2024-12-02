import axios from 'axios';
import 'dotenv/config';

const parseData = (data: string) => {
    const reports = data.split('\n');

    const parsedReports = reports.map(
        (report) => report.split(' ').map(
            (level => +level)
        )
    );

    return parsedReports.slice(0, -1);
}

const checkReportSafety = (report: number[]) => {
    const isIncreasing = report[0] < report[1];

    for (let i = 1; i < report.length; i++) {
        if (
            (isIncreasing && report[i - 1] >= report[i]) || 
            (!isIncreasing && report[i - 1] <= report[i]) ||
            Math.abs(report[i - 1] - report[i]) > 3
        ) {
            return false;
        }
    }

    return true;
}

const checkReportSafetyWithProblemDampener = (report: number[]) => {
    if (checkReportSafety(report)) return true;

    for (let i = 0; i < report.length; i++) {
        const testReport = report.toSpliced(i, 1);
        if (checkReportSafety(testReport)) return true;
    }

    return false;
}

const countSafeReports = (reports: number[][], problemDampener: boolean) => {
    let count = 0;

    reports.forEach((report) => {
        const isSafeReport = problemDampener ? checkReportSafetyWithProblemDampener(report) : checkReportSafety(report);
        if (isSafeReport) count ++;
    })

    return count;
}

axios({
    method: 'get',
    url: 'https://adventofcode.com/2024/day/2/input',
    responseType: 'text',
    headers:
        {
            'Cookie': `session=${process.env.SESSION};`
        },
    withCredentials: true,
  })
    .then((response) => {
      const reports = parseData(response.data);
      const safeReportCount = countSafeReports(reports, false);
      const dampenedSafeReportCount = countSafeReports(reports, true);
      console.log(`Number of safe reports: ${safeReportCount}`);
      console.log(`Number of safe reports with Problem Dampener: ${dampenedSafeReportCount}`);
    });

console.log("gay");

