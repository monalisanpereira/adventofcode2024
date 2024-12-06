import axios from 'axios';
import 'dotenv/config';

type Page = number;
type Rule = [Page, Page];
type Update = Page[];

const parseInput = (data: string): string[] => {
    const splitInput = data.split("\n\n");
    return splitInput;
}

const parseRules = (rules: string): Rule[] => {
    const splitRules = rules.split("\n");
    const parsedRules = splitRules.map((rule) => (rule.split("|")).map((number) => +number));
    return parsedRules as Rule[];
}

const parseUpdates = (updates: string): Update[] => {
    const splitUpdates = updates.split("\n").slice(0, -1);
    const parsedUpdates = splitUpdates.map((update) => (update.split(",")).map((number) => +number));
    return parsedUpdates;
}

const isOrderedUpdate = (update: Update, rules: Rule[]): boolean => {
    for (const page of update) {
        for (const rule of rules) {
            if (!rule.includes(page)) continue;

            const pageRuleIndex = rule.indexOf(page);
            const otherPageRuleIndex = pageRuleIndex === 0 ? 1 : 0;
            const otherPage = rule[otherPageRuleIndex];

            if (!update.includes(otherPage)) continue;

            const pageUpdateIndex = update.indexOf(page);
            const otherPageUpdateIndex = update.indexOf(otherPage);

            if (
                (pageUpdateIndex < otherPageUpdateIndex && pageRuleIndex > otherPageRuleIndex) ||
                (pageUpdateIndex > otherPageUpdateIndex && pageRuleIndex < otherPageRuleIndex)
            ) {
                return false;
            }
        }
    }

    return true;
}

const fixUpdate = (update: Update, rules: Rule[]): Update => {
    const fixedUpdate = [update[0]];

    for (let i = 1; i < update.length; i++) {
        const page = update[i];

        for (let j = 0; j < fixedUpdate.length; j++) {
            const fixedPage = fixedUpdate[j];

            for (const rule of rules) {
                if (!rule.includes(page) || !rule.includes(fixedPage)) continue;
                if (rule.indexOf(page) < rule.indexOf(fixedPage)) {
                    fixedUpdate.splice(fixedUpdate.indexOf(fixedPage), 0, page);
                }
                break;
            }

            if (fixedUpdate.includes(page)) break;
        }

        if (!fixedUpdate.includes(page)) {
            fixedUpdate.push(page);
        }
    }

    return fixedUpdate;
}

const getMiddlePage = (update: Update): Page => {
    const middlePageIndex = Math.trunc(update.length / 2);
    return update[middlePageIndex];
}

const getMiddlePagesSum = (updates: Update[], rules: Rule[], correctUpdatesOnly: boolean): number => {
    const middlePages: Page[] = [];

    for (const update of updates) {
        if (correctUpdatesOnly) {
            if (!isOrderedUpdate(update, rules)) continue;
            middlePages.push(getMiddlePage(update));
        } else {
            if (isOrderedUpdate(update, rules)) continue;
            const fixedUpdate = fixUpdate(update, rules);
            middlePages.push(getMiddlePage(fixedUpdate));
        }
    }

    return middlePages.reduce((a, b)  => a + b);
}

axios({
    method: 'get',
    url: 'https://adventofcode.com/2024/day/5/input',
    responseType: 'text',
    headers:
        {
            'Cookie': `session=${process.env.SESSION};`
        },
    withCredentials: true,
  })
    .then((response) => {
        const parsedInput = parseInput(response.data);
        const rules = parseRules(parsedInput[0]);
        const updates = parseUpdates(parsedInput[1]);

        const correctUpdatesMiddlePagesSum = getMiddlePagesSum(updates, rules, true);
        console.log(`The total sum for correct updates is: ${correctUpdatesMiddlePagesSum}`);

        const incorrectUpdatesMiddlePagesSum = getMiddlePagesSum(updates, rules, false);
        console.log(`The total sum for incorrect updates is: ${incorrectUpdatesMiddlePagesSum}`);
    }); 